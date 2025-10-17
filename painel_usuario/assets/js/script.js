// Auth check
    //const logged = (() => { try { return JSON.parse(localStorage.getItem('logged_user')); } catch(e){ return null } })();
    //if(!logged || !logged.email){
    //  alert('Usuário não autenticado. Você será redirecionado.');
    //  setTimeout(()=>{ window.location.href = '../index.html'; }, 400);
     // throw new Error('not authenticated');
   // }

   const logged = (() => {
    try {
      return JSON.parse(localStorage.getItem('logged_user'));
    } catch (e) {
      return null;
    }
  })() || { email: 'teste@impacto.local', name: 'Usuário Impacto' };

  const userEmail = logged?.email || 'teste@impacto.local';
  const STORAGE_KEY = 'ai_enhanced_data_v2';

    // Sample data structure
    const defaultData = {
      profile: {email:userEmail, name:'Usuário Impacto', role:'user', plan:'Mensal', expires:'2025-12-31', level:5},
      workouts: [
        {id:'w1', name:'Peito & Tríceps', day:'Seg', category:'Hipertrofia', exercises:['Supino reto 4x8','Supino inclinado 3x10','Crucifixo 3x12','Tríceps testa 3x12'], tags:['peito','triceps'], completed:false, completedDates:[]},
        {id:'w2', name:'Costas & Bíceps', day:'Qua', category:'Hipertrofia', exercises:['Barra fixa 4x8','Remada curvada 4x8','Pulley 3x12','Rosca direta 3x10'], tags:['costas','biceps'], completed:true, completedDates:[Date.now()-2*86400000]}
      ],
      measurements: [
        {date:Date.now()-30*86400000, weight:75, chest:100, waist:80, arm:38, thigh:55, notes:'Medida inicial'}
      ],
      achievements: [
        {id:'first', name:'Primeiro Treino', icon:'🎯', unlocked:true, date:Date.now()-30*86400000},
        {id:'week', name:'7 Dias Seguidos', icon:'🔥', unlocked:true, date:Date.now()-7*86400000},
        {id:'month', name:'30 Treinos', icon:'💪', unlocked:false},
        {id:'pr', name:'Recorde Pessoal', icon:'🏆', unlocked:false}
      ],
      notes: '',
      volume: 0,
      streak: 7
    };

    // Storage helpers
    function getStorage(){
      const raw = localStorage.getItem(STORAGE_KEY);
      try { return raw ? JSON.parse(raw) : {}; } catch(e){ return {}; }
    }
    function saveStorage(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    function getUserData(){
      const all = getStorage();
      if(all[userEmail]) return all[userEmail];
      all[userEmail] = defaultData; saveStorage(all); return all[userEmail];
    }
    function setUserData(data){ const all = getStorage(); all[userEmail]=data; saveStorage(all); }

    let data = getUserData();

    // Theme toggle
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

    // Tab system
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', ()=>{
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
      });
    });

    // Render functions
    function renderProfile(){
      document.getElementById('u-name').textContent = data.profile.name || 'Usuário';
      document.getElementById('u-email').textContent = data.profile.email;
      document.getElementById('u-plan').textContent = data.profile.plan || 'Mensal';
      document.getElementById('plan-exp').textContent = data.profile.expires;
    }

    function renderStats(){
      const total = data.workouts.length;
      const done = data.workouts.filter(w=>w.completed).length;
      const percent = total > 0 ? Math.round((done/total)*100) : 0;
      
      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-done').textContent = done;
      document.getElementById('stat-streak').textContent = data.streak || 0;
      document.getElementById('stat-volume').textContent = (data.volume || 0).toLocaleString();
      document.getElementById('progress-done').style.width = percent + '%';
      
      // Weekly change
      const weekAgo = Date.now() - 7*86400000;
      const thisWeek = data.workouts.filter(w => w.completedDates?.some(d => d > weekAgo)).length;
      document.getElementById('stat-total-change').textContent = `↗ +${thisWeek} esta semana`;
    }

    function renderWorkouts(){
      const container = document.getElementById('workouts-list');
      container.innerHTML = '';
      
      if(!data.workouts.length){
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg><h3>Nenhum treino ainda</h3><p>Crie seu primeiro treino para começar!</p></div>';
        return;
      }

      data.workouts.forEach(w => {
        const div = document.createElement('div');
        div.className = 'workout-item';
        div.innerHTML = `
          <div class="workout-header">
            <div class="workout-title">${w.name}</div>
            <span class="badge ${w.category === 'Força' ? 'warning' : w.category === 'Cardio' ? 'info' : 'primary'}">${w.category || 'Geral'}</span>
          </div>
          <div class="workout-meta">
            <span>📅 ${w.day}</span>
            <span>💪 ${w.exercises?.length || 0} exercícios</span>
            <span>${w.completedDates?.length || 0}x realizado</span>
          </div>
          ${w.tags?.length ? '<div style="margin:8px 0">' + w.tags.map(t => `<span class="tag">${t}</span>`).join('') + '</div>' : ''}
          <div class="workout-actions">
            <button class="btn sm ${w.completed ? 'success' : 'ghost'}" onclick="toggleComplete('${w.id}')">${w.completed ? '✓ Concluído' : 'Marcar'}</button>
            <button class="btn sm ghost" onclick="viewWorkout('${w.id}')">👁️ Ver</button>
            <button class="btn sm ghost" onclick="editWorkout('${w.id}')">✏️ Editar</button>
            <button class="btn sm ghost" onclick="deleteWorkout('${w.id}')">🗑️</button>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderMeasurements(){
      const container = document.getElementById('measurements-list');
      container.innerHTML = '';
      
      if(!data.measurements.length){
        container.innerHTML = '<div class="empty-state"><p>Nenhuma medida registrada</p></div>';
        return;
      }

      const sorted = [...data.measurements].sort((a,b) => b.date - a.date);
      sorted.forEach((m, idx) => {
        const date = new Date(m.date).toLocaleDateString();
        const prev = sorted[idx + 1];
        
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '12px';
        div.innerHTML = `
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <strong>${date}</strong>
            ${prev ? `<span class="muted">vs anterior</span>` : ''}
          </div>
          <div class="grid grid-3">
            <div><div class="muted">Peso</div><div style="font-weight:700">${m.weight || '-'} kg ${prev && m.weight ? `<span class="badge ${m.weight > prev.weight ? 'warning' : 'success'}">${(m.weight - prev.weight).toFixed(1)}</span>` : ''}</div></div>
            <div><div class="muted">Peito</div><div style="font-weight:700">${m.chest || '-'} cm</div></div>
            <div><div class="muted">Cintura</div><div style="font-weight:700">${m.waist || '-'} cm</div></div>
            <div><div class="muted">Braço</div><div style="font-weight:700">${m.arm || '-'} cm</div></div>
            <div><div class="muted">Coxa</div><div style="font-weight:700">${m.thigh || '-'} cm</div></div>
            <div><div class="muted">IMC</div><div style="font-weight:700">${m.weight && m.height ? (m.weight / Math.pow(m.height/100, 2)).toFixed(1) : '-'}</div></div>
          </div>
          ${m.notes ? `<div style="margin-top:12px;padding:8px;background:var(--glass);border-radius:8px;font-size:0.9rem">${m.notes}</div>` : ''}
        `;
        container.appendChild(div);
      });
    }

    function renderCalendar(){
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;
      
      const grid = document.getElementById('calendar-grid');
      grid.innerHTML = '';
      
      ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].forEach(day => {
        const el = document.createElement('div');
        el.className = 'calendar-day header';
        el.textContent = day;
        grid.appendChild(el);
      });
      
      for(let i = 0; i < firstDay; i++){
        grid.appendChild(document.createElement('div'));
      }
      
      const completedDates = new Set();
      data.workouts.forEach(w => {
        w.completedDates?.forEach(d => {
          const date = new Date(d);
          if(date.getMonth() === month && date.getFullYear() === year){
            completedDates.add(date.getDate());
          }
        });
      });
      
      for(let day = 1; day <= daysInMonth; day++){
        const el = document.createElement('div');
        el.className = 'calendar-day';
        if(day === now.getDate()) el.classList.add('today');
        if(completedDates.has(day)) el.classList.add('completed');
        el.textContent = day;
        grid.appendChild(el);
      }
      
      const monthlyCompleted = completedDates.size;
      const monthlyGoal = 12;
      document.getElementById('monthly-goal').textContent = `${monthlyCompleted}/${monthlyGoal}`;
      document.getElementById('monthly-progress').style.width = Math.min((monthlyCompleted/monthlyGoal)*100, 100) + '%';
    }

    function renderAchievements(){
      const container = document.getElementById('achievements-list');
      container.innerHTML = '';
      
      data.achievements.forEach(a => {
        const div = document.createElement('div');
        div.className = 'achievement';
        div.style.opacity = a.unlocked ? '1' : '0.4';
        div.innerHTML = `
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-info">
            <h4>${a.name} ${a.unlocked ? '✓' : '🔒'}</h4>
            <p>${a.unlocked ? 'Desbloqueado em ' + new Date(a.date).toLocaleDateString() : 'Continue treinando para desbloquear'}</p>
          </div>
        `;
        container.appendChild(div);
      });
    }

        function renderChart(){
        const canvas = document.getElementById('chart-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth || 600;
        canvas.height = 250;

        // obter cores das CSS vars
        const cs = getComputedStyle(document.documentElement);
        const accent = (cs.getPropertyValue('--accent') || '#ef4444').trim();
        const muted = (cs.getPropertyValue('--muted') || '#6b7280').trim();

        // preparar dados últimos 7 dias
        const last7Days = [];
        for(let i = 6; i >= 0; i--){
          const date = new Date(Date.now() - i*86400000);
          const count = data.workouts.filter(w =>
            w.completedDates?.some(d => new Date(d).toDateString() === date.toDateString())
          ).length;
          last7Days.push({date: date.toLocaleDateString('pt-BR', {weekday:'short'}), count});
        }

        const max = Math.max(...last7Days.map(d => d.count), 1);
        const padding = 20;
        const usableWidth = canvas.width - padding * 2;
        const barWidth = usableWidth / last7Days.length * 0.6;
        const gap = (usableWidth / last7Days.length) * 0.4;

        // limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.textBaseline = 'top';
        ctx.font = '12px Inter, Arial';

        last7Days.forEach((day, i) => {
          const height = (day.count / max) * 160; // escala
          const x = padding + i * (barWidth + gap) + gap/2;
          const y = 200 - height;

          // barra
          ctx.fillStyle = accent;
          ctx.fillRect(x, y, barWidth, height);

          // contador acima
          ctx.fillStyle = muted;
          ctx.fillText(String(day.count), x + barWidth/2 - 6, y - 18);

          // label embaixo
          ctx.fillStyle = muted;
          ctx.fillText(day.date, x, 205);
        });
      }


    // CRUD operations
    window.toggleComplete = function(id){
      const w = data.workouts.find(x => x.id === id);
      if(!w) return;
      w.completed = !w.completed;
      if(w.completed){
        w.completedDates = w.completedDates || [];
        w.completedDates.push(Date.now());
        data.volume += 1000; // Mock volume
        data.streak = calculateStreak();
        checkAchievements();
      }
      setUserData(data);
      renderAll();
    };

    window.editWorkout = function(id){
      const w = data.workouts.find(x => x.id === id);
      if(!w) return;
      editingId = id;
      document.getElementById('modal-title').textContent = 'Editar Treino';
      document.getElementById('w-name').value = w.name;
      document.getElementById('w-day').value = w.day;
      document.getElementById('w-category').value = w.category || 'Hipertrofia';
      document.getElementById('w-exercises').value = (w.exercises || []).join('\n');
      document.getElementById('w-tags').value = (w.tags || []).join(', ');
      document.getElementById('modal-workout').classList.add('active');
    };

    window.viewWorkout = function(id){
      const w = data.workouts.find(x => x.id === id);
      if(!w) return;
      alert(`${w.name}\n\nExercícios:\n${w.exercises.join('\n')}\n\nRealizado: ${w.completedDates?.length || 0}x`);
    };

    window.deleteWorkout = function(id){
      if(!confirm('Remover este treino?')) return;
      data.workouts = data.workouts.filter(w => w.id !== id);
      setUserData(data);
      renderAll();
    };

    function calculateStreak(){
      const today = new Date().setHours(0,0,0,0);
      let streak = 0;
      let checkDate = today;
      
      while(true){
        const hasWorkout = data.workouts.some(w => 
          w.completedDates?.some(d => new Date(d).setHours(0,0,0,0) === checkDate)
        );
        if(!hasWorkout) break;
        streak++;
        checkDate -= 86400000;
      }
      return streak;
    }

    function checkAchievements(){
      const totalCompleted = data.workouts.reduce((sum, w) => sum + (w.completedDates?.length || 0), 0);
      
      if(totalCompleted >= 1) unlockAchievement('first');
      if(data.streak >= 7) unlockAchievement('week');
      if(totalCompleted >= 30) unlockAchievement('month');
    }

    function unlockAchievement(id){
      const a = data.achievements.find(x => x.id === id);
      if(a && !a.unlocked){
        a.unlocked = true;
        a.date = Date.now();
        alert(`🎉 Conquista desbloqueada: ${a.name}!`);
      }
    }

    // Modal handling
    let editingId = null;
    
    document.getElementById('btn-new-workout').addEventListener('click', ()=>{
      editingId = null;
      document.getElementById('modal-title').textContent = 'Novo Treino';
      document.getElementById('workout-form').reset();
      document.getElementById('modal-workout').classList.add('active');
    });

    document.getElementById('modal-close').addEventListener('click', ()=>{
      document.getElementById('modal-workout').classList.remove('active');
    });

    document.getElementById('cancel-workout').addEventListener('click', ()=>{
      document.getElementById('modal-workout').classList.remove('active');
    });

    document.getElementById('workout-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      const workout = {
        id: editingId || 'w' + Date.now(),
        name: document.getElementById('w-name').value,
        day: document.getElementById('w-day').value,
        category: document.getElementById('w-category').value,
        exercises: document.getElementById('w-exercises').value.split('\n').map(s=>s.trim()).filter(Boolean),
        tags: document.getElementById('w-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
        completed: false,
        completedDates: editingId ? data.workouts.find(w=>w.id===editingId)?.completedDates || [] : []
      };
      
      if(editingId){
        const idx = data.workouts.findIndex(w => w.id === editingId);
        data.workouts[idx] = workout;
      } else {
        data.workouts.unshift(workout);
      }
      
      setUserData(data);
      renderAll();
      document.getElementById('modal-workout').classList.remove('active');
    });

    // Measurements
    document.getElementById('btn-add-measurement').addEventListener('click', ()=>{
      document.getElementById('modal-measurement').classList.add('active');
    });

    document.getElementById('measurement-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      const measurement = {
        date: Date.now(),
        weight: parseFloat(document.getElementById('m-weight').value) || null,
        height: parseFloat(document.getElementById('m-height').value) || null,
        chest: parseFloat(document.getElementById('m-chest').value) || null,
        waist: parseFloat(document.getElementById('m-waist').value) || null,
        arm: parseFloat(document.getElementById('m-arm').value) || null,
        thigh: parseFloat(document.getElementById('m-thigh').value) || null,
        notes: document.getElementById('m-notes').value
      };
      
      data.measurements.unshift(measurement);
      setUserData(data);
      renderMeasurements();
      document.getElementById('modal-measurement').classList.remove('active');
      document.getElementById('measurement-form').reset();
    });

    // Timer
    let timerInterval = null;
    let timerSeconds = 0;
    
    function updateTimerDisplay(){
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      document.getElementById('timer-display').textContent = 
        `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }

    document.getElementById('timer-30').addEventListener('click', ()=>{ timerSeconds = 30; updateTimerDisplay(); });
    document.getElementById('timer-60').addEventListener('click', ()=>{ timerSeconds = 60; updateTimerDisplay(); });
    document.getElementById('timer-90').addEventListener('click', ()=>{ timerSeconds = 90; updateTimerDisplay(); });
    document.getElementById('timer-120').addEventListener('click', ()=>{ timerSeconds = 120; updateTimerDisplay(); });

    document.getElementById('timer-start').addEventListener('click', ()=>{
      if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timer-start').textContent = '▶ Iniciar';
        return;
      }
      
      document.getElementById('timer-start').textContent = '⏸ Pausar';
      timerInterval = setInterval(()=>{
        if(timerSeconds > 0){
          timerSeconds--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          document.getElementById('timer-start').textContent = '▶ Iniciar';
          alert('⏰ Tempo de descanso finalizado!');
        }
      }, 1000);
    });

    document.getElementById('timer-reset').addEventListener('click', ()=>{
      clearInterval(timerInterval);
      timerInterval = null;
      timerSeconds = 0;
      updateTimerDisplay();
      document.getElementById('timer-start').textContent = '▶ Iniciar';
    });

    // 1RM Calculator (Epley formula)
    document.getElementById('calc-rm').addEventListener('click', ()=>{
      const weight = parseFloat(document.getElementById('rm-weight').value);
      const reps = parseInt(document.getElementById('rm-reps').value);
      
      if(!weight || !reps || reps < 1){
        alert('Preencha peso e repetições válidos');
        return;
      }
      
      const oneRM = weight * (1 + reps / 30);
      document.getElementById('rm-result').innerHTML = `
        <div style="color:var(--accent)">1RM estimado: ${oneRM.toFixed(1)} kg</div>
        <div style="font-size:0.9rem;margin-top:8px">
          <div>85%: ${(oneRM * 0.85).toFixed(1)} kg (5-6 reps)</div>
          <div>75%: ${(oneRM * 0.75).toFixed(1)} kg (8-10 reps)</div>
          <div>65%: ${(oneRM * 0.65).toFixed(1)} kg (12-15 reps)</div>
        </div>
      `;
    });

    // Notes
    document.getElementById('save-notes').addEventListener('click', ()=>{
      data.notes = document.getElementById('notes').value;
      setUserData(data);
      alert('✓ Notas salvas com sucesso!');
    });

    // Export/Import
    document.getElementById('btn-export').addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `impacto_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import').addEventListener('click', ()=>{
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        try {
          const text = await file.text();
          const imported = JSON.parse(text);
          if(!imported.workouts) throw new Error('Invalid format');
          data = imported;
          setUserData(data);
          renderAll();
          alert('✓ Dados importados com sucesso!');
        } catch(err){
          alert('❌ Erro ao importar arquivo');
        }
      };
      input.click();
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', ()=>{
      if(confirm('Deseja realmente sair?')){
        localStorage.removeItem('logged_user');
        window.location.href = '../index.html';
      }
    });

    // Render all
    function renderAll(){
      renderProfile();
      renderStats();
      renderWorkouts();
      renderMeasurements();
      renderCalendar();
      renderAchievements();
      renderChart();
      document.getElementById('notes').value = data.notes || '';
    }

    // Initial render
    renderAll();