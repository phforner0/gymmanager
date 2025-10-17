// assets/js/pages/students-list.js - VERSÃO COMPLETAMENTE APRIMORADA
import { renderTable, qs, showToast, el } from '../ui.js';
import { apiGet, apiPost } from '../api.js';

const tableWrap = document.querySelector('#studentsTable');

let allData = [];
let currentPage = 1;
let pageSize = 10;
let currentQuery = '';
let sortBy = '';
let filterStatus = 'all'; // all, active, inactive, pending

// Dados persistentes no localStorage
const STORAGE_KEY = 'gym_students_data';
const SETTINGS_KEY = 'gym_students_settings';

// Sistema de cache inteligente
const dataCache = {
    students: new Map(),
    lastUpdate: null,
    isStale: function() {
        return !this.lastUpdate || (Date.now() - this.lastUpdate > 5 * 60 * 1000); // 5 minutos
    }
};

async function loadAllStudents() {
    try {
        // Verificar cache primeiro
        if (!dataCache.isStale() && dataCache.students.size > 0) {
            allData = Array.from(dataCache.students.values());
            applyAndRender();
            return;
        }

        showLoadingState(true);
        
        // Tentar carregar do localStorage primeiro
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            allData = JSON.parse(stored);
        }

        // Depois tentar da API mock
        try {
            const apiData = await apiGet('/students');
            if (Array.isArray(apiData) && apiData.length > 0) {
                allData = apiData;
                // Enriquecer dados com informações adicionais
                allData = enrichStudentData(allData);
                // Salvar no localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
                // Atualizar cache
                dataCache.students.clear();
                allData.forEach(student => dataCache.students.set(student.id, student));
                dataCache.lastUpdate = Date.now();
            }
        } catch (apiError) {
            console.warn('API mock não disponível, usando dados locais:', apiError);
            if (!allData || allData.length === 0) {
                allData = generateMockStudents();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
            }
        }

        applyAndRender();
        updateStats();
        
    } catch (e) {
        showToast({
            type: 'error',
            title: 'Erro',
            message: 'Falha ao carregar lista de alunos.'
        });
        console.error('Erro ao carregar alunos:', e);
        
        // Fallback para dados gerados
        allData = generateMockStudents();
        applyAndRender();
    } finally {
        showLoadingState(false);
    }
}

function enrichStudentData(students) {
    return students.map(student => ({
        ...student,
        id: student.id || generateId(),
        name: student.name || 'Nome não informado',
        email: student.email || '',
        phone: student.phone || '',
        status: student.status || (Math.random() > 0.1 ? 'active' : 'inactive'),
        joinDate: student.joinDate || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastCheckin: student.lastCheckin || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        planType: student.planType || ['Mensal', 'Trimestral', 'Anual'][Math.floor(Math.random() * 3)],
        monthlyFee: student.monthlyFee || (50 + Math.random() * 100),
        paymentStatus: student.paymentStatus || (Math.random() > 0.2 ? 'up-to-date' : 'pending'),
        notes: student.notes || ''
    }));
}

function generateMockStudents() {
    const names = [
        'Ana Silva', 'João Santos', 'Maria Costa', 'Pedro Lima', 'Julia Oliveira',
        'Carlos Pereira', 'Fernanda Souza', 'Ricardo Almeida', 'Camila Rodrigues', 'Bruno Ferreira',
        'Lara Mendes', 'Diego Castro', 'Isabela Ribeiro', 'Lucas Barbosa', 'Mariana Dias',
        'Thiago Cardoso', 'Natália Gomes', 'Gabriel Nascimento', 'Letícia Torres', 'André Moreira'
    ];
    
    const emails = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com'];
    
    return names.map((name, index) => {
        const firstName = name.split(' ')[0].toLowerCase();
        const domain = emails[Math.floor(Math.random() * emails.length)];
        return {
            id: index + 1,
            name: name,
            email: `${firstName}${index + 1}@${domain}`,
            phone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            status: Math.random() > 0.15 ? 'active' : 'inactive',
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lastCheckin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            planType: ['Mensal', 'Trimestral', 'Anual'][Math.floor(Math.random() * 3)],
            monthlyFee: 50 + Math.random() * 100,
            paymentStatus: Math.random() > 0.2 ? 'up-to-date' : 'pending',
            notes: ''
        };
    });
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function showLoadingState(show) {
    const container = tableWrap || document.querySelector('#studentsTable');
    if (!container) return;
    
    if (show) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div style="margin-top: 16px; color: #6b7280;">Carregando alunos...</div>
            </div>
        `;
        
        // Adicionar CSS da animação se não existir
        if (!document.querySelector('#loading-animation')) {
            const style = document.createElement('style');
            style.id = 'loading-animation';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    }
}

function applyAndRender() {
    let data = Array.isArray(allData) ? allData.slice() : [];
    
    // Aplicar filtro de status
    if (filterStatus !== 'all') {
        data = data.filter(s => {
            switch(filterStatus) {
                case 'active': return s.status === 'active';
                case 'inactive': return s.status === 'inactive';
                case 'pending': return s.paymentStatus === 'pending';
                default: return true;
            }
        });
    }
    
    // Aplicar filtro de busca
    if (currentQuery) {
        const q = currentQuery.toLowerCase();
        data = data.filter(s => 
            (s.name || '').toLowerCase().includes(q) ||
            (s.email || '').toLowerCase().includes(q) ||
            (s.phone || '').toLowerCase().includes(q) ||
            (s.planType || '').toLowerCase().includes(q)
        );
    }
    
    // Aplicar ordenação
    if (sortBy) {
        const [key, dir] = sortBy.split(':');
        data.sort((a, b) => {
            let av, bv;
            if (key === 'joinDate' || key === 'lastCheckin') {
                av = new Date(a[key] || 0);
                bv = new Date(b[key] || 0);
            } else if (key === 'monthlyFee') {
                av = parseFloat(a[key]) || 0;
                bv = parseFloat(b[key]) || 0;
            } else {
                av = (a[key] || '').toString().toLowerCase();
                bv = (b[key] || '').toString().toLowerCase();
            }
            
            if (av < bv) return dir === 'asc' ? -1 : 1;
            if (av > bv) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    // Paginação
    const total = data.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > pages) currentPage = pages;
    const start = (currentPage - 1) * pageSize;
    const subset = data.slice(start, start + pageSize);
    
    // Renderizar tabela aprimorada
    renderEnhancedTable(subset);
    
    // Atualizar informações de paginação
    updatePagination(currentPage, pages, total);
    
    // Atualizar contador de bulk actions
    setTimeout(updateBulkCount, 50);
}

function renderEnhancedTable(students) {
    if (!tableWrap) return;
    
    const tableHTML = `
        <div class="enhanced-table-wrapper">
            <table class="table enhanced-table">
                <thead>
                    <tr>
                        <th width="40">
                            <input type="checkbox" id="selectAll" title="Selecionar todos">
                        </th>
                        <th>Aluno</th>
                        <th>Contato</th>
                        <th>Status</th>
                        <th>Plano</th>
                        <th>Último Check-in</th>
                        <th>Pagamento</th>
                        <th width="200">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr class="student-row ${student.status === 'inactive' ? 'inactive-row' : ''}" data-id="${student.id}">
                            <td>
                                <input type="checkbox" class="rowSel" data-id="${student.id}">
                            </td>
                            <td>
                                <div class="student-info">
                                    <div class="student-name">${student.name || 'N/A'}</div>
                                    <div class="student-meta">ID: ${student.id} • Desde: ${formatDate(student.joinDate)}</div>
                                </div>
                            </td>
                            <td>
                                <div class="contact-info">
                                    <div>${student.email || 'N/A'}</div>
                                    <div class="phone">${student.phone || 'N/A'}</div>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge ${student.status}">${getStatusText(student.status)}</span>
                            </td>
                            <td>
                                <div class="plan-info">
                                    <div>${student.planType || 'N/A'}</div>
                                    <div class="plan-fee">R$ ${(student.monthlyFee || 0).toFixed(2)}</div>
                                </div>
                            </td>
                            <td>
                                <span class="checkin-date">${formatDate(student.lastCheckin)}</span>
                            </td>
                            <td>
                                <span class="payment-badge ${student.paymentStatus}">${getPaymentStatusText(student.paymentStatus)}</span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-small btn-view" data-id="${student.id}" title="Ver perfil">👤</button>
                                    <button class="btn-small btn-edit" data-id="${student.id}" title="Editar">✏️</button>
                                    <button class="btn-small btn-checkin" data-id="${student.id}" title="Check-in">✅</button>
                                    <button class="btn-small btn-payment" data-id="${student.id}" title="Pagamento">💳</button>
                                    <button class="btn-small btn-delete" data-id="${student.id}" title="Remover">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    tableWrap.innerHTML = tableHTML;
    
    // Adicionar estilos CSS aprimorados
    addEnhancedTableStyles();
    
    // Wire event handlers
    wireTableEvents();
}

function addEnhancedTableStyles() {
    if (document.querySelector('#enhanced-table-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'enhanced-table-styles';
    style.textContent = `
        .enhanced-table-wrapper {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .enhanced-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        
        .enhanced-table thead {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        
        .enhanced-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .enhanced-table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .student-row:hover {
            background: #f8fafc;
            transform: scale(1.01);
            transition: all 0.2s ease;
        }
        
        .student-row.inactive-row {
            opacity: 0.7;
            background: #fef2f2;
        }
        
        .student-info .student-name {
            font-weight: 600;
            color: #111827;
            margin-bottom: 2px;
        }
        
        .student-info .student-meta {
            font-size: 12px;
            color: #6b7280;
        }
        
        .contact-info .phone {
            font-size: 12px;
            color: #6b7280;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-badge.active {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-badge.inactive {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .plan-info .plan-fee {
            font-size: 12px;
            color: #059669;
            font-weight: 600;
        }
        
        .payment-badge.up-to-date {
            background: #dcfce7;
            color: #166534;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 11px;
        }
        
        .payment-badge.pending {
            background: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 11px;
        }
        
        .action-buttons {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        
        .btn-small {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .btn-small:hover {
            transform: scale(1.1);
        }
        
        .btn-view { background: #dbeafe; }
        .btn-edit { background: #fef3c7; }
        .btn-checkin { background: #dcfce7; }
        .btn-payment { background: #e0e7ff; }
        .btn-delete { background: #fee2e2; }
        
        .checkin-date {
            font-size: 12px;
            color: #6b7280;
        }
    `;
    document.head.appendChild(style);
}

function wireTableEvents() {
    // Select all checkbox
    const selectAll = document.querySelector('#selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.rowSel');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkCount();
        });
    }
    
    // Action buttons
    document.addEventListener('click', async (e) => {
        const target = e.target;
        const studentId = target.getAttribute('data-id');
        
        if (target.classList.contains('btn-view')) {
            window.location.href = `/students/profile.html?id=${studentId}`;
        }
        
        if (target.classList.contains('btn-edit')) {
            openStudentModal(studentId);
        }
        
        if (target.classList.contains('btn-checkin')) {
            await performQuickCheckin(studentId);
        }
        
        if (target.classList.contains('btn-payment')) {
            showPaymentModal(studentId);
        }
        
        if (target.classList.contains('btn-delete')) {
            await deleteStudent(studentId);
        }
        
        if (target.classList.contains('rowSel')) {
            updateBulkCount();
        }
    });
}

async function performQuickCheckin(studentId) {
    const student = allData.find(s => s.id == studentId);
    if (!student) return;
    
    try {
        await apiPost('/checkins', { 
            studentId: studentId,
            studentName: student.name,
            timestamp: new Date().toISOString()
        });
        
        // Atualizar último check-in
        student.lastCheckin = new Date().toISOString().split('T')[0];
        updateLocalStorage();
        applyAndRender();
        
        showToast({
            type: 'success',
            title: 'Check-in realizado',
            message: `${student.name} fez check-in com sucesso!`
        });
        
    } catch (error) {
        console.error('Erro no check-in:', error);
        showToast({
            type: 'error',
            title: 'Erro',
            message: 'Falha ao realizar check-in'
        });
    }
}

function showPaymentModal(studentId) {
    const student = allData.find(s => s.id == studentId);
    if (!student) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Pagamento - ${student.name}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <label>Valor:</label>
                    <input type="number" id="paymentAmount" class="input" value="${student.monthlyFee.toFixed(2)}" step="0.01">
                </div>
                <div style="margin-bottom: 16px;">
                    <label>Método:</label>
                    <select id="paymentMethod" class="input">
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                        <option value="pix">PIX</option>
                        <option value="cash">Dinheiro</option>
                    </select>
                </div>
                <div style="margin-bottom: 16px;">
                    <label>Observações:</label>
                    <textarea id="paymentNotes" class="input" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                <button class="btn primary" id="confirmPayment">Registrar Pagamento</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event handlers
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#confirmPayment').addEventListener('click', async () => {
        const amount = parseFloat(modal.querySelector('#paymentAmount').value);
        const method = modal.querySelector('#paymentMethod').value;
        const notes = modal.querySelector('#paymentNotes').value;
        
        try {
            await apiPost('/payments', {
                studentId: studentId,
                amount: amount,
                method: method,
                notes: notes,
                date: new Date().toISOString().split('T')[0]
            });
            
            // Atualizar status do pagamento
            student.paymentStatus = 'up-to-date';
            updateLocalStorage();
            applyAndRender();
            
            showToast({
                type: 'success',
                title: 'Pagamento registrado',
                message: `Pagamento de R$ ${amount.toFixed(2)} registrado para ${student.name}`
            });
            
            modal.remove();
            
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            showToast({
                type: 'error',
                title: 'Erro',
                message: 'Falha ao registrar pagamento'
            });
        }
    });
}

async function deleteStudent(studentId) {
    const student = allData.find(s => s.id == studentId);
    if (!student) return;
    
    if (!confirm(`Tem certeza que deseja remover ${student.name}?`)) return;
    
    try {
        await apiPost(`/students/${studentId}/delete`, {});
        
        // Remover dos dados locais
        allData = allData.filter(s => s.id != studentId);
        dataCache.students.delete(parseInt(studentId));
        updateLocalStorage();
        applyAndRender();
        
        showToast({
            type: 'success',
            title: 'Aluno removido',
            message: `${student.name} foi removido do sistema`
        });
        
    } catch (error) {
        console.error('Erro ao remover aluno:', error);
        showToast({
            type: 'error',
            title: 'Erro',
            message: 'Falha ao remover aluno'
        });
    }
}

function updateLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

function getStatusText(status) {
    const statusMap = {
        active: 'Ativo',
        inactive: 'Inativo',
        pending: 'Pendente'
    };
    return statusMap[status] || status;
}

function getPaymentStatusText(status) {
    const statusMap = {
        'up-to-date': 'Em dia',
        'pending': 'Pendente',
        'overdue': 'Em atraso'
    };
    return statusMap[status] || status;
}

function updatePagination(currentPage, totalPages, totalRecords) {
    const pageInfo = qs('#pageInfo');
    if (pageInfo) {
        pageInfo.innerHTML = `
            <span>${currentPage}/${totalPages}</span>
            <span style="margin-left: 8px; color: #6b7280; font-size: 12px;">
                (${totalRecords} ${totalRecords === 1 ? 'aluno' : 'alunos'})
            </span>
        `;
    }
    
    const prevBtn = qs('#prevPage');
    const nextBtn = qs('#nextPage');
    
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function updateStats() {
    const activeCount = allData.filter(s => s.status === 'active').length;
    const pendingPayments = allData.filter(s => s.paymentStatus === 'pending').length;
    const totalRevenue = allData.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
    
    // Adicionar estatísticas no topo da página
    const container = document.querySelector('.container');
    if (container && !document.querySelector('#student-stats')) {
        const statsHTML = `
            <div id="student-stats" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-bottom: 16px;
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold;">${allData.length}</div>
                    <div style="opacity: 0.9;">Total de Alunos</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold;">${activeCount}</div>
                    <div style="opacity: 0.9;">Ativos</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: ${pendingPayments > 0 ? '#fbbf24' : 'inherit'}">${pendingPayments}</div>
                    <div style="opacity: 0.9;">Pagamentos Pendentes</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold;">R$ ${totalRevenue.toFixed(0)}</div>
                    <div style="opacity: 0.9;">Receita Potencial</div>
                </div>
            </div>
        `;
        
        const h1 = container.querySelector('h1');
        if (h1) {
            h1.insertAdjacentHTML('afterend', statsHTML);
        }
    }
}

// Funcionalidades de filtro avançado
function addAdvancedFilters() {
    const controlsRow = document.querySelector('.card');
    if (!controlsRow || document.querySelector('#advanced-filters')) return;
    
    const filtersHTML = `
        <div id="advanced-filters" style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 8px;">
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                <select id="statusFilter" class="input">
                    <option value="all">Todos os Status</option>
                    <option value="active">Apenas Ativos</option>
                    <option value="inactive">Apenas Inativos</option>
                    <option value="pending">Pagamento Pendente</option>
                </select>
                <select id="planFilter" class="input">
                    <option value="">Todos os Planos</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                </select>
                <button id="clearFilters" class="btn">Limpar Filtros</button>
                <button id="exportStudents" class="btn">📊 Exportar Lista</button>
                <button id="addStudent" class="btn primary">➕ Novo Aluno</button>
            </div>
        </div>
    `;
    
    controlsRow.insertAdjacentHTML('afterend', filtersHTML);
    
    // Wire filter events
    const statusFilter = qs('#statusFilter');
    const planFilter = qs('#planFilter');
    const clearFilters = qs('#clearFilters');
    const exportBtn = qs('#exportStudents');
    const addBtn = qs('#addStudent');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterStatus = e.target.value;
            currentPage = 1;
            applyAndRender();
        });
    }
    
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            filterStatus = 'all';
            currentQuery = '';
            sortBy = '';
            if (qs('#q')) qs('#q').value = '';
            if (statusFilter) statusFilter.value = 'all';
            if (planFilter) planFilter.value = '';
            if (qs('#sortBy')) qs('#sortBy').value = '';
            currentPage = 1;
            applyAndRender();
            
            showToast({
                type: 'info',
                title: 'Filtros limpos',
                message: 'Todos os filtros foram removidos'
            });
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportStudentsList);
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = '/students/profile.html?new=1';
        });
    }
}

function exportStudentsList() {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Plano', 'Mensalidade', 'Último Check-in', 'Status Pagamento'];
    const rows = allData.map(student => [
        student.name || '',
        student.email || '',
        student.phone || '',
        getStatusText(student.status),
        student.planType || '',
        `R$ ${(student.monthlyFee || 0).toFixed(2)}`,
        formatDate(student.lastCheckin),
        getPaymentStatusText(student.paymentStatus)
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alunos-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast({
        type: 'success',
        title: 'Exportado',
        message: `Lista de ${allData.length} alunos exportada com sucesso!`
    });
}

// Inicialização principal
document.addEventListener('DOMContentLoaded', () => {
    // Wire existing controls
    const q = qs('#q');
    const btn = qs('#btnSearch');
    const pageSizeSel = qs('#pageSize');
    const prev = qs('#prevPage');
    const next = qs('#nextPage');
    const sortSel = qs('#sortBy');
    
    if (pageSizeSel) {
        pageSizeSel.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 10;
            currentPage = 1;
            applyAndRender();
        });
    }
    
    if (prev) {
        prev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                applyAndRender();
            }
        });
    }
    
    if (next) {
        next.addEventListener('click', () => {
            currentPage++;
            applyAndRender();
        });
    }
    
    if (sortSel) {
        sortSel.innerHTML = `
            <option value="">Ordenar por...</option>
            <option value="name:asc">Nome A-Z</option>
            <option value="name:desc">Nome Z-A</option>
            <option value="joinDate:desc">Mais recentes</option>
            <option value="joinDate:asc">Mais antigos</option>
            <option value="lastCheckin:desc">Último check-in</option>
            <option value="monthlyFee:desc">Maior mensalidade</option>
            <option value="monthlyFee:asc">Menor mensalidade</option>
        `;
        
        sortSel.addEventListener('change', (e) => {
            sortBy = e.target.value;
            applyAndRender();
        });
    }
    
    if (btn) {
        btn.addEventListener('click', () => {
            currentQuery = q ? q.value.trim() : '';
            currentPage = 1;
            applyAndRender();
        });
    }
    
    if (q) {
        q.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentQuery = q.value.trim();
                currentPage = 1;
                applyAndRender();
            }
        });
        
        // Busca em tempo real
        q.addEventListener('input', debounce((e) => {
            currentQuery = e.target.value.trim();
            currentPage = 1;
            applyAndRender();
        }, 300));
    }
    
    // Load initial data and setup
    loadAllStudents().then(() => {
        addAdvancedFilters();
        
        // Auto-refresh a cada 5 minutos
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadAllStudents();
            }
        }, 5 * 60 * 1000);
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateBulkCount() {
    const sels = Array.from(document.querySelectorAll('.rowSel')).filter(i => i.checked);
    const toolbar = qs('#bulkToolbar');
    const count = qs('#bulkCount');
    
    if (sels.length > 0) {
        if (toolbar) toolbar.style.display = 'flex';
        if (count) count.textContent = `${sels.length} selecionado${sels.length > 1 ? 's' : ''}`;
    } else {
        if (toolbar) toolbar.style.display = 'none';
    }
}

function getSelectedIds() {
    return Array.from(document.querySelectorAll('.rowSel'))
        .filter(i => i.checked)
        .map(i => parseInt(i.getAttribute('data-id'), 10));
}

// Bulk actions handlers (keeping existing ones but enhancing them)
document.addEventListener('DOMContentLoaded', () => {
    const act = qs('#btnBulkActivate');
    const deact = qs('#btnBulkDeactivate');
    const mail = qs('#btnBulkEmail');
    
    if (act) {
        act.addEventListener('click', async () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return showToast({ type: 'info', title: 'Info', message: 'Nenhum aluno selecionado' });
            
            try {
                await apiPost('/students/bulk', { action: 'activate', ids });
                
                ids.forEach(id => {
                    const student = allData.find(s => s.id == id);
                    if (student) student.status = 'active';
                });
                
                updateLocalStorage();
                applyAndRender();
                
                showToast({
                    type: 'success',
                    title: 'Sucesso',
                    message: `${ids.length} aluno${ids.length > 1 ? 's' : ''} ativado${ids.length > 1 ? 's' : ''}.`
                });
            } catch (e) {
                console.error(e);
                showToast({ type: 'error', title: 'Erro', message: 'Falha na ativação.' });
            }
        });
    }
    
    if (deact) {
        deact.addEventListener('click', async () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return showToast({ type: 'info', title: 'Info', message: 'Nenhum aluno selecionado' });
            
            if (!confirm(`Tem certeza que deseja inativar ${ids.length} aluno${ids.length > 1 ? 's' : ''}?`)) return;
            
            try {
                await apiPost('/students/bulk', { action: 'deactivate', ids });
                
                ids.forEach(id => {
                    const student = allData.find(s => s.id == id);
                    if (student) student.status = 'inactive';
                });
                
                updateLocalStorage();
                applyAndRender();
                
                showToast({
                    type: 'success',
                    title: 'Sucesso',
                    message: `${ids.length} aluno${ids.length > 1 ? 's' : ''} inativado${ids.length > 1 ? 's' : ''}.`
                });
            } catch (e) {
                console.error(e);
                showToast({ type: 'error', title: 'Erro', message: 'Falha na inativação.' });
            }
        });
    }
    
    if (mail) {
        mail.addEventListener('click', async () => {
            const ids = getSelectedIds();
            if (ids.length === 0) return showToast({ type: 'info', title: 'Info', message: 'Nenhum aluno selecionado' });
            
            try {
                await apiPost('/students/bulk', { action: 'email', ids });
                showToast({
                    type: 'success',
                    title: 'E-mails enviados',
                    message: `E-mails enfileirados para ${ids.length} aluno${ids.length > 1 ? 's' : ''}.`
                });
            } catch (e) {
                console.error(e);
                showToast({ type: 'error', title: 'Erro', message: 'Falha ao enviar e-mails.' });
            }
        });
    }
});

// Existing modal logic (enhanced)
let editingId = null;

function openStudentModal(id) {
    editingId = id;
    const student = allData.find(s => s.id == id);
    
    const modal = qs('#studentModal');
    if (!modal) return;
    
    const nameIn = qs('#modal_name');
    const emailIn = qs('#modal_email');
    const phoneIn = qs('#modal_phone');
    
    if (student) {
        if (nameIn) nameIn.value = student.name || '';
        if (emailIn) emailIn.value = student.email || '';
        if (phoneIn) phoneIn.value = student.phone || '';
    }
    
    modal.style.display = 'block';
}

function closeStudentModal() {
    const modal = qs('#studentModal');
    if (modal) modal.style.display = 'none';
    editingId = null;
}

// Wire existing modal events
document.addEventListener('click', (e) => {
    if (e.target && e.target.matches('.btn.editStudent')) {
        const id = e.target.getAttribute('data-id');
        openStudentModal(id);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const save = qs('#modalSave');
    const cancel = qs('#modalCancel');
    
    if (cancel) cancel.addEventListener('click', closeStudentModal);
    
    if (save) {
        save.addEventListener('click', async () => {
            const name = qs('#modal_name')?.value.trim();
            const email = qs('#modal_email')?.value.trim();
            const phone = qs('#modal_phone')?.value.trim();
            
            if (!name) {
                return showToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
            }
            
            try {
                await apiPost(`/students/${editingId}`, { name, email, phone });
                
                const student = allData.find(s => s.id == editingId);
                if (student) {
                    student.name = name;
                    student.email = email;
                    student.phone = phone;
                }
                
                updateLocalStorage();
                applyAndRender();
                closeStudentModal();
                
                showToast({
                    type: 'success',
                    title: 'Salvo',
                    message: 'Dados do aluno atualizados com sucesso.'
                });
            } catch (e) {
                console.error(e);
                showToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar dados.' });
            }
        });
    }
});