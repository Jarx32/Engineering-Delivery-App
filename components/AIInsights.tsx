
import React, { useState, useMemo } from 'react';
import { generateExecutiveSummary } from '../services/geminiService';
import { Topic, Department, Priority, Status, AIMode } from '../types';
import { Bot, RefreshCw, Sparkles, Filter, Calendar, X, Printer, Download, FileText, Server, Cloud, Calculator, Sigma, TrendingUp, Compass, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AIInsightsProps {
  topics: Topic[];
  aiMode: AIMode;
  setAiMode: (mode: AIMode) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ topics, aiMode, setAiMode }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Filter States
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter Logic
  const activeTopics = useMemo(() => {
    return topics.filter(t => {
      const matchDept = filterDept === 'All' || t.department === filterDept;
      const matchPrio = filterPriority === 'All' || t.priority === filterPriority;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      
      let matchDate = true;
      if (startDate && endDate) {
         const start = new Date(startDate).getTime();
         const end = new Date(endDate).getTime();
         const updated = new Date(t.updatedAt).getTime();
         matchDate = updated >= start && updated <= (end + 86400000); 
      }

      return matchDept && matchPrio && matchStatus && matchDate;
    });
  }, [topics, filterDept, filterPriority, filterStatus, startDate, endDate]);

  const clearFilters = () => {
    setFilterDept('All');
    setFilterPriority('All');
    setFilterStatus('All');
    setStartDate('');
    setEndDate('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateExecutiveSummary(activeTopics, aiMode);
    setSummary(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const handleDownloadWord = () => {
    if (!summary) return;

    const htmlBody = summary.split('\n').map(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return '';

        const formatInline = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        if (cleanLine.startsWith('**')) {
           return `<h2 style="font-size:16pt; font-family:Arial, sans-serif; color:#001A70; margin-top:14pt; margin-bottom:6pt; border-bottom: 1px solid #eeeeee; padding-bottom: 4px;">${cleanLine.replace(/\*\*/g, '')}</h2>`;
        }

        if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
            const content = cleanLine.replace(/^[\*\-]\s+/, '');
            return `<p style="font-family:Arial, sans-serif; font-size:11pt; margin-left:24px; text-indent:-12px; margin-bottom:4pt; color:#333333;">• ${formatInline(content)}</p>`;
        }
        
        return `<p style="font-family:Arial, sans-serif; font-size:11pt; margin-bottom:8pt; line-height:1.5; color:#000000;">${formatInline(cleanLine)}</p>`;
    }).join('');

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>PTT Executive Summary</title></head>
      <body style="font-family: Arial, sans-serif;">
      <h1 style="color:#001A70; font-size:24pt;">Engineering Delivery Executive Summary</h1>
      <p style="color:#FE5800; font-weight:bold;">${new Date().toLocaleDateString()} | Context: ${activeTopics.length} Tasks</p>
      <hr style="border:1px solid #001A70;" />
      ${htmlBody}
      </body></html>
    `;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `PTT_Executive_Summary_${new Date().toISOString().split('T')[0]}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById('executive-summary-content');
    if (!input) return;

    setGeneratingPDF(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const pdfHeight = imgHeight / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PTT_Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return null;

      if (cleanLine.startsWith('**')) {
        const title = cleanLine.replace(/\*\*/g, '');
        let icon = <Sigma className="w-5 h-5" />;
        if (title.includes('1.')) icon = <Calculator className="w-5 h-5 text-[#FE5800]" />;
        if (title.includes('2.')) icon = <TrendingUp className="w-5 h-5 text-blue-500" />;
        if (title.includes('3.')) icon = <Compass className="w-5 h-5 text-purple-500" />;
        if (title.includes('4.')) icon = <Target className="w-5 h-5 text-red-500" />;
        
        return (
          <div key={idx} className="flex items-center gap-3 mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            {icon}
            <h4 className="font-bold text-[#101F40] dark:text-slate-100 text-xl">{title}</h4>
          </div>
        );
      }
      
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const content = cleanLine.replace(/^(\* |- )/, '');
        return (
          <li key={idx} className="ml-6 text-slate-700 dark:text-slate-300 mb-2 list-none flex items-start gap-2">
            <span className="text-[#FE5800] mt-1.5 font-bold">•</span>
            <span>{content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#101F40] dark:text-white">{part}</strong> : part)}</span>
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed text-base">
          {cleanLine.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#101F40] dark:text-white">{part}</strong> : part)}
        </p>
      );
    });
  };

  const hasFilters = filterDept !== 'All' || filterPriority !== 'All' || filterStatus !== 'All' || (startDate && endDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Configuration Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-6 items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-[#001A70] dark:text-indigo-300">
             <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#101F40] dark:text-slate-100">Statistical Analysis Context</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Defining data bounds for deterministic logic.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-28" />
                <span className="text-slate-400 text-xs">to</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-28" />
             </div>

             <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">
               <option value="All">All Departments</option>
               {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
             </select>

             <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800">
               <option value="All">All Priorities</option>
               {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
             </select>

             {hasFilters && (
                <button onClick={clearFilters} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
             )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300" id="executive-summary-content">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#001A70] to-[#FE5800]"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-[#001A70] to-[#1e2e5c] dark:from-slate-800 dark:to-slate-900 rounded-xl text-white shadow-lg">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#101F40] dark:text-slate-100">Intelligent Insights Portal</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {aiMode === 'cloud' ? 'Generative Neural Analysis' : 'Deterministic Mathematical Modeling'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 no-print">
             <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-3 mr-2">Engine</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                    <button onClick={() => setAiMode('local')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiMode === 'local' ? 'bg-white dark:bg-slate-700 shadow text-[#001A70] dark:text-white' : 'text-slate-400'}`}>Local (Math)</button>
                    <button onClick={() => setAiMode('cloud')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiMode === 'cloud' ? 'bg-white dark:bg-slate-700 shadow text-[#FE5800]' : 'text-slate-400'}`}>Cloud (AI)</button>
                </div>
             </div>

             <div className="flex gap-3">
                {summary && (
                <>
                    <button onClick={handleDownloadWord} className="flex items-center space-x-2 px-5 py-3 rounded-full font-bold transition shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#001A70] dark:hover:text-white">
                        <FileText className="w-4 h-4" /> <span>Export Word</span>
                    </button>
                    <button onClick={handleDownloadPDF} disabled={generatingPDF} className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold transition shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#FE5800] ${generatingPDF ? 'opacity-70' : ''}`}>
                        <Printer className="w-4 h-4" /> <span>PDF</span>
                    </button>
                </>
                )}

                <button onClick={handleGenerate} disabled={loading || activeTopics.length === 0} className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition shadow-md ${loading ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-[#001A70] hover:bg-[#1e2e5c] text-white'}`}>
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#FE5800]" />}
                    <span>{loading ? 'Processing Logic...' : 'Generate Full Report'}</span>
                </button>
             </div>
          </div>
        </div>

        <div className="bg-[#F3F5F7] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[500px] p-10 transition-colors">
          {summary ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="mb-10 pb-6 border-b-2 border-[#001A70] dark:border-blue-900 flex justify-between items-end">
                 <div>
                    <h3 className="text-4xl font-extrabold text-[#101F40] dark:text-slate-100 mb-2">Executive Summary</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Engineering Delivery Division Technical Audit</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Scope</p>
                    <p className="text-2xl font-black text-[#FE5800]">{activeTopics.length} PTTs</p>
                 </div>
              </div>
              {renderMarkdown(summary)}
              {lastUpdated && (
                <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-medium text-slate-400">
                    <p>ENGINEERING CONFIDENTIAL | DATA INTEGRITY VERIFIED</p>
                    <p>Generated {lastUpdated.toLocaleString()} | Mode: {aiMode.toUpperCase()}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 dark:text-slate-600 space-y-6">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-800">
                 <Calculator className="w-12 h-12 opacity-20" />
              </div>
              <div className="text-center max-w-lg space-y-2">
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400 tracking-tight">Logic Engine Ready</p>
                <p className="font-medium text-slate-400 dark:text-slate-500">
                  Select your engineering parameters and click the button above to run a comprehensive multi-disciplinary logic audit on <span className="text-[#FE5800] font-bold">{activeTopics.length}</span> PTTs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
