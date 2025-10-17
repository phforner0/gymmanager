// assets/js/pages/enhanced-dashboard.js - Simplified & fixed dashboard implementation
import { qs, showToast, renderTable } from '../ui.js';
import { apiGet, apiPost } from '../api.js';

export default class EnhancedDashboard {
    constructor() {
        this.kpis = {};
        this.charts = {};
        this.refreshInterval = null;
        this.students = [];
        this.payments = [];
        this.checkins = [];
        this.init();
    }

    async init() {
        try {
            // Ensure mock data exists
            this.ensureMockData();
            // Load data and render UI
            await this.loadDashboardData();
            this.renderKPIs();
            const initialData = this.generateChartData(30); this.initializeCharts(initialData); this.calculateKPIs(); this.renderTimeline(); this.wireChartControls();
            this.setupAutoRefresh();
            this.addDashboardStyles();
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            showToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao carregar dashboard. Dados mock serão gerados.'
            });
            this.generateMockData();
        }
    }

    ensureMockData() {
        if (!localStorage.getItem('gymmanager_data')) {
            // try to use external generator if available, otherwise create a basic mock
            if (typeof window.GymMockData === 'function') {
                try {
                    window.GymMockData();
                } catch (e) {
                    this.generateMockData();
                }
            } else {
                this.generateMockData();
            }
        }
    }

    generateMockData() {
        const students = [];
        for (let i = 1; i <= 50; i++) {
            students.push({
                id: i,
                name: `Aluno ${i}`,
                active: i % 5 !== 0,
                joined: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
            });
        }
        const payments = [];
        for (let i = 1; i <= 30; i++) {
            payments.push({
                id: i,
                studentId: (i % 50) + 1,
                amount: 120.0,
                status: i % 6 === 0 ? 'overdue' : 'paid',
                date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
            });
        }
        const checkins = [];
        for (let i = 0; i < 120; i++) {
            checkins.push({
                id: i+1,
                studentId: (i % 50) + 1,
                timestamp: new Date(Date.now() - i * 3600000).toISOString()
            });
        }
        const payload = { students, payments, checkins };
        localStorage.setItem('gymmanager_data', JSON.stringify(payload));
        return payload;
    }

    async loadDashboardData() {
        try {
            const mockData = JSON.parse(localStorage.getItem('gymmanager_data') || '{}');
            if (mockData && mockData.students) {
                this.students = mockData.students;
                this.payments = mockData.payments || [];
                this.checkins = mockData.checkins || [];
                this.kpis = {
                    totalStudents: this.students.length,
                    activeStudents: this.students.filter(s => s.active).length,
                    revenueMonthly: (this.payments.filter(p => p.status === 'paid').length * 120).toFixed(2),
                    checkinsToday: this.checkins.filter(c => new Date(c.timestamp).toDateString() === new Date().toDateString()).length
                };
            } else {
                // fallback to API mock fetch
                try {
                    const res = await apiGet('/mock/dashboard.json');
                    if (res) {
                        this.kpis = res.kpis || {};
                    }
                } catch (e) {
                    console.warn('No mock data available; using empty values.');
                }
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            showToast({ type: 'warning', title: 'Aviso', message: 'Usando dados de demonstração' });
            const data = this.generateMockData();
            this.students = data.students;
            this.payments = data.payments;
            this.checkins = data.checkins;
            this.kpis = {
                totalStudents: this.students.length,
                activeStudents: this.students.filter(s => s.active).length,
                revenueMonthly: (this.payments.filter(p => p.status === 'paid').length * 120).toFixed(2),
                checkinsToday: this.checkins.filter(c => new Date(c.timestamp).toDateString() === new Date().toDateString()).length
            };
        }
    }

    renderKPIs() {
        try {
            const totalEl = qs('#kpi-total-students');
            const activeEl = qs('#kpi-active-students');
            const revenueEl = qs('#kpi-revenue-monthly');
            const checkinsEl = qs('#kpi-checkins-today');
            if (totalEl) totalEl.textContent = String(this.kpis.totalStudents || 0);
            if (activeEl) activeEl.textContent = String(this.kpis.activeStudents || 0);
            if (revenueEl) revenueEl.textContent = `R$ ${this.kpis.revenueMonthly || '0.00'}`;
            if (checkinsEl) checkinsEl.textContent = String(this.kpis.checkinsToday || 0);
        } catch (e) {
            console.warn('renderKPIs error', e);
        }
    }

    initializeCharts(data) {
        // create a simple members chart and checkins chart if Chart is available
        try {
            const membersCtx = document.getElementById('membersChart');
            if (membersCtx && window.Chart) {
                const membersChart = new Chart(membersCtx, {
                    type: 'line',
                    data: {
                        labels: data.months.map(m => m.label),
                        datasets: [{ label: 'Membros Ativos', data: data.months.map(m => m.members), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true }]
                    },
                    options: { responsive: true }
                });
                this.charts.members = membersChart;
            }
            const checkinsCtx = document.getElementById('checkinsChart');
            if (checkinsCtx && window.Chart) {
                const checkinsChart = new Chart(checkinsCtx, {
                    type: 'bar',
                    data: {
                        labels: data.last7.map(d => d.label),
                        datasets: [{ label: 'Check-ins', data: data.last7.map(d => d.count), backgroundColor: 'rgba(245,158,11,0.6)' }]
                    },
                    options: { responsive: true }
                });
                this.charts.checkins = checkinsChart;
            }
        } catch (e) {
            console.error('initializeCharts error', e);
        }
    }

    generateChartData() {
        // Generate minimal chart data from checkins and students
        const months = [];
        const last7 = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ label: d.toLocaleString('default', { month: 'short' }), members: Math.floor(100 + Math.random() * 80) });
        }
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            last7.push({ label: d.toLocaleDateString(), count: Math.floor(20 + Math.random() * 40) });
        }
        return { months, last7 };
    }


    calculateKPIs() {
        // More detailed KPIs: total, active, inactive, overdue payments, retention estimate
        const students = this.students || [];
        const payments = this.payments || [];
        const checkins = this.checkins || [];
        const total = students.length;
        const active = students.filter(s => s.active).length;
        const inactive = total - active;
        const overdue = payments.filter(p => p.status === 'overdue').length;
        // retention estimate: % of students with at least one checkin in last 30 days
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const activeRecently = new Set(checkins.filter(c => new Date(c.timestamp).getTime() >= cutoff).map(c => c.studentId));
        const retention = total ? Math.round((activeRecently.size / total) * 100) : 0;

        this.kpis = Object.assign({}, this.kpis, {
            totalStudents: total,
            activeStudents: active,
            inactiveStudents: inactive,
            overduePayments: overdue,
            retentionPercent: retention,
            revenueMonthly: (payments.filter(p => p.status === 'paid').reduce((s,p)=>s+ (p.amount||0),0)).toFixed(2),
            checkinsToday: checkins.filter(c => new Date(c.timestamp).toDateString() === new Date().toDateString()).length
        });
    }

    wireChartControls() {
        // look for an element with id 'chart-interval' that can be a select or buttons container
        const el = document.getElementById('chart-interval');
        if (!el) return;
        const handler = async (interval) => {
            // interval in days (7,30,90)
            const data = this.generateChartData(interval);
            if (this.charts.members) {
                this.charts.members.data.labels = data.months.map(m=>m.label);
                this.charts.members.data.datasets[0].data = data.months.map(m=>m.members);
                this.charts.members.update();
            }
            if (this.charts.checkins) {
                this.charts.checkins.data.labels = data.lastDays.map(d=>d.label);
                this.charts.checkins.data.datasets[0].data = data.lastDays.map(d=>d.count);
                this.charts.checkins.update();
            }
        };
        // if select element
        if (el.tagName === 'SELECT') {
            el.addEventListener('change', (e)=> handler(Number(e.target.value)));
        } else {
            // delegate clicks on buttons inside
            el.querySelectorAll('[data-interval]').forEach(btn=>{
                btn.addEventListener('click', ()=> handler(Number(btn.getAttribute('data-interval'))));
            });
        }
    }

    generateChartData(intervalDays=30) {
        // Use actual checkins to build charts.
        const months = [];
        const lastDays = [];
        const now = new Date();
        // monthly series for past 6 months (member count approximation)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString('default', { month: 'short' });
            // approximate members: students who joined before end of month and active flag
            const monthEnd = new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59);
            const members = (this.students || []).filter(s => new Date(s.joined || s.created || 0) <= monthEnd && s.active).length;
            months.push({ label, members });
        }
        // last N days checkins
        const days = Math.max(7, Math.min(intervalDays, 180));
        for (let i = days-1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24*3600*1000);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0);
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23,59,59);
            const count = (this.checkins || []).filter(c => {
                const t = new Date(c.timestamp);
                return t >= start && t <= end;
            }).length;
            lastDays.push({ label: d.toLocaleDateString(), count });
        }
        return { months, last7: lastDays.slice(-7), lastDays };
    }

    renderTimeline(limit=12) {
        const container = document.getElementById('activityTimeline');
        if (!container) return;
        // build recent activities from checkins and payments
        const acts = [];
        (this.checkins || []).slice(-limit*2).forEach(c => {
            acts.push({ type: 'checkin', time: c.timestamp, text: `Check-in: aluno #${c.studentId}` });
        });
        (this.payments || []).slice(-limit*2).forEach(p => {
            acts.push({ type: 'payment', time: p.date || p.timestamp || new Date().toISOString(), text: `Pagamento ${p.status}: R$ ${p.amount || '0.00'}` });
        });
        acts.sort((a,b)=> new Date(b.time) - new Date(a.time));
        container.innerHTML = '';
        acts.slice(0, limit).forEach(a=>{
            const el = document.createElement('div');
            el.className = 'timeline-item card fade-in';
            el.innerHTML = `<div class="timeline-title">${a.text}</div><div class="timeline-time">${new Date(a.time).toLocaleString()}</div>`;
            container.appendChild(el);
        });
    }


    setupAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(async () => {
            await this.loadDashboardData();
            this.renderKPIs();
            const data = this.generateChartData();
            if (this.charts.members) this.charts.members.data.labels = data.months.map(m => m.label);
            if (this.charts.members) this.charts.members.data.datasets[0].data = data.months.map(m => m.members);
            if (this.charts.members) this.charts.members.update();
            if (this.charts.checkins) {
                this.charts.checkins.data.labels = data.last7.map(d => d.label);
                this.charts.checkins.data.datasets[0].data = data.last7.map(d => d.count);
                this.charts.checkins.update();
            }
        }, 60 * 1000);
    }

    addDashboardStyles() {
        // Lightweight inline styles for the dashboard to ensure basic layout
        const styles = document.createElement('style');
        styles.id = 'enhanced-dashboard-styles';
        styles.textContent = `
/* minimal dashboard styles */
.kpi { padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.9); box-shadow: 0 6px 18px rgba(15,23,42,0.06); }
.kpi .value { font-size: 1.6rem; font-weight: 700; }
`;
        document.head.appendChild(styles);
    }
}
