
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar, ReferenceLine, Legend, ScatterChart, Scatter, ZAxis, Label,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, ComposedChart
} from 'recharts';
import { DashboardMetrics, Priority, Topic, Consequence, Likelihood, Department, Status, AIMode } from '../types';
import { Activity, BrainCircuit, ShieldCheck, Download, Info, Zap, Filter, Calendar, X, Printer, Calculator, ChevronDown, Check, TrendingUp, Maximize2 } from 'lucide-react';
import { generateDashboardInsights } from '../services/geminiService';
import { getMetrics } from '../services/topicService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import TopicDetailModal from './TopicDetailModal';

interface DashboardProps {
  metrics: DashboardMetrics; 
  topics: Topic[]; 
  aiMode: AIMode;
  setAiMode: (mode: AIMode) => void;
}

const COLORS = ['#FE5800', '#001A70', '#009900', '#FFB600', '#502D7F']; 
const PRIORITY_COLORS = {
  [Priority.CRITICAL]: '#FF0000', 
  [Priority.HIGH]: '#FE5800', 
  [Priority.MEDIUM]: '#FFB600', 
  [Priority.LOW]: '#009900', 
};

const getRiskColor = (consequence: number, likelihood: number) => {
  const score = consequence * likelihood;
  if (score >= 15) return 'bg-[#FF0000] text-white'; 
  if (score >= 10) return 'bg-[#FE5800] text-white'; 
  if (score >= 5) return 'bg-[#FFB600] text-slate-900'; 
  return 'bg-[#009900] text-white'; 
};

const MetricCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  subtext?: string; 
  accentColor?: string; 
  definition?: string;
}> = ({ title, value, icon, subtext, accentColor = "bg-[#001A70]", definition }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group z-10">
    <div className={`absolute top-0 left-0 w-full h-1 ${accentColor} rounded-t-2xl`}></div>
    <div className={`p-3 xl:p-4 rounded-2xl ${accentColor} bg-opacity-10 text-[#001A70] dark:text-slate-300 group-hover:scale-110 transition-transform duration-300`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 xl:w-8 xl:h-8 ${accentColor.replace('bg-', 'text-')}` })}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        {definition && (
           <div className="relative group/tooltip">
             <Info className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hover:text-[#FE5800] cursor-help transition-colors" />
             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-[#0B142F] text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center border border-slate-700">
               {definition}
               <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0B142F]"></div>
             </div>
           </div>
        )}
      </div>
      <h3 className="text-2xl xl:text-4xl font-extrabold text-[#101F40] dark:text-slate-100">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</p>}
    </div>
  </div>
);

const InsightBox: React.FC<{ text: string; loading: boolean }> = ({ text, loading }) => {
  if (!text && !loading) return null;
  return (
    <div className="mt-4 p-4 bg-[#F3F5F7] dark:bg-slate-950 rounded-xl border-l-4 border-[#FE5800] flex items-start gap-4 animate-fade-in transition-colors">
      <BrainCircuit className={`w-5 h-5 text-[#FE5800] mt-0.5 flex-shrink-0 ${loading ? 'animate-pulse' : ''}`} />
      <div className="text-xs text-[#101F40] dark:text-slate-200 leading-relaxed font-medium">
        {loading ? <span className="italic text-slate-500">Processing data for insights...</span> : text}
      </div>
    </div>
  );
};

const CustomScatterTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-[#0B142F] border-[#1e2e5c]'} p-4 shadow-xl rounded-lg text-xs max-w-[220px] z-50 text-white border`}>
        <p className="font-bold text-base mb-2 text-[#FE5800]">{data.name}</p>
        <div className="space-y-1.5 text-slate-300">
            {data.department && <p><span className="font-semibold text-slate-400">Dept:</span> {data.department}</p>}
            <p><span className="font-semibold text-slate-400">Priority:</span> {data.priorityLabel}</p>
            <p><span className="font-semibold text-slate-400">Open:</span> {data.x} days</p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomParetoTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-[#0B142F] border-[#1e2e5c]'} p-4 shadow-xl rounded-lg text-xs max-w-[250px] z-50 text-white border`}>
        <p className="font-bold text-base mb-2 text-[#FE5800]">{data.name}</p>
        <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-slate-400">Effort:</span>
              <span className="font-bold text-white">{data.effort}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-slate-400">Risk:</span>
              <span className="font-bold text-white">{data.risk}</span>
            </div>
            {data.isFrontier && (
              <div className="mt-2 text-[10px] font-bold text-[#FE5800] uppercase tracking-wider">Efficient Frontier Topic</div>
            )}
        </div>
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<{ 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode; 
  id: string; 
  colSpan?: string;
  accentColor?: string;
  definition?: string;
  onZoom?: () => void;
}> = ({ title, subtitle, children, id, colSpan = "col-span-1", accentColor = "bg-[#001A70]", definition, onZoom }) => {
  const handleDownload = async () => {
    const element = document.getElementById(id);
    if (element) {
      const canvas = await html2canvas(element, { 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff', 
        scale: 2,
        ignoreElements: (element) => element.classList.contains('no-capture') 
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col ${colSpan} relative group z-0 hover:z-10 h-full transition-colors`} id={id}>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${accentColor} rounded-t-2xl`}></div>
      <div className="p-6 xl:p-8 pb-4 flex justify-between items-start flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2">
             <h3 className="text-lg xl:text-xl font-bold text-[#101F40] dark:text-slate-100">{title}</h3>
             {definition && (
                <div className="relative group/tooltip">
                   <Info className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-[#FE5800] cursor-help transition-colors" />
                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#0B142F] text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center border border-slate-700">
                      {definition}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0B142F]"></div>
                   </div>
                </div>
             )}
          </div>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 no-capture">
          {onZoom && (
            <button 
              onClick={onZoom}
              className="text-slate-300 dark:text-slate-600 hover:text-[#001A70] dark:hover:text-blue-400 transition p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom Chart"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="text-slate-300 dark:text-slate-600 hover:text-[#FE5800] transition p-2 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/10"
            title="Download Chart as Image"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 xl:p-8 pt-0 flex-grow flex flex-col min-h-[350px]">
        {children}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ metrics: initialMetrics, topics, aiMode, setAiMode }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{c: number, l: number} | null>(null);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [zoomedChartId, setZoomedChartId] = useState<string | null>(null);
  
  // Filter States
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string[]>(['All']);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
            setIsStatusDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearFilters = () => {
    setFilterDept('All');
    setFilterPriority('All');
    setFilterStatus(['All']);
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const handleStatusToggle = (status: string) => {
      let newStatuses = [...filterStatus];
      if (status === 'All') {
          newStatuses = ['All'];
      } else {
          if (newStatuses.includes('All')) newStatuses = [];
          if (newStatuses.includes(status)) {
              newStatuses = newStatuses.filter(s => s !== status);
          } else {
              newStatuses.push(status);
          }
          if (newStatuses.length === 0) newStatuses = ['All'];
      }
      setFilterStatus(newStatuses);
  };

  const { filteredTopics, dashboardMetrics } = useMemo(() => {
    const filtered = topics.filter(t => {
      const matchDept = filterDept === 'All' || t.department === filterDept;
      const matchPrio = filterPriority === 'All' || t.priority === filterPriority;
      const matchStatus = filterStatus.includes('All') || filterStatus.includes(t.status);
      
      let matchDate = true;
      if (filterStartDate && filterEndDate) {
         const start = new Date(filterStartDate).getTime();
         const end = new Date(filterEndDate).getTime() + 86400000;
         const updated = new Date(t.updatedAt).getTime();
         matchDate = updated >= start && updated < end;
      }
      return matchDept && matchPrio && matchStatus && matchDate;
    });
    return { filteredTopics: filtered, dashboardMetrics: getMetrics(filtered) };
  }, [topics, filterDept, filterPriority, filterStatus, filterStartDate, filterEndDate]);

  const handleAnalyze = async () => {
    setLoadingInsights(true);
    const data = await generateDashboardInsights(dashboardMetrics, aiMode);
    setInsights(data);
    setLoadingInsights(false);
  };

  const handleDashboardPDF = async () => {
    setExportingPDF(true);
    const input = document.getElementById('dashboard-content');
    if (input) {
      try {
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: isDark ? '#0f172a' : '#F3F5F7' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        const scaledHeight = imgHeight * ratio;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
        pdf.save(`PTT_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) { console.error(error); }
    }
    setExportingPDF(false);
  };

  const totalRiskScore = filteredTopics.reduce((acc, t) => acc + (t.consequence * t.likelihood), 0);
  const avgRiskScore = filteredTopics.length > 0 ? (totalRiskScore / filteredTopics.length).toFixed(1) : "0.0";

  // Helper for Chart Selection
  const renderChartById = (id: string, isZoomed = false) => {
    const commonProps = { isZoomed };
    
    switch (id) {
      case 'chart-dept-dist':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={dashboardMetrics.byDepartment}
                    innerRadius={isZoomed ? 120 : 60}
                    outerRadius={isZoomed ? 160 : 80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={1}
                >
                    {dashboardMetrics.byDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label value={dashboardMetrics.totalTopics.toString()} position="center" className={`font-extrabold ${isZoomed ? 'text-5xl' : 'text-2xl'} ${isDark ? 'fill-slate-100' : 'fill-[#101F40]'}`} dy={-5} />
                    <Label value="TASKS" position="center" className={`${isZoomed ? 'text-lg' : 'text-[10px]'} font-bold fill-slate-400`} dy={isZoomed ? 25 : 15} />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
          </ResponsiveContainer>
        );
      case 'chart-waterfall':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardMetrics.waterfallData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={isZoomed ? 14 : 11} stroke="#64748b" />
                  <YAxis fontSize={isZoomed ? 14 : 11} stroke="#64748b" />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} stroke="#000000" strokeWidth={1} barSize={isZoomed ? 48 : 24}>
                      {dashboardMetrics.waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
              </BarChart>
          </ResponsiveContainer>
        );
      case 'chart-scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="x" name="Days Open" unit="d" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <YAxis type="number" dataKey="y" name="Priority" ticks={[1,2,3,4]} stroke="#64748b" fontSize={isZoomed ? 14 : 10} domain={[0, 5]} />
                  <ZAxis type="number" dataKey="z" range={isZoomed ? [200, 1000] : [100, 500]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip isDark={isDark} />} />
                  <Scatter name="Tasks" data={dashboardMetrics.scatterData}>
                      {dashboardMetrics.scatterData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PRIORITY_COLORS[entry.priorityLabel as Priority] || COLORS[index % COLORS.length]} 
                            fillOpacity={0.8}
                            stroke="#000000"
                            strokeWidth={1}
                          />
                      ))}
                  </Scatter>
              </ScatterChart>
          </ResponsiveContainer>
        );
      case 'chart-trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardMetrics.riskTrendData}>
                  <defs>
                      <linearGradient id="colorRiskTrendZoom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#001A70" stopOpacity={0.4}/><stop offset="95%" stopColor="#001A70" stopOpacity={0.05}/>
                      </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" fontSize={isZoomed ? 14 : 10} stroke="#64748b" tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis fontSize={isZoomed ? 14 : 10} stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalRiskScore" stroke="#001A70" strokeWidth={isZoomed ? 4 : 3} fill="url(#colorRiskTrendZoom)" name="Total Risk" />
              </AreaChart>
          </ResponsiveContainer>
        );
      case 'chart-entropy':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={isZoomed ? "85%" : "80%"} data={dashboardMetrics.entropyData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: isZoomed ? 14 : 10, fill: '#64748b'}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Entropy Score" dataKey="entropy" stroke="#502D7F" fill="#502D7F" fillOpacity={0.6} />
                  <Tooltip />
              </RadarChart>
          </ResponsiveContainer>
        );
      case 'chart-pareto':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="effort" name="Effort" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <YAxis type="number" dataKey="risk" name="Risk" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <ZAxis range={isZoomed ? [200, 600] : [100, 300]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomParetoTooltip isDark={isDark} />} />
                  <Scatter name="Tasks" data={dashboardMetrics.paretoData}>
                      {dashboardMetrics.paretoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isFrontier ? '#FE5800' : '#94a3b8'} fillOpacity={entry.isFrontier ? 1 : 0.5} stroke="#000000" strokeWidth={0.5} />
                      ))}
                  </Scatter>
              </ScatterChart>
          </ResponsiveContainer>
        );
      case 'chart-bayesian':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardMetrics.bayesianData} layout="vertical" margin={{ left: isZoomed ? 100 : 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <Tooltip />
                  <Bar dataKey="probability" fill="#009900" radius={[0, 4, 4, 0]} barSize={isZoomed ? 40 : 20} stroke="#000000" strokeWidth={0.5}>
                      {dashboardMetrics.bayesianData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fillOpacity={1 - entry.variance * 2} /> 
                      ))}
                  </Bar>
              </BarChart>
          </ResponsiveContainer>
        );
      case 'chart-stability':
        return (
          <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashboardMetrics.controlData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <YAxis stroke="#64748b" fontSize={isZoomed ? 14 : 10} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="gain" name="Gain (New)" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.3} stroke="#000000" strokeWidth={0.5} />
                  <Bar dataKey="damping" name="Damping (Resolved)" fill="#009900" radius={[4, 4, 0, 0]} opacity={0.3} stroke="#000000" strokeWidth={0.5} />
                  <Line type="monotone" dataKey="stability" name="Net Stability" stroke="#001A70" strokeWidth={isZoomed ? 6 : 4} dot={{r: isZoomed ? 6 : 4, fill: '#FE5800', stroke: '#000', strokeWidth: 1}} />
              </ComposedChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12 transition-colors">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold text-[#101F40] dark:text-slate-100 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base xl:text-lg">Operational risk and mathematical trend analysis.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-3 mr-2">Mode</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                    <button onClick={() => setAiMode('local')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiMode === 'local' ? 'bg-white dark:bg-slate-700 shadow text-[#001A70] dark:text-slate-100' : 'text-slate-400'}`}>Local</button>
                    <button onClick={() => setAiMode('cloud')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiMode === 'cloud' ? 'bg-white dark:bg-slate-700 shadow text-[#FE5800]' : 'text-slate-400'}`}>Cloud</button>
                </div>
             </div>
             <button onClick={handleDashboardPDF} disabled={exportingPDF} className="flex items-center gap-2 bg-[#001A70] hover:bg-[#1e2e5c] text-white px-4 py-2 rounded-full transition shadow-md font-bold text-xs uppercase no-capture"><Printer className="w-4 h-4" /> PDF</button>
             <button onClick={handleAnalyze} disabled={loadingInsights} className="flex items-center gap-2 bg-[#FE5800] hover:bg-[#D94A00] text-white px-5 py-2 rounded-full transition shadow-md font-bold text-xs uppercase no-capture"><BrainCircuit className="w-4 h-4" /> {loadingInsights ? 'Analyzing...' : 'Generate Insights'}</button>
          </div>
      </div>

      {/* DASHBOARD FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center no-capture transition-colors">
          <Filter className="w-4 h-4 text-[#001A70] dark:text-blue-400" />
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
             <Calendar className="w-4 h-4 text-slate-400" />
             <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-32 cursor-pointer" />
             <span className="text-slate-300">-</span>
             <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-32 cursor-pointer" />
          </div>

          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="All">All Departments</option>
            {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="All">All Priorities</option>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div className="relative" ref={statusDropdownRef}>
              <button 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
              >
                  <span>{filterStatus.includes('All') ? 'All Statuses' : `${filterStatus.length} Selected`}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100] p-2">
                      <div onClick={() => handleStatusToggle('All')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${filterStatus.includes('All') ? 'bg-[#FE5800] border-[#FE5800]' : 'border-slate-300 dark:border-slate-600'}`}>
                              {filterStatus.includes('All') && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">All Statuses</span>
                      </div>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                      {Object.values(Status).map(s => (
                          <div key={s} onClick={() => handleStatusToggle(s)} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${filterStatus.includes(s) ? 'bg-[#FE5800] border-[#FE5800]' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {filterStatus.includes(s) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm font-medium">{s}</span>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <button onClick={clearFilters} className="text-[#FE5800] text-sm font-bold ml-auto hover:underline uppercase tracking-tight">Clear Filters</button>
      </div>

      <div id="dashboard-content" className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard title="Total Risk Score" value={totalRiskScore} subtext={`Avg: ${avgRiskScore}`} icon={<Zap />} accentColor="bg-[#001A70]" definition="Sum of C x L for all filtered active topics." />
            <MetricCard title="Active Tasks" value={dashboardMetrics.totalTopics} subtext={`${dashboardMetrics.criticalCount} Critical`} icon={<Activity />} accentColor="bg-[#502D7F]" definition="Tasks within filter criteria." />
            <MetricCard title="Escalating" value={dashboardMetrics.escalatingCount} icon={<TrendingUp className="w-5 h-5" />} accentColor="bg-[#FE5800]" definition="Tasks with increasing risk trends." />
            <MetricCard title="Resolved" value={dashboardMetrics.resolvedCount} icon={<ShieldCheck />} accentColor="bg-[#009900]" definition="Completed topics matching filters." />
        </div>

        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <ChartCard title="Department Load" subtitle="Active Tasks per Area" id="chart-dept-dist" accentColor="bg-[#001A70]" definition="Distribution of technical topics across various engineering departments to identify resource pressure." onZoom={() => setZoomedChartId('chart-dept-dist')}>
                    {renderChartById('chart-dept-dist')}
                    <InsightBox text={insights?.distributionInsight || ''} loading={loadingInsights} />
                </ChartCard>

                <ChartCard title="Risk Heatmap Matrix" subtitle="Consequence vs Likelihood" id="chart-heatmap-classic" colSpan="xl:col-span-2" accentColor="bg-[#101F40]" definition="Standard risk assessment matrix mapping Consequence vs Likelihood to categorize tasks by severity.">
                    <div className="flex flex-col xl:flex-row h-full gap-8">
                        <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden pb-12">
                            <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full max-w-[280px] aspect-square">
                                {[5, 4, 3, 2, 1].map(l => (
                                    <React.Fragment key={l}>
                                        {[1, 2, 3, 4, 5].map(c => {
                                            const count = filteredTopics.filter(t => t.consequence === c && t.likelihood === l).length;
                                            const isSelected = selectedCell?.c === c && selectedCell?.l === l;
                                            return (
                                                <div 
                                                    key={`${c}-${l}`} 
                                                    onClick={() => setSelectedCell(isSelected ? null : {c, l})}
                                                    className={`${getRiskColor(c, l)} rounded-md flex flex-col items-center justify-center shadow-sm border border-black cursor-pointer transition-all ${isSelected ? 'ring-4 ring-offset-2 ring-[#001A70] scale-105 z-10' : 'hover:scale-105'} aspect-square`}
                                                >
                                                    <span className="text-[8px] font-black opacity-90 mb-0.5 uppercase tracking-tighter">C{c} L{l}</span>
                                                    {count > 0 ? <span className="text-sm font-black">{count}</span> : ''}
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="w-full xl:w-96 flex flex-col border-l border-slate-100 dark:border-slate-800 pl-8 h-[340px]">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cell Drilldown</h4>
                           <div className="flex-grow overflow-y-auto custom-scrollbar pr-3 space-y-3">
                              {filteredTopics.filter(t => selectedCell && t.consequence === selectedCell.c && t.likelihood === selectedCell.l).length > 0 ? 
                                filteredTopics.filter(t => selectedCell && t.consequence === selectedCell.c && t.likelihood === selectedCell.l).map(t => (
                                 <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
                                    <button onClick={() => setViewingTopic(t)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline text-left line-clamp-1">{t.title}</button>
                                    <p className="text-[10px] text-slate-400 mt-1">{t.owner} • {t.priority}</p>
                                 </div>
                              )) : <p className="text-xs italic text-slate-400 text-center mt-10">Select a cell to view tasks</p>}
                           </div>
                        </div>
                    </div>
                    <InsightBox text={insights?.riskHeatmapInsight || ''} loading={loadingInsights} />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Waterfall */}
                <ChartCard title="Risk Waterfall" subtitle="30-Day Score Movement" id="chart-waterfall" accentColor="bg-[#009900]" definition="Tracks the net movement of risk score over the last 30 days, bridging initial and final exposure." onZoom={() => setZoomedChartId('chart-waterfall')}>
                    {renderChartById('chart-waterfall')}
                    <InsightBox text={insights?.waterfallInsight || ''} loading={loadingInsights} />
                </ChartCard>

                {/* Aging vs Priority Scatter Plot */}
                <ChartCard title="Aging vs Priority" subtitle="Days Open vs Urgency" id="chart-scatter" accentColor="bg-[#FE5800]" definition="Scatter analysis showing how long tasks have been open relative to their urgency level." onZoom={() => setZoomedChartId('chart-scatter')}>
                    {renderChartById('chart-scatter')}
                    <InsightBox text={insights?.agingInsight || ''} loading={loadingInsights} />
                </ChartCard>

                {/* Compact Cumulative Risk Trend */}
                <ChartCard title="Cumulative Risk Trend" subtitle="Risk evolution (30d)" id="chart-trend" accentColor="bg-[#101F40]" definition="Historical time-series of total divisional risk exposure over a rolling 30-day window." onZoom={() => setZoomedChartId('chart-trend')}>
                    {renderChartById('chart-trend')}
                </ChartCard>
            </div>
        </div>

        <div className="pt-12 border-t-2 border-slate-200 dark:border-slate-800 space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-[#001A70] dark:text-blue-300">
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#101F40] dark:text-slate-100">Advanced Mathematical Analytics</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Deep logic engines based on Information, Game, and Control Theory.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ChartCard title="Workflow Entropy (Information Theory)" id="chart-entropy" accentColor="bg-[#502D7F]" definition="Shannon Entropy (H) measures status diversity. High H = healthy parallel flow. Low H = serial stagnation/bottlenecks." onZoom={() => setZoomedChartId('chart-entropy')}>
                    {renderChartById('chart-entropy')}
                    <InsightBox text={insights?.entropyInsight || ''} loading={loadingInsights} />
                </ChartCard>

                <ChartCard title="Pareto Efficient Frontier (OR)" id="chart-pareto" accentColor="bg-[#FE5800]" definition="Highlights 'High-ROI' tasks. Frontier items provide the maximum risk reduction potential for the given operational resources." onZoom={() => setZoomedChartId('chart-pareto')}>
                    {renderChartById('chart-pareto')}
                    <InsightBox text={insights?.paretoInsight || ''} loading={loadingInsights} />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ChartCard title="Bayesian Delivery Confidence" id="chart-bayesian" accentColor="bg-[#009900]" definition="P(Success) using Beta distributions. Calculates probability of meeting divisional targets based on historical velocity." onZoom={() => setZoomedChartId('chart-bayesian')}>
                    {renderChartById('chart-bayesian')}
                    <InsightBox text={insights?.bayesianInsight || ''} loading={loadingInsights} />
                </ChartCard>

                <ChartCard title="System Stability (Control Theory)" id="chart-stability" accentColor="bg-[#001A70]" definition="Analyzes the project as a dynamic control loop. Gain (New Risk) vs Damping (Resolution). Positive stability = clearing backlog." onZoom={() => setZoomedChartId('chart-stability')}>
                    {renderChartById('chart-stability')}
                    <InsightBox text={insights?.controlInsight || ''} loading={loadingInsights} />
                </ChartCard>
            </div>
        </div>
      </div>
      
      {/* Zoom Modal */}
      {zoomedChartId && (
        <div 
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-fade-in cursor-zoom-out"
          onClick={() => setZoomedChartId(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 cursor-default animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
               <div>
                 <h2 className="text-3xl font-bold text-[#101F40] dark:text-white">
                    {zoomedChartId === 'chart-dept-dist' && 'Department Load'}
                    {zoomedChartId === 'chart-waterfall' && 'Risk Waterfall'}
                    {zoomedChartId === 'chart-scatter' && 'Aging vs Priority'}
                    {zoomedChartId === 'chart-trend' && 'Cumulative Risk Trend'}
                    {zoomedChartId === 'chart-entropy' && 'Workflow Entropy'}
                    {zoomedChartId === 'chart-pareto' && 'Pareto Efficient Frontier'}
                    {zoomedChartId === 'chart-bayesian' && 'Bayesian Delivery Confidence'}
                    {zoomedChartId === 'chart-stability' && 'System Stability'}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed mathematical visualization</p>
               </div>
               <button 
                 onClick={() => setZoomedChartId(null)}
                 className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-full transition-all border border-slate-100 dark:border-slate-700"
               >
                 <X className="w-8 h-8" />
               </button>
            </div>
            <div className="flex-grow min-h-0 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-inner">
               {renderChartById(zoomedChartId, true)}
            </div>
            <div className="mt-6 flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-widest shrink-0">
               <span>PTT.Risk Analytical Core</span>
               <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Click anywhere outside to close</span>
            </div>
          </div>
        </div>
      )}

      {viewingTopic && <TopicDetailModal topic={viewingTopic} onClose={() => setViewingTopic(null)} />}
    </div>
  );
};

export default Dashboard;
