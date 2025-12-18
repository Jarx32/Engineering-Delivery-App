
import React, { useState, useEffect } from 'react';
import { Topic, RiskTrend, ReportMetrics, Department } from '../types';
import { generateReportMetrics } from '../services/topicService';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { FileText, Calendar, Printer, TrendingUp, TrendingDown, Download, FileSpreadsheet, Filter, X, Presentation, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

interface ReportGeneratorProps {
  filteredTopics: Topic[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ filteredTopics }) => {
  // Date State Initialization
  const today = new Date().toISOString().split('T')[0];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(sixMonthsAgoStr);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedTrend, setSelectedTrend] = useState<string>('All');
  const [reportData, setReportData] = useState<ReportMetrics | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingPPT, setGeneratingPPT] = useState(false);

  // Filter topics based on report-specific filters (Department, Trend) before generating metrics
  const activeTopics = React.useMemo(() => {
    let filtered = filteredTopics;
    
    if (selectedDept !== 'All') {
      filtered = filtered.filter(t => t.department === selectedDept);
    }

    if (selectedTrend !== 'All') {
      filtered = filtered.filter(t => t.riskTrend === selectedTrend);
    }

    return filtered;
  }, [filteredTopics, selectedDept, selectedTrend]);

  useEffect(() => {
    if (startDate && endDate) {
      const data = generateReportMetrics(activeTopics, startDate, endDate);
      setReportData(data);
    }
  }, [activeTopics, startDate, endDate]);

  const clearFilters = () => {
    setStartDate(sixMonthsAgoStr);
    setEndDate(today);
    setSelectedDept('All');
    setSelectedTrend('All');
  };

  const handleExportWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>PTT Risk Report</title></head><body>
      <h1>PTT (Priority Technical Topics) Risk Assessment Report</h1>
      <p><strong>Engineering Delivery Division</strong></p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
      <p>Filter: ${selectedDept} | Trend: ${selectedTrend} | Range: ${startDate} to ${endDate}</p>
    `;
    const content = document.getElementById('report-content')?.innerHTML;
    const footer = "</body></html>";
    
    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `PTT_Report_${new Date().toISOString().split('T')[0]}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;

    setGeneratingPDF(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Ensure white background for PDF even in dark mode
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const pdfHeight = imgHeight / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PTT_Risk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Failed to generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleExportPPT = async () => {
    setGeneratingPPT(true);
    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      // --- Define Master Slide (Branding) ---
      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: 'F3F5F7' },
        objects: [
          { rect: { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: 'FE5800' } } }, // Top Orange Bar
          { rect: { x: 0, y: 0.15, w: '100%', h: 0.6, fill: { color: '001A70' } } }, // Header Navy Bar
          { text: { text: 'PTT.Risk Delivery App', options: { x: 0.5, y: 0.25, w: 4, h: 0.4, fontSize: 18, color: 'FFFFFF', bold: true, fontFace: 'Arial' } } },
          { text: { text: 'Engineering Delivery Division', options: { x: 0.5, y: 0.55, w: 5, h: 0.3, fontSize: 10, color: 'FE5800', bold: true, fontFace: 'Arial' } } },
          { text: { text: `Generated: ${new Date().toLocaleDateString()}`, options: { x: 8.5, y: 0.25, w: 1.0, h: 0.3, fontSize: 10, color: 'FFFFFF', align: 'right' } } }
        ]
      });

      // --- Helper to capture DOM element ---
      const capture = async (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' }); // White bg for PPT captures
        return canvas.toDataURL('image/png');
      };

      // --- Slide 1: Title & Key Metrics ---
      const slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      slide1.addText('Risk Assessment Overview', { x: 0.5, y: 1.0, w: 8, h: 0.5, fontSize: 24, bold: true, color: '101F40' });
      slide1.addText(`Filter: ${selectedDept} | Trend: ${selectedTrend} | Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, { x: 0.5, y: 1.5, w: 8, h: 0.3, fontSize: 12, color: '666666' });

      // Capture Metrics Row
      const metricsImg = await capture('report-metrics-row');
      if (metricsImg) {
         slide1.addImage({ data: metricsImg, x: 0.5, y: 1.5, w: 9.0, h: 1.2 });
      }

      // Capture Risk Evolution Chart
      const riskChartImg = await capture('report-risk-chart');
      if (riskChartImg) {
          slide1.addText('Cumulative Risk Trend', { x: 0.5, y: 2.8, fontSize: 14, bold: true, color: '001A70' });
          slide1.addImage({ data: riskChartImg, x: 0.5, y: 3.0, w: 4.4, h: 2.2 });
      }

       // Capture Volume Chart
      const volChartImg = await capture('report-volume-chart');
      if (volChartImg) {
          slide1.addText('Volume Analysis', { x: 5.1, y: 2.8, fontSize: 14, bold: true, color: '001A70' });
          slide1.addImage({ data: volChartImg, x: 5.1, y: 3.0, w: 4.4, h: 2.2 });
      }

      // --- Slide 2: Movers Table ---
      const slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      slide2.addText('Risk Movers & Detailed Status', { x: 0.5, y: 1.0, w: 8, h: 0.5, fontSize: 24, bold: true, color: '101F40' });

      const tableImg = await capture('report-table');
      if (tableImg) {
          slide2.addImage({ data: tableImg, x: 0.5, y: 1.5, w: 9.0, h: 3.8 });
      } else {
        slide2.addText('No table data available for this selection.', { x: 0.5, y: 3, fontSize: 14, color: '999999' });
      }

      pptx.writeFile({ fileName: `PTT_Report_Slides_${new Date().toISOString().split('T')[0]}.pptx` });

    } catch (error) {
      console.error("PPT Generation Error", error);
      alert("Failed to generate PowerPoint");
    } finally {
      setGeneratingPPT(false);
    }
  };

  const handleDownloadTableCSV = () => {
    if (!reportData?.topicMovements) return;

    const headers = ['Topic Title', 'Priority', 'Department', 'Risk Trend', 'Status', 'Risk Score', 'Last Updated'];
    const rows = reportData.topicMovements.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.department,
      t.riskTrend,
      t.status,
      t.consequence * t.likelihood,
      new Date(t.updatedAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PTT_Trending_Risks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = reportData ? reportData.dates.map((date, i) => ({
    date,
    riskScore: reportData.riskTrend[i],
    active: reportData.activeCount[i],
    resolved: reportData.resolvedCount[i]
  })) : [];

  const hasFilters = selectedDept !== 'All' || selectedTrend !== 'All' || startDate !== sixMonthsAgoStr || endDate !== today;

  return (
    <div className="space-y-8" id="report-container">
      {/* Configuration Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 no-print flex flex-col lg:flex-row gap-6 items-center justify-between transition-colors duration-300">
        <div className="flex items-start gap-4 flex-1">
           <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
             <FileText className="w-6 h-6 text-[#001A70] dark:text-blue-400" />
           </div>
           <div>
              <h3 className="font-bold text-[#101F40] dark:text-slate-100 text-lg drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Report Configuration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generating analysis for <span className="font-bold text-[#FE5800]">{activeTopics.length} PTTs</span> based on current filters.
              </p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          {/* Department Filter - Increased width and optimized padding */}
          <div className="w-full sm:min-w-[280px]">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Filter by Area</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="pl-9 w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 transition-colors truncate"
              >
                <option value="All">All Departments</option>
                {Object.values(Department).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trend Filter */}
          <div className="w-full sm:w-48">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Risk Trend</label>
            <div className="relative">
              <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedTrend}
                onChange={(e) => setSelectedTrend(e.target.value)}
                className="pl-12 w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="All">All Trends</option>
                {Object.values(RiskTrend).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="w-full sm:w-auto">
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Analysis Period</label>
             <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 transition-colors">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-32 cursor-pointer"
                />
                <span className="text-slate-400 text-xs font-bold">TO</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-32 cursor-pointer"
                />
             </div>
          </div>

          {hasFilters && (
            <div className="w-full sm:w-auto mt-6 sm:mt-0">
               <button 
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors flex items-center justify-center gap-1 w-full shadow-sm border border-transparent hover:border-red-100"
                  title="Reset to Defaults"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
            </div>
          )}
        </div>
      </div>

      {reportData && (
        <div className="space-y-8 animate-fade-in" id="report-content">
          {/* Report Header */}
          <div className="flex justify-between items-center bg-[#101F40] text-white p-8 rounded-t-2xl shadow-lg print:bg-white print:text-black print:border-b-2 print:border-black">
            <div>
              <h1 className="text-3xl font-bold tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">PTT Risk Assessment Report</h1>
              <p className="text-blue-200 print:text-slate-500 mt-1 drop-shadow-sm">
                Engineering Delivery Division • {selectedDept === 'All' ? 'All Areas' : selectedDept} • {selectedTrend === 'All' ? 'All Trends' : selectedTrend} • {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 no-print">
              <button 
                onClick={handleExportWord} 
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e2e5c] hover:bg-[#2a3f7a] rounded-full transition text-sm font-bold border border-[#2a3f7a]"
              >
                <Download className="w-4 h-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" /> <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Export Word</span>
              </button>
              <button
                onClick={handleExportPPT}
                disabled={generatingPPT}
                 className={`flex items-center gap-2 px-5 py-2.5 bg-[#FFB600] hover:bg-yellow-500 text-[#101F40] rounded-full transition text-sm font-bold shadow-lg ${generatingPPT ? 'opacity-75 cursor-wait' : ''}`}
              >
                <Presentation className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]" />
                <span>{generatingPPT ? 'Building...' : 'Export PPT'}</span>
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={generatingPDF}
                className={`flex items-center gap-2 px-5 py-2.5 bg-[#FE5800] hover:bg-[#D94A00] rounded-full transition text-sm font-bold shadow-lg ${generatingPDF ? 'opacity-75 cursor-wait' : ''}`}
              >
                <Printer className="w-4 h-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" /> 
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{generatingPDF ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div id="report-metrics-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <TrendingUp className="w-24 h-24 text-[#001A70] dark:text-blue-500" />
               </div>
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">Peak Risk Exposure</h3>
               <p className="text-4xl font-extrabold text-[#101F40] dark:text-slate-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                 {Math.max(...reportData.riskTrend, 0)}
               </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">Avg Active Volume</h3>
               <p className="text-4xl font-extrabold text-[#101F40] dark:text-slate-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                 {reportData.activeCount.length > 0 
                    ? Math.round(reportData.activeCount.reduce((a,b) => a+b, 0) / reportData.activeCount.length)
                    : 0}
               </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">Resolution Rate</h3>
               <p className="text-4xl font-extrabold text-[#009900] dark:text-green-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                 {reportData.resolvedCount.length > 0 
                    ? reportData.resolvedCount[reportData.resolvedCount.length - 1] 
                    : 0}
               </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
            {/* Risk Evolution Area Chart */}
            <div id="report-risk-chart" className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 print:break-inside-avoid transition-colors duration-300">
              <h3 className="text-xl font-bold text-[#101F40] dark:text-slate-100 mb-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Risk Profile Evolution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRiskReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FE5800" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FE5800" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" fontSize={12} stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis label={{ value: 'Total Risk Score', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} stroke="#64748b" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="riskScore" stroke="#FE5800" strokeWidth={3} fillOpacity={1} fill="url(#colorRiskReport)" name="Risk Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Bar Chart */}
            <div id="report-volume-chart" className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 print:break-inside-avoid transition-colors duration-300">
              <h3 className="text-xl font-bold text-[#101F40] dark:text-slate-100 mb-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">PTT Volume Analysis</h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" fontSize={12} stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="active" name="Active PTTs" fill="#001A70" radius={[4, 4, 0, 0]} stroke="#000000" strokeWidth={1} />
                    <Bar dataKey="resolved" name="Resolved Cumulative" fill="#009900" radius={[4, 4, 0, 0]} stroke="#000000" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Movers Table */}
          <div id="report-table" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden print:mt-8 transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-[#F3F5F7] dark:bg-slate-950 print:bg-white print:border-black flex justify-between items-center transition-colors">
              <h3 className="font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">PTT Risk Movers (Escalating & Improving)</h3>
              <button 
                onClick={handleDownloadTableCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[#009900] hover:bg-green-700 text-white text-xs font-bold rounded-full shadow-sm transition no-print border border-green-600"
                title="Download as CSV"
              >
                <FileSpreadsheet className="w-3 h-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" /> <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Export Data</span>
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900 print:bg-white">
                  <th className="px-6 py-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">PTT Title</th>
                  <th className="px-6 py-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Department</th>
                  <th className="px-6 py-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Trend</th>
                  <th className="px-6 py-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Status</th>
                  <th className="px-6 py-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.topicMovements.length > 0 ? (
                  reportData.topicMovements.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#101F40] dark:text-slate-100">{t.title}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{t.department}</td>
                      <td className="px-6 py-4">
                         {t.riskTrend === RiskTrend.ESCALATING ? (
                           <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-bold gap-1">
                             <TrendingUp className="w-4 h-4" /> Escalating
                           </span>
                         ) : (
                           <span className="flex items-center text-[#009900] dark:text-green-500 text-sm font-bold gap-1">
                             <TrendingDown className="w-4 h-4" /> Improving
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{t.status}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{new Date(t.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm font-medium">
                      No significant risk movements recorded in the current dataset/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
