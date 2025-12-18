
import React, { useState, useMemo } from 'react';
import { Topic, Department, Priority, RiskTrend } from '../types';
import { Search, BarChart2, Calendar, Filter, X, CheckSquare, Square, RefreshCw, Activity, PieChart as PieIcon, Info, Printer, Presentation, Download, Maximize2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, Cell } from 'recharts';
import { getMultiTopicRiskHistory } from '../services/topicService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import TopicDetailModal from './TopicDetailModal';

interface TaskTrendProps {
    topics: Topic[];
}

// Generate distinct colors for lines
const COLORS = ['#FE5800', '#001A70', '#009900', '#FFB600', '#502D7F', '#e11d48', '#0891b2', '#8b5cf6'];

// Custom Label Component for End of Line
const CustomizedLabel = (props: any) => {
    const { x, y, stroke, value, index, dataLength, trend, opacity } = props;
    
    // Only render on the last data point
    if (index !== dataLength - 1) return null;
    // Don't render if the line is dimmed out
    if (opacity < 0.5) return null;
  
    let text = "Stable";
    let color = "#64748b"; // Slate-500
  
    if (trend === RiskTrend.ESCALATING) { text = "Escalating"; color = "#ef4444"; } // Red
    if (trend === RiskTrend.IMPROVING) { text = "Improving"; color = "#10b981"; } // Green
    if (trend === RiskTrend.STABLE) { text = "Stable"; color = "#64748b"; }
  
    return (
      <text x={x + 10} y={y} dy={4} fill={color} fontSize={10} fontWeight="bold" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
        {text}
      </text>
    );
};

// Custom Tick for Y-Axis labels to make them clickable
const ClickableYAxisTick = (props: any) => {
    const { x, y, payload, onLabelClick, data } = props;
    
    // Find the original full name/ID if needed, though payload.value is the name
    const handleItemClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Extract the ID from the payload or find matching topic
        const item = data.find((d: any) => d.name === payload.value);
        if (item && onLabelClick) {
            onLabelClick(item.id);
        }
    };

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={-10}
                y={0}
                dy={4}
                textAnchor="end"
                fill="#64748b"
                fontSize={11}
                className="cursor-pointer hover:fill-[#FE5800] hover:font-bold transition-all duration-200"
                onClick={handleItemClick}
                style={{ userSelect: 'none' }}
            >
                {payload.value}
            </text>
        </g>
    );
};

const TaskTrend: React.FC<TaskTrendProps> = ({ topics }) => {
    // 1. Filter State
    const [selectedDept, setSelectedDept] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingPPT, setExportingPPT] = useState(false);
    
    // Viewing State
    const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
    
    // Zoom State
    const [isChartZoomed, setIsChartZoomed] = useState(false);
    
    // Highlight State
    const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
    
    // Default dates: Last 6 months
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const [startDate, setStartDate] = useState(sixMonthsAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today);

    // 2. Selection State
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
    
    // 3. Chart Data State
    const [chartData, setChartData] = useState<any[]>([]);
    const [plottedTopics, setPlottedTopics] = useState<Topic[]>([]);

    // Derived list of topics to show in the list
    const availableTopics = useMemo(() => {
        return topics.filter(t => {
            const matchDept = selectedDept === 'All' || t.department === selectedDept;
            const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchDept && matchSearch;
        });
    }, [topics, selectedDept, searchTerm]);

    const toggleTopic = (id: string) => {
        const newSet = new Set(selectedTopicIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            // Limit to 8 for chart readability
            if (newSet.size >= 8) {
                alert("You can select up to 8 topics for comparison.");
                return;
            }
            newSet.add(id);
        }
        setSelectedTopicIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedTopicIds.size === availableTopics.length) {
            setSelectedTopicIds(new Set()); // Deselect all
        } else {
            // Limit to first 8 matches if list is huge, otherwise select all valid
            const newSet = new Set<string>();
            availableTopics.slice(0, 8).forEach(t => newSet.add(t.id));
            if (availableTopics.length > 8) alert("Selected top 8 matching topics for readability.");
            setSelectedTopicIds(newSet);
        }
    };

    const clearFilters = () => {
        setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
        setEndDate(today);
        setSelectedDept('All');
        setSearchTerm('');
        setSelectedTopicIds(new Set());
        setChartData([]);
        setPlottedTopics([]);
        setHighlightedTopicId(null);
    };

    const handlePlot = () => {
        if (selectedTopicIds.size === 0) return;

        // Get full topic objects for selected IDs
        const selected = topics.filter(t => selectedTopicIds.has(t.id));
        setPlottedTopics(selected);

        // Generate merged data
        const data = getMultiTopicRiskHistory(selected, startDate, endDate);
        setChartData(data);
        setHighlightedTopicId(null); // Reset highlight on new plot
    };

    const handleLegendClick = (data: any, index: number, event: React.MouseEvent) => {
        // CRITICAL: Stop propagation to prevent background click from resetting selection immediately
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        
        const clickedId = data.dataKey;
        // Toggle selection
        setHighlightedTopicId(prev => prev === clickedId ? null : clickedId);
    };

    const handleLineClick = (event: any, payload: any) => {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        const clickedId = payload.dataKey;
        setHighlightedTopicId(prev => prev === clickedId ? null : clickedId);
    }

    const handleBackgroundClick = (e: React.MouseEvent) => {
        // Reset selection when clicking on the chart background
        setHighlightedTopicId(null);
    };

    const handleYAxisLabelClick = (id: string) => {
        const topic = topics.find(t => t.id === id);
        if (topic) {
            setViewingTopic(topic);
        }
    };

    const handleDownloadImage = async (elementId: string, fileName: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent background click reset
        const element = document.getElementById(elementId);
        if (!element) return;
        
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                ignoreElements: (e) => e.classList.contains('no-capture')
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (error) {
            console.error("Image Export Error", error);
            alert("Failed to download chart image.");
        }
    };

    const handleExportPDF = async () => {
        const input = document.getElementById('trend-analysis-grid');
        if (!input) return;
    
        setExportingPDF(true);
        try {
          const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#F3F5F7'
          });
    
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = imgWidth / pdfWidth;
          const pdfHeight = imgHeight / ratio;
    
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`PTT_Trend_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
          console.error("Error generating PDF", error);
          alert("Failed to generate PDF");
        } finally {
            setExportingPDF(false);
        }
    };

    const handleExportPPT = async () => {
        setExportingPPT(true);
        try {
          const pptx = new PptxGenJS();
          pptx.layout = 'LAYOUT_16x9';
    
          // Define Master Slide
          pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: 'F3F5F7' },
            objects: [
              { rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: 'FE5800' } } },
              { rect: { x: 0, y: 0.15, w: '100%', h: 0.6, fill: { color: '001A70' } } },
              { text: { text: 'PTT.Risk Delivery App', options: { x: 0.5, y: 0.25, w: 4, h: 0.4, fontSize: 18, color: 'FFFFFF', bold: true, fontFace: 'Arial' } } },
              { text: { text: 'Trend Analysis Report', options: { x: 0.5, y: 0.55, w: 5, h: 0.3, fontSize: 10, color: 'FE5800', bold: true, fontFace: 'Arial' } } },
              { text: { text: `Generated: ${new Date().toLocaleDateString()}`, options: { x: 8.5, y: 0.25, w: 1.0, h: 0.3, fontSize: 10, color: 'FFFFFF', align: 'right' } } }
            ]
          });
    
          const capture = async (id: string) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', ignoreElements: (e) => e.classList.contains('no-capture') });
            return canvas.toDataURL('image/png');
          };
    
          // Slide 1: Historical Trend
          const slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
          slide1.addText('Historical Risk Evolution', { x: 0.5, y: 1.0, fontSize: 24, bold: true, color: '101F40' });
          slide1.addText(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, { x: 0.5, y: 1.5, fontSize: 12, color: '666666' });
          
          const lineChartImg = await capture('trend-line-container');
          if (lineChartImg) slide1.addImage({ data: lineChartImg, x: 0.5, y: 2.0, w: 9.0, h: 4.5 });
    
          // Slide 2: Current Comparison
          const slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
          slide2.addText('Current Risk Score Comparison', { x: 0.5, y: 1.0, fontSize: 24, bold: true, color: '101F40' });
          
          const barChartImg = await capture('trend-bar-container');
          if (barChartImg) slide2.addImage({ data: barChartImg, x: 0.5, y: 2.0, w: 9.0, h: 4.5 });
    
          pptx.writeFile({ fileName: `PTT_Trend_Analysis_${new Date().toISOString().split('T')[0]}.pptx` });
    
        } catch (error) {
          console.error("PPT Export Error", error);
          alert("Failed to export PowerPoint.");
        }
        setExportingPPT(false);
    };

    // Prepare Bar Chart Data (Current Risk Snapshot)
    const barChartData = plottedTopics.map(t => ({
        id: t.id,
        name: t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title,
        fullName: t.title,
        riskScore: t.consequence * t.likelihood,
        priority: t.priority
    }));

    return (
        <div className="space-y-6 animate-fade-in h-full flex flex-col pb-8">
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Task Trend Analysis</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Select tasks to compare risk trajectories and current exposure.</p>
                    </div>
                    
                    {/* Always Visible Date Filter */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700 self-start md:self-center">
                        <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                        <input 
                            type="date" 
                            className="bg-transparent text-sm p-2 outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-300">-</span>
                        <input 
                            type="date" 
                            className="bg-transparent text-sm p-2 outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                     <button 
                        onClick={clearFilters}
                        className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        title="Reset All"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handlePlot}
                        disabled={selectedTopicIds.size === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap
                          ${selectedTopicIds.size > 0 ? 'bg-[#FE5800] hover:bg-[#d94a00]' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}
                        `}
                    >
                        <BarChart2 className="w-5 h-5" />
                        Plot Analysis
                    </button>
                </div>
            </div>

            {/* Main Content Split View */}
            <div className="flex flex-col lg:flex-row gap-6 flex-grow">
                
                {/* Left Panel: Configuration & List (30% width) */}
                <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-[700px] transition-colors duration-300">
                    <div className="space-y-4 shrink-0">
                        {/* Area Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Area / Department</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#FE5800] outline-none text-sm font-medium text-[#101F40] dark:text-slate-200 bg-white dark:bg-slate-800"
                            >
                                <option value="All">All Areas</option>
                                <option value="Nuclear Island">Nuclear Island</option>
                                <option value="Conventional Island">Conventional Island</option>
                                <option value="Equipment Area">Equipment Area</option>
                                <option value="Civil Works">Civil Works</option>
                                <option value="Safety & Licensing">Safety & Licensing</option>
                                <option value="Project Controls">Project Controls</option>
                            </select>
                        </div>

                         {/* Search */}
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            />
                        </div>

                        {/* Selection Header */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                             <span className="text-xs font-bold text-[#101F40] dark:text-slate-200 uppercase">
                                 {selectedTopicIds.size} Selected
                             </span>
                             <button onClick={handleSelectAll} className="text-xs text-[#FE5800] font-bold hover:underline">
                                 {selectedTopicIds.size === availableTopics.length ? 'Deselect All' : 'Select Top 8'}
                             </button>
                        </div>
                    </div>

                    {/* Scrollable Topic List */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950">
                        {availableTopics.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {availableTopics.map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => toggleTopic(t.id)}
                                        className={`p-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-white dark:hover:bg-slate-800
                                           ${selectedTopicIds.has(t.id) ? 'bg-orange-50/50 dark:bg-orange-900/20' : ''}
                                        `}
                                    >
                                        <div className={`mt-0.5 ${selectedTopicIds.has(t.id) ? 'text-[#FE5800]' : 'text-slate-300'}`}>
                                            {selectedTopicIds.has(t.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium leading-tight line-clamp-2 ${selectedTopicIds.has(t.id) ? 'text-[#101F40] dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {t.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    t.priority === Priority.CRITICAL ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400' : 
                                                    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                }`}>
                                                    {t.priority}
                                                </span>
                                                <span className="text-xs text-slate-400">{t.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                <p className="text-sm">No tasks found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Analysis Grid (70% width) */}
                <div className="w-full flex-1 flex flex-col gap-6" id="trend-analysis-grid">
                    {/* Exports Toolbar */}
                    {chartData.length > 0 && (
                        <div className="flex justify-end gap-3 mb-2 no-capture">
                            <button 
                                onClick={handleExportPPT}
                                disabled={exportingPPT}
                                className={`flex items-center gap-2 px-4 py-2 bg-[#FFB600] text-[#101F40] rounded-full text-xs font-bold shadow-sm hover:shadow-md transition ${exportingPPT ? 'opacity-50 cursor-wait' : 'hover:bg-yellow-500'}`}
                            >
                                <Presentation className="w-4 h-4" />
                                {exportingPPT ? 'Exporting...' : 'Export PPT'}
                            </button>
                            <button 
                                onClick={handleExportPDF}
                                disabled={exportingPDF}
                                className={`flex items-center gap-2 px-4 py-2 bg-[#001A70] text-white rounded-full text-xs font-bold shadow-sm hover:shadow-md transition ${exportingPDF ? 'opacity-50 cursor-wait' : 'hover:bg-[#1e2e5c]'}`}
                            >
                                <Printer className="w-4 h-4" />
                                {exportingPDF ? 'Saving...' : 'Save PDF'}
                            </button>
                        </div>
                    )}
                    
                    {/* Top Chart: Comparative Line Graph */}
                    <div 
                        id="trend-line-container" 
                        onClick={handleBackgroundClick}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 min-h-[350px] relative cursor-default transition-colors duration-300"
                    >
                         <div className="absolute top-6 right-6 flex gap-2 no-capture z-10">
                             {/* Zoom Button */}
                             {chartData.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsChartZoomed(true); }}
                                    className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-[#001A70] dark:hover:text-blue-400 transition"
                                    title="Maximize Chart"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                             )}
                             {/* Single Chart Download Button */}
                             <button 
                                onClick={(e) => handleDownloadImage('trend-line-container', 'Risk_History', e)}
                                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-[#FE5800] transition"
                                title="Download Chart as Image"
                             >
                                <Download className="w-5 h-5" />
                             </button>
                         </div>

                        {chartData.length > 0 ? (
                            <div className="flex flex-col h-full">
                                <div className="mb-2 flex justify-between items-center pr-20">
                                    <h3 className="text-lg font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-[#FE5800]" />
                                        Historical Risk Evolution
                                        <div className="relative group/tooltip ml-1">
                                            <Info className="w-4 h-4 text-slate-300 hover:text-[#FE5800] cursor-help" />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#0B142F] text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center border border-slate-700">
                                                Tracks the changing risk score (Consequence × Likelihood) of selected tasks over the chosen date range. Click legend items to highlight specific lines.
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0B142F]"></div>
                                            </div>
                                        </div>
                                    </h3>
                                </div>
                                
                                <div className="flex-grow w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="date" 
                                                fontSize={11} 
                                                stroke="#64748b" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                minTickGap={30}
                                            />
                                            <YAxis fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 25]} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px' }}
                                            />
                                            <Legend 
                                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px', cursor: 'pointer' }} 
                                                onClick={handleLegendClick}
                                                iconType="circle"
                                            />
                                            {plottedTopics.map((topic, index) => {
                                                // Determine opacity: if something is highlighted and it's not this one, dim it
                                                const isDimmed = highlightedTopicId !== null && highlightedTopicId !== topic.id;
                                                const strokeOpacity = isDimmed ? 0.1 : 1;
                                                const strokeWidth = isDimmed ? 1 : 4;
                                                
                                                return (
                                                    <Line
                                                        key={topic.id}
                                                        type="monotone"
                                                        dataKey={topic.id}
                                                        name={topic.title.length > 20 ? topic.title.substring(0,20)+'...' : topic.title}
                                                        stroke={COLORS[index % COLORS.length]}
                                                        strokeWidth={strokeWidth}
                                                        strokeOpacity={strokeOpacity}
                                                        dot={false}
                                                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                                        label={(props) => <CustomizedLabel {...props} dataLength={chartData.length} trend={topic.riskTrend} opacity={strokeOpacity} />}
                                                        onClick={(e, p) => handleLineClick(e, p)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                );
                                            })}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Bottom Chart: Current Snapshot Bar Comparison */}
                    <div id="trend-bar-container" className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 min-h-[300px] relative transition-colors duration-300">
                         {/* Single Chart Download Button */}
                         <button 
                            onClick={(e) => handleDownloadImage('trend-bar-container', 'Current_Risk_Compare', e)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-[#FE5800] transition no-capture z-10"
                            title="Download Chart as Image"
                         >
                            <Download className="w-5 h-5" />
                         </button>

                        {chartData.length > 0 ? (
                            <div className="flex flex-col h-full">
                                <div className="mb-2 pr-12">
                                    <h3 className="text-lg font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-2">
                                        <PieIcon className="w-5 h-5 text-[#001A70] dark:text-blue-400" />
                                        Current Risk Score Comparison
                                        <div className="relative group/tooltip ml-1">
                                            <Info className="w-4 h-4 text-slate-300 hover:text-[#FE5800] cursor-help" />
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#0B142F] text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center border border-slate-700">
                                                A side-by-side comparison of the current snapshot risk scores for the selected tasks. Click a task name on the Y-axis to view its summary.
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0B142F]"></div>
                                            </div>
                                        </div>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Snapshot of current risk exposure (Consequence × Likelihood)</p>
                                </div>
                                <div className="flex-grow w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                            <XAxis type="number" domain={[0, 25]} hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                width={150} 
                                                tickLine={false}
                                                axisLine={false}
                                                tick={<ClickableYAxisTick onLabelClick={handleYAxisLabelClick} data={barChartData} />}
                                            />
                                            <Tooltip 
                                                cursor={{fill: 'transparent'}}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-[#0B142F] text-white text-xs p-3 rounded shadow-xl">
                                                                <p className="font-bold mb-1 text-[#FE5800]">{data.fullName}</p>
                                                                <p>Risk Score: <span className="font-bold">{data.riskScore}</span></p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="riskScore" radius={[0, 4, 4, 0]} barSize={20} className="cursor-pointer">
                                                {barChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} onClick={() => handleYAxisLabelClick(entry.id)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                <p className="text-sm">Select topics to view comparison.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Fullscreen Zoom Modal */}
            {isChartZoomed && (
                <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 p-6 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                           <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-3">
                                <Activity className="w-8 h-8 text-[#FE5800]" />
                                Historical Risk Evolution
                           </h2>
                           <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">
                                Detailed view: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                           </p>
                        </div>
                        <button 
                            onClick={() => setIsChartZoomed(false)}
                            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-600 dark:text-slate-300 hover:text-red-500 rounded-full transition"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex-grow w-full bg-[#F9FAFB] dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 100, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="date" 
                                    fontSize={14} 
                                    stroke="#64748b" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    minTickGap={50}
                                    height={50}
                                />
                                <YAxis fontSize={14} stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 25]} width={50} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px' }}
                                    labelStyle={{ color: '#64748b', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}
                                    itemStyle={{ fontSize: '14px', padding: '4px 0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '16px', paddingTop: '20px', cursor: 'pointer' }} iconSize={16} onClick={handleLegendClick} />
                                {plottedTopics.map((topic, index) => (
                                    <Line
                                        key={topic.id}
                                        type="monotone"
                                        dataKey={topic.id}
                                        name={topic.title}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={4}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                                        label={(props) => <CustomizedLabel {...props} dataLength={chartData.length} trend={topic.riskTrend} opacity={1} />}
                                        onClick={(e, p) => handleLineClick(e, p)}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Modal Integration */}
            {viewingTopic && (
                <TopicDetailModal topic={viewingTopic} onClose={() => setViewingTopic(null)} />
            )}
        </div>
    );
};

const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <BarChart2 className="w-8 h-8 text-slate-300 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500">Ready to Analyze</h3>
        <p className="max-w-xs text-center text-sm mt-2 text-slate-400 dark:text-slate-500">
        Select up to 8 topics from the left panel and click <strong>Plot Analysis</strong> to generate the charts.
        </p>
    </div>
);

export default TaskTrend;
