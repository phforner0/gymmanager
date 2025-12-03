import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData, Workout, Measurement, Achievement, Goal } from '../types';
import { storage } from '../services';
import { useToast } from '../hooks';
import { useAuth } from '../../../LandingPage/context/AuthContext';

// Layout Components
import { Header } from '../components/layout/Header';
import { MobileMenu } from '../components/layout/MobileMenu';
import { ProfileCard } from '../components/layout/ProfileCard';
import { StatsGrid } from '../components/layout/StatsGrid';
import { TabNavigation } from '../components/layout/TabNavigation';

// Common Components
import { Modal, Toast } from '../components/common';

// Feature Components
import { 
  WorkoutFilters, 
  WorkoutsList, 
  WorkoutForm 
} from '../components/workouts';

import { 
  MeasurementsList, 
  MeasurementForm 
} from '../components/measurements';

import { 
  GoalsList, 
  GoalForm,
  TimerCard,
  RMCalculator,
  NotesCard
} from '../components/goals';

import { ProgressChart } from '../components/progress';
import { CalendarView } from '../components/calendar';
import { AchievementsList } from '../components/achievements';
import { AnalyticsView } from '../components/analytics';

interface WorkoutFormData {
  name: string;
  day: string;
  category: string;
  exercises: string;
  tags: string;
}

interface MeasurementFormData {
  weight: string;
  height: string;
  chest: string;
  waist: string;
  arm: string;
  thigh: string;
  notes: string;
}

interface GoalFormData {
  title: string;
  type: 'weight' | 'workouts' | 'streak' | 'measurements';
  target: string;
  deadline: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout: authLogout, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [data, setData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('workouts');
  
  // Modal states
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Calendar states
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{ 
    day: number; 
    workouts: Workout[] 
  } | null>(null);
  
  const { toast, showToast } = useToast();

  // Verificar autenticação e carregar dados
  useEffect(() => {
    const initializeDashboard = async () => {
      // Se ainda está carregando a autenticação, aguardar
      if (authLoading) return;

      // Se não há usuário, redirecionar para login
      if (!user) {
        showToast('⚠️ Você precisa fazer login');
        navigate('/login');
        return;
      }

      try {
        // Ativar modo Supabase com o ID do usuário autenticado
        storage.enableSupabase(user.id);
        
        // Carregar dados do usuário
        const userData = await storage.getUserData(user.email);
        setData(userData);
        setIsInitialized(true);
        
        console.log('✅ Dashboard inicializado com Supabase para:', user.email);
      } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        showToast('❌ Erro ao carregar dados');
      }
    };

    initializeDashboard();
  }, [user, authLoading, navigate, showToast]);

  // Salvar dados quando mudarem
  useEffect(() => {
    const saveData = async () => {
      if (!user || !data || !isInitialized) return;
      
      try {
        await storage.setUserData(user.email, data);
      } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
      }
    };

    saveData();
  }, [data, user, isInitialized]);

  // Update goals automatically
  useEffect(() => {
    if (!data) return;

    setData(prev => {
      if (!prev) return prev;
      
      const updatedGoals = prev.goals.map(goal => {
        let current = goal.current;
        
        if (goal.type === 'workouts') {
          current = prev.workouts.reduce((sum, w) => sum + (w.completedDates?.length || 0), 0);
        } else if (goal.type === 'streak') {
          current = prev.streak;
        } else if (goal.type === 'weight' && prev.measurements.length > 0) {
          current = prev.measurements[0].weight || current;
        }
        
        return { ...goal, current };
      });
      
      return { ...prev, goals: updatedGoals };
    });
  }, [data?.workouts, data?.streak, data?.measurements]);

  // Calculate streak
  const calculateStreak = useCallback((workouts: Workout[]): number => {
    const today = new Date().setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = today;
    
    // Limitar loop para evitar infinite loop
    const MAX_DAYS = 365;
    let daysChecked = 0;
    
    while (daysChecked < MAX_DAYS) {
      const hasWorkout = workouts.some(w =>
        w.completedDates?.some(d => new Date(d).setHours(0, 0, 0, 0) === checkDate)
      );
      if (!hasWorkout) break;
      streak++;
      checkDate -= 86400000;
      daysChecked++;
    }
    return streak;
  }, []);

  // Check achievements
  const checkAchievements = useCallback((currentData: UserData) => {
    const totalCompleted = currentData.workouts.reduce((sum, w) => sum + w.completedDates.length, 0);
    
    const unlocks: Achievement[] = [];
    if (totalCompleted >= 1) unlocks.push(currentData.achievements.find(a => a.id === 'first')!);
    if (currentData.streak >= 7) unlocks.push(currentData.achievements.find(a => a.id === 'week')!);
    if (totalCompleted >= 30) unlocks.push(currentData.achievements.find(a => a.id === 'month')!);
    
    unlocks.forEach(a => {
      if (a && !a.unlocked) {
        a.unlocked = true;
        a.date = Date.now();
        showToast(`🎉 Conquista desbloqueada: ${a.name}!`);
      }
    });
  }, [showToast]);

  // Toggle workout completion
  const toggleComplete = useCallback((id: string) => {
    if (!data) return;
    
    setData(prev => {
      if (!prev) return prev;
      
      const workouts = prev.workouts.map(w => {
        if (w.id === id) {
          const completed = !w.completed;
          const completedDates = completed 
            ? [...w.completedDates, Date.now()]
            : w.completedDates;
          return { ...w, completed, completedDates };
        }
        return w;
      });
      
      const volume = prev.volume + (workouts.find(w => w.id === id)?.completed ? 1000 : -1000);
      const streak = calculateStreak(workouts);
      checkAchievements({ ...prev, workouts, volume, streak });
      
      return { ...prev, workouts, volume, streak };
    });
  }, [data, calculateStreak, checkAchievements]);

  // Save workout
  const saveWorkout = useCallback((formData: WorkoutFormData) => {
    if (!data || !user) return;
    
    const workout: Workout = {
      id: editingWorkout?.id || 'w' + Date.now(),
      user_id: user.id,
      name: formData.name,
      day: formData.day,
      category: formData.category,
      exercises: formData.exercises.split('\n').map((s: string) => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      completed: editingWorkout?.completed || false,
      completedDates: editingWorkout?.completedDates || []
    };

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workouts: editingWorkout
          ? prev.workouts.map(w => w.id === editingWorkout.id ? workout : w)
          : [workout, ...prev.workouts]
      };
    });

    setShowWorkoutModal(false);
    setEditingWorkout(null);
    showToast(editingWorkout ? '✅ Treino atualizado' : '✅ Treino criado');
  }, [data, user, editingWorkout, showToast]);

  // Delete workout
  const deleteWorkout = useCallback((id: string) => {
    if (!data) return;
    
    if (confirm('Remover este treino?')) {
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, workouts: prev.workouts.filter(w => w.id !== id) };
      });
      showToast('✅ Treino removido');
    }
  }, [data, showToast]);

  // Save measurement
  const saveMeasurement = useCallback((formData: MeasurementFormData) => {
    if (!data || !user) return;
    
    const measurement: Measurement = {
      user_id: user.id,
      date: Date.now(),
      weight: parseFloat(formData.weight) || null,
      height: parseFloat(formData.height) || null,
      chest: parseFloat(formData.chest) || null,
      waist: parseFloat(formData.waist) || null,
      arm: parseFloat(formData.arm) || null,
      thigh: parseFloat(formData.thigh) || null,
      notes: formData.notes
    };

    setData(prev => {
      if (!prev) return prev;
      return { ...prev, measurements: [measurement, ...prev.measurements] };
    });
    
    setShowMeasurementModal(false);
    showToast('✅ Medida registrada');
  }, [data, user, showToast]);

  // Save goal
  const saveGoal = useCallback((formData: GoalFormData) => {
    if (!data || !user) return;
    
    const goal: Goal = {
      id: 'g' + Date.now(),
      user_id: user.id,
      type: formData.type,
      target: parseFloat(formData.target),
      current: 0,
      deadline: new Date(formData.deadline).getTime(),
      title: formData.title
    };

    setData(prev => {
      if (!prev) return prev;
      return { ...prev, goals: [goal, ...prev.goals] };
    });
    
    setShowGoalModal(false);
    showToast('✅ Meta criada');
  }, [data, user, showToast]);

  // Delete goal
  const deleteGoal = useCallback((id: string) => {
    if (!data) return;
    
    if (confirm('Remover esta meta?')) {
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, goals: prev.goals.filter(g => g.id !== id) };
      });
      showToast('✅ Meta removida');
    }
  }, [data, showToast]);

  // Export data
  const exportData = useCallback(() => {
    if (!data) return;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impacto_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Dados exportados');
  }, [data, showToast]);

  // Import data
  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!imported.workouts) throw new Error('Invalid format');
        setData(imported);
        showToast('✅ Dados importados com sucesso');
      } catch {
        showToast('❌ Erro ao importar arquivo');
      }
    };
    input.click();
  }, [showToast]);

  // Handle logout
  const handleLogout = useCallback(() => {
    storage.disableSupabase();
    authLogout();
    navigate('/login');
    showToast('✅ Logout realizado');
  }, [authLogout, navigate, showToast]);

  // Handle timer complete
  const handleTimerComplete = useCallback(() => {
    showToast('⏰ Tempo de descanso finalizado!');
  }, [showToast]);

  // Calendar navigation
  const handlePrevMonth = useCallback(() => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }, [calendarMonth, calendarYear]);

  const handleNextMonth = useCallback(() => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }, [calendarMonth, calendarYear]);

  // Filtered workouts
  const filteredWorkouts = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data.workouts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.exercises.some(e => e.toLowerCase().includes(query)) ||
        w.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(w => w.category === filterCategory);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'day') return a.day.localeCompare(b.day);
      if (sortBy === 'recent') return (b.completedDates?.[0] || 0) - (a.completedDates?.[0] || 0);
      return 0;
    });
    
    return filtered;
  }, [data, searchQuery, filterCategory, sortBy]);

  // Categories
  const categories = useMemo(() => {
    if (!data) return ['all'];
    const cats = new Set(data.workouts.map(w => w.category));
    return ['all', ...Array.from(cats)];
  }, [data]);

  // Loading state
  if (authLoading || !isInitialized || !data) {
    return (
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>⏳ Carregando...</h2>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>
            Conectando com Supabase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header
        onExport={exportData}
        onImport={importData}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onExport={exportData}
        onImport={importData}
        onLogout={handleLogout}
      />
      
      <ProfileCard profile={data.profile} streak={data.streak} />
      
      <StatsGrid workouts={data.workouts} streak={data.streak} volume={data.volume} />

      <div className="card" style={{ marginTop: 20 }}>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'workouts' && (
          <>
            <WorkoutFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
            />
            <WorkoutsList
              workouts={filteredWorkouts}
              onToggle={toggleComplete}
              onEdit={(w: Workout) => { 
                setEditingWorkout(w); 
                setShowWorkoutModal(true); 
              }}
              onDelete={deleteWorkout}
              onAdd={() => { 
                setEditingWorkout(null); 
                setShowWorkoutModal(true); 
              }}
            />
          </>
        )}

        {activeTab === 'progress' && (
          <ProgressChart workouts={data.workouts} measurements={data.measurements} />
        )}

        {activeTab === 'measurements' && (
          <MeasurementsList
            measurements={data.measurements}
            onAdd={() => setShowMeasurementModal(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            workouts={data.workouts}
            month={calendarMonth}
            year={calendarYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDayClick={(day: number, workouts: Workout[]) => 
              setSelectedCalendarDay({ day, workouts })
            }
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsList achievements={data.achievements} />
        )}

        {activeTab === 'goals' && (
          <GoalsList
            goals={data.goals}
            onAdd={() => setShowGoalModal(true)}
            onDelete={deleteGoal}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView workouts={data.workouts} measurements={data.measurements} />
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="grid grid-2">
              <TimerCard 
                onTimerComplete={handleTimerComplete} 
                data={data} 
                setData={setData as React.Dispatch<React.SetStateAction<UserData>>} 
              />
              <RMCalculator />
            </div>
            <NotesCard
              notes={data.notes}
              onNotesChange={(notes: string) => setData(prev => prev ? { ...prev, notes } : prev)}
              onSave={() => showToast('✅ Notas salvas com sucesso!')}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        title={editingWorkout ? 'Editar Treino' : 'Novo Treino'}
      >
        <WorkoutForm
          workout={editingWorkout}
          onSave={saveWorkout}
          onCancel={() => setShowWorkoutModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showMeasurementModal}
        onClose={() => setShowMeasurementModal(false)}
        title="Adicionar Medida"
      >
        <MeasurementForm
          onSave={saveMeasurement}
          onCancel={() => setShowMeasurementModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="Nova Meta"
      >
        <GoalForm
          onSave={saveGoal}
          onCancel={() => setShowGoalModal(false)}
        />
      </Modal>

      <Modal
        isOpen={selectedCalendarDay !== null}
        onClose={() => setSelectedCalendarDay(null)}
        title={`Treinos do dia ${selectedCalendarDay?.day}`}
      >
        {selectedCalendarDay && (
          <div>
            {selectedCalendarDay.workouts.length === 0 ? (
              <p>Nenhum treino realizado neste dia.</p>
            ) : (
              selectedCalendarDay.workouts.map(w => (
                <div 
                  key={w.id} 
                  style={{ 
                    marginBottom: 12, 
                    padding: 12, 
                    background: 'var(--glass)', 
                    borderRadius: 8 
                  }}
                >
                  <h4>{w.name}</h4>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--muted)', 
                    marginTop: 4 
                  }}>
                    {w.exercises.length} exercícios
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} />
    </div>
  );
}

export default Dashboard;