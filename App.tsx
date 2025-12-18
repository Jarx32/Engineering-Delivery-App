
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, PlusCircle, List, BrainCircuit, FileText, Menu, X, Edit3, BarChart2, Fan, Sun, Moon, BookOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Topic, DashboardMetrics, FilterState, ViewState, Status, AIMode, ThemeMode } from './types';
import * as TopicService from './services/topicService';
import Dashboard from './components/Dashboard';
import TopicForm from './components/TopicForm';
import TopicList from './components/TopicList';
import AIInsights from './components/AIInsights';
import ReportGenerator from './components/ReportGenerator';
import SplashScreen from './components/SplashScreen';
import TopicUpdate from './components/TopicUpdate';
import TaskTrend from './components/TaskTrend';
import Documentation from './components/Documentation';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // AI Mode State
  const [aiMode, setAiMode] = useState<AIMode>('local');

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ptt_theme') as ThemeMode) || 'light';
  });

  // Global Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    department: 'All',
    priority: 'All',
    status: ['All'], 
    startDate: '',
    endDate: ''
  });

  // Load Data
  const refreshData = () => {
    const data = TopicService.getTopics();
    setTopics(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Theme effect: Apply class to root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ptt_theme', theme);
  }, [theme]);

  const handleSaveTopic = (topic: Topic) => {
    TopicService.saveTopic(topic);
    refreshData();
    setCurrentView('list');
    setEditingTopic(null);
  };

  const handleDeleteTopic = (id: string) => {
    TopicService.deleteTopic(id);
    refreshData();
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setCurrentView('add');
  };

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
                            topic.owner.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                            topic.id.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesDept = filters.department === 'All' || topic.department === filters.department;
      
      const matchesPriority = filters.priority === 'All' || topic.priority === filters.priority;

      const matchesStatus = filters.status.includes('All') || filters.status.includes(topic.status);

      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
         const start = new Date(filters.startDate).getTime();
         const end = new Date(filters.endDate).getTime();
         const updated = new Date(topic.updatedAt).getTime();
         matchesDate = updated >= start && updated <= (end + 86400000);
      }

      return matchesSearch && matchesDept && matchesPriority && matchesStatus && matchesDate;
    });
  }, [topics, filters]);

  // Derived Metrics
  const currentMetrics: DashboardMetrics = useMemo(() => {
     return TopicService.getMetrics(filteredTopics);
  }, [filteredTopics]);

  const NavButton: React.FC<{ view: ViewState; icon: React.ReactNode; label: React.ReactNode; title?: string }> = ({ view, icon, label, title }) => (
    <button
      onClick={() => {
        if (view === 'add') setEditingTopic(null);
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      title={sidebarCollapsed ? (title || (typeof label === 'string' ? label : '')) : undefined}
      className={`flex items-center transition-all duration-300 group font-medium relative
        ${sidebarCollapsed 
          ? 'justify-center w-12 h-12 mx-auto rounded-xl px-0' // Fixed square size centered when collapsed
          : 'w-full py-3 space-x-3 px-5' // Full width when expanded
        }
        ${currentView === view 
          ? 'bg-[#FE5800] text-white shadow-lg' 
          : 'text-blue-100 hover:bg-[#1e2e5c] hover:text-white'
        }
        ${!sidebarCollapsed && currentView === view ? 'translate-x-1 rounded-r-full mr-4' : ''}
        `}
    >
      <div className={`${currentView === view ? 'text-white' : 'text-blue-300 group-hover:text-white'} flex-shrink-0`}>
        {icon}
      </div>
      {!sidebarCollapsed && <span className="text-left leading-tight">{label}</span>}
    </button>
  );

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#F3F5F7] dark:bg-slate-950 overflow-hidden font-sans text-[#101F40] dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 bg-[#0B142F] text-white transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col
        xl:relative
        ${mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full xl:translate-x-0'}
        ${sidebarCollapsed ? 'xl:w-20' : 'xl:w-72'}
      `}>
        {/* Logo Area */}
        <div className={`flex items-center relative transition-all duration-300
           ${sidebarCollapsed 
             ? 'flex-col justify-center py-6 gap-6' // Stack vertically when collapsed
             : 'flex-row p-6 xl:p-8 space-x-3 xl:space-x-4' // Horizontal when expanded
           }
        `}>
          <div className="flex items-center justify-center shrink-0">
            <Fan className="w-8 h-8 xl:w-10 xl:h-10 text-[#FE5800]" />
          </div>
          
          {!sidebarCollapsed && (
            <div className="animate-fade-in whitespace-nowrap overflow-hidden">
              <span className="block text-2xl xl:text-3xl font-bold tracking-tight text-white leading-none">PTT<span className="text-[#FE5800]">.Risk</span></span>
              <span className="text-xs xl:text-sm text-blue-300 uppercase tracking-widest font-semibold mt-1 block">Delivery App <span className="text-[10px] text-white/60 ml-1">v 1.0</span></span>
            </div>
          )}
          
          {/* Collapse Toggle Button (Desktop Only) */}
          <button 
             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
             className={`text-slate-400 hover:text-white hidden xl:flex transition-colors z-50 items-center justify-center
               ${sidebarCollapsed ? 'static' : 'absolute right-4 top-1/2 -translate-y-1/2'}
             `}
             title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
             {sidebarCollapsed 
               ? <PanelLeftOpen className="w-6 h-6 bg-[#0B142F] rounded-full p-0.5 border border-slate-600 hover:border-white shadow-lg" /> 
               : <PanelLeftClose className="w-5 h-5" />
             }
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto pr-0 custom-scrollbar">
          <NavButton view="add" icon={<PlusCircle className="w-5 h-5" />} label="Add New Task" />
          <NavButton view="list" icon={<List className="w-5 h-5" />} label="Task Tracker" />
          <NavButton view="update" icon={<Edit3 className="w-5 h-5" />} label="Task Update" />
          <NavButton view="dashboard" icon={<LayoutGrid className="w-5 h-5" />} label="Dashboard" />
          
          <div className={`pt-4 pb-2 ${sidebarCollapsed ? 'px-0' : 'pl-5 pr-4'}`}>
            {!sidebarCollapsed && (
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 ml-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] animate-fade-in whitespace-nowrap">Insights & Reports</p>
            )}
            {sidebarCollapsed && <div className="h-px bg-white/10 mx-4 mb-4"></div>}
            
            <div className="space-y-2">
              <NavButton view="report" icon={<FileText className="w-5 h-5" />} label="Report Generation" />
              <NavButton view="trend" icon={<BarChart2 className="w-5 h-5" />} label="Task Trend" />
              <NavButton view="insights" icon={<BrainCircuit className="w-5 h-5" />} label="Executive Summary" />
            </div>
          </div>

          <div className={`pt-4 pb-2 mt-2 ${sidebarCollapsed ? 'px-0 border-t border-white/10' : 'pl-5 pr-4 border-t border-white/10'}`}>
            <div className="space-y-2 mt-2">
              <NavButton 
                view="docs" 
                icon={<BookOpen className="w-5 h-5" />} 
                label={<>System<br />Documentation</>} 
                title="System Documentation"
              />
            </div>
          </div>
        </nav>

        {/* Theme Toggle & Footer branding */}
        <div className={`border-t border-white/10 no-print ${sidebarCollapsed ? 'px-2 py-4' : 'px-6 py-4'}`}>
            <div className={`flex items-center mb-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!sidebarCollapsed && <span className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-2 animate-fade-in whitespace-nowrap">Appearance</span>}
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={`flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 text-blue-200 transition-all border border-white/10 shadow-sm
                    ${sidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-1.5'}
                  `}
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? (
                       <>
                         <Moon className="w-4 h-4" />
                         {!sidebarCollapsed && <span className="text-xs font-bold">Dark</span>}
                       </>
                    ) : (
                       <>
                         <Sun className="w-4 h-4 text-orange-400" />
                         {!sidebarCollapsed && <span className="text-xs font-bold">Light</span>}
                       </>
                    )}
                </button>
            </div>

            {!sidebarCollapsed && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 animate-fade-in">
                  <div className="h-1 bg-[#FE5800] rounded-full mb-3 w-1/2"></div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1 whitespace-nowrap">Hinkley Point C</p>
                  <p className="text-[8px] font-medium text-blue-400/60 uppercase tracking-wide whitespace-nowrap">Achieving Net Zero</p>
              </div>
            )}
        </div>

        {/* User Profile */}
        <div className={`bg-[#080E24] flex items-center ${sidebarCollapsed ? 'p-4 justify-center' : 'p-6 space-x-4'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FE5800] to-[#FFB600] flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
            ED
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in whitespace-nowrap overflow-hidden">
              <p className="text-sm font-bold text-white">Engineering Delivery</p>
              <p className="text-xs text-blue-400">Administrator</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col transition-all duration-300">
        {/* Top Banner */}
        <div className="bg-[#FE5800] w-full py-5 px-6 md:px-8 flex justify-between items-center shadow-md relative z-10 shrink-0">
           <h1 className="text-white text-2xl md:text-4xl font-bold tracking-tight drop-shadow-xl font-sans whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
             Engineering Delivery App <span className="text-lg md:text-xl text-white/80 ml-2 font-medium whitespace-nowrap">v 1.0</span>
           </h1>
           <div className="hidden md:flex flex-col items-end text-white/80 text-sm font-medium whitespace-nowrap">
             <span>Priority Technical Topics</span>
             <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Task designed by Poki</span>
           </div>
        </div>
        
        {/* Mobile Header */}
        <div className="xl:hidden bg-[#0B142F] text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md shrink-0">
          <div className="flex items-center space-x-2">
            <Fan className="w-6 h-6 text-[#FE5800]" />
            <span className="font-bold text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">PTT.Risk <span className="text-[10px] text-white/60 ml-1">v 1.0</span></span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 xl:p-8 w-full max-w-[2400px] mx-auto">
          {/* Active Filter Banner - Hide on Docs/Add/Update */}
          {(filters.department !== 'All' || filters.priority !== 'All' || !filters.status.includes('All') || (filters.startDate && filters.endDate)) && !['add', 'update', 'docs'].includes(currentView) && (
             <div className="mb-6 bg-white dark:bg-slate-900 border-l-4 border-[#FE5800] px-4 md:px-6 py-4 rounded-r-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between text-sm animate-fade-in transition-colors gap-3">
                <div className="flex flex-wrap items-center gap-3">
                   <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full text-[#FE5800]">
                     <List className="w-4 h-4" />
                   </div>
                   <span className="text-[#101F40] dark:text-slate-200">
                     <strong>Active Filters:</strong> {filteredTopics.length} tasks found 
                     {filters.department !== 'All' && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 text-xs">{filters.department}</span>}
                     {filters.priority !== 'All' && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 text-xs">{filters.priority}</span>}
                     {!filters.status.includes('All') && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 text-xs">{filters.status.join(', ')}</span>}
                   </span>
                </div>
                <button 
                  onClick={() => setFilters({ searchTerm: '', department: 'All', priority: 'All', status: ['All'], startDate: '', endDate: '' })}
                  className="text-[#FE5800] hover:text-[#D94A00] underline text-xs font-bold uppercase tracking-wide"
                >
                   Clear Filters
                </button>
             </div>
          )}

          {currentView === 'dashboard' && (
            <div className="animate-fade-in pb-12">
              <Dashboard 
                metrics={currentMetrics} 
                topics={filteredTopics} 
                aiMode={aiMode} 
                setAiMode={setAiMode} 
              />
            </div>
          )}

          {currentView === 'list' && (
             <div className="animate-fade-in h-full flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] tracking-tight">Task Tracker</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-base md:text-lg">Manage engineering priorities and risk status</p>
                  </div>
                  <button 
                    onClick={() => { setEditingTopic(null); setCurrentView('add'); }}
                    className="bg-[#FE5800] hover:bg-[#D94A00] text-white px-6 py-3 rounded-full text-sm font-bold flex items-center space-x-2 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-5 h-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Add New Task</span>
                  </button>
                </div>
                <TopicList 
                  topics={filteredTopics} 
                  filters={filters}
                  onFilterChange={setFilters}
                  onEdit={handleEditTopic} 
                  onDelete={handleDeleteTopic} 
                />
             </div>
          )}

          {currentView === 'add' && (
             <div className="animate-fade-in">
                <div className="mb-6">
                  <button 
                    onClick={() => setCurrentView('list')}
                    className="text-slate-500 dark:text-slate-400 hover:text-[#FE5800] text-sm font-medium mb-2 flex items-center gap-1 transition-colors"
                  >
                    ← Back to Tracker
                  </button>
                  <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{editingTopic ? 'Edit Topic' : 'New Topic'}</h2>
                </div>
                <TopicForm 
                  onSave={handleSaveTopic} 
                  onCancel={() => setCurrentView('list')} 
                  initialData={editingTopic}
                />
             </div>
          )}

          {currentView === 'update' && (
              <TopicUpdate topics={topics} onEdit={handleEditTopic} />
          )}

          {currentView === 'report' && (
             <div className="animate-fade-in">
                <div className="mb-8">
                   <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Report Generation</h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Export analysis for {filteredTopics.length} selected tasks</p>
                </div>
                <ReportGenerator filteredTopics={filteredTopics} />
             </div>
          )}

          {currentView === 'trend' && (
              <TaskTrend topics={topics} />
          )}

          {currentView === 'insights' && (
            <div className="animate-fade-in">
               <div className="mb-8">
                 <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] mb-2">Executive Summary</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-lg">Analysis based on current task data</p>
               </div>
               <AIInsights 
                 topics={filteredTopics} 
                 aiMode={aiMode} 
                 setAiMode={setAiMode} 
               />
            </div>
          )}

          {currentView === 'docs' && (
              <Documentation />
          )}
        </div>
      </main>
      
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 xl:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Footer credit */}
      <footer className="fixed bottom-4 right-4 z-50 pointer-events-none print:hidden">
          <p className="text-[10px] font-bold text-[#101F40]/30 dark:text-white/20 uppercase tracking-widest">Designed by Poki</p>
      </footer>
    </div>
  );
};

export default App;
