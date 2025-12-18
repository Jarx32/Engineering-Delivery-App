
import React, { useState, useRef, useEffect } from 'react';
import { Topic, Priority, Status, Department, RiskTrend, FilterState } from '../types';
import { Edit2, Trash2, Search, Filter, Paperclip, TrendingUp, TrendingDown, Minus, Calendar, Download, ArrowRight, X, User, Activity, Clock, FileText, Printer, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import TopicTrendChart from './TopicTrendChart';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import TopicDetailModal from './TopicDetailModal';

interface TopicListProps {
  topics: Topic[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (id: string) => void;
}

const PriorityBadge: React.FC<{ priority: Priority, large?: boolean }> = ({ priority, large }) => {
  const styles = {
    [Priority.CRITICAL]: 'bg-red-50 dark:bg-red-900/30 text-[#FF0000] dark:text-red-400 border-red-100 dark:border-red-900',
    [Priority.HIGH]: 'bg-orange-50 dark:bg-orange-900/30 text-[#FE5800] dark:text-orange-400 border-orange-100 dark:border-orange-900',
    [Priority.MEDIUM]: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
    [Priority.LOW]: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900',
  };
  
  return (
    <span className={`rounded-full font-bold uppercase tracking-wider border ${styles[priority]} ${large ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'}`}>
      {priority}
    </span>
  );
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const styles = {
    [Status.NEW]: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [Status.UNDER_REVIEW]: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    [Status.IN_PROGRESS]: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    [Status.RESOLVED]: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    [Status.ON_HOLD]: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles[Status.ON_HOLD]}`}>
      {status}
    </span>
  );
};

const DeleteConfirmationModal: React.FC<{ topic: Topic; onConfirm: () => void; onCancel: () => void }> = ({ topic, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-slate-100 dark:border-slate-800">
       <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
             <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#101F40] dark:text-slate-100 mb-2">Delete Task?</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-[#101F40] dark:text-white">"{topic.title}"</span>? 
            <br/>This action cannot be undone.
          </p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              No, Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow-md hover:shadow-lg transition"
            >
              Yes, Delete
            </button>
          </div>
       </div>
    </div>
  </div>
);

const TopicList: React.FC<TopicListProps> = ({ topics, filters, onFilterChange, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
            setIsStatusDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSearchChange = (val: string) => {
    handleInputChange('searchTerm', val);
    setShowDropdown(true);
  };

  const handleSelectTopic = (title: string) => {
    handleInputChange('searchTerm', title);
    setShowDropdown(false);
  };

  const handleStatusToggle = (status: string) => {
      let newStatuses = [...filters.status];
      if (status === 'All') {
          newStatuses = ['All'];
      } else {
          // Remove 'All' if selecting specific
          if (newStatuses.includes('All')) {
              newStatuses = [];
          }

          if (newStatuses.includes(status)) {
              newStatuses = newStatuses.filter(s => s !== status);
          } else {
              newStatuses.push(status);
          }

          // If nothing selected, revert to All
          if (newStatuses.length === 0) {
              newStatuses = ['All'];
          }
      }
      onFilterChange({ ...filters, status: newStatuses });
  };

  const clearFilters = () => {
    onFilterChange({
        searchTerm: '',
        department: 'All',
        priority: 'All',
        status: ['All'],
        startDate: '',
        endDate: ''
    });
  };

  const confirmDelete = () => {
    if (topicToDelete) {
      onDelete(topicToDelete.id);
      setDeleteModalOpen(false);
      setTopicToDelete(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Title', 'Description', 'Department', 'Priority', 'Status', 
      'Owner', 'Risk Score', 'Consequence', 'Likelihood', 'Trend', 
      'Target Date', 'Created At'
    ];

    const rows = topics.map(t => {
      const safeStr = (str: string) => `"${str.replace(/"/g, '""')}"`;
      return [
        t.id,
        safeStr(t.title),
        safeStr(t.description),
        t.department,
        t.priority,
        t.status,
        safeStr(t.owner),
        t.consequence * t.likelihood,
        t.consequence,
        t.likelihood,
        t.riskTrend,
        t.targetResolutionDate,
        new Date(t.createdAt).toLocaleDateString()
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PTT_Tracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed'; 
      printContainer.style.left = '-10000px'; 
      printContainer.style.top = '0';
      printContainer.style.zIndex = '-9999';
      printContainer.style.width = '1800px'; 
      printContainer.style.backgroundColor = 'white';
      printContainer.style.padding = '40px';
      document.body.appendChild(printContainer);

      const originalTable = tableRef.current;
      const clonedTable = originalTable.cloneNode(true) as HTMLElement;
      
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; color: #101F40; margin-bottom: 5px;">PTT Task Tracker Export</h1>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Generated: ${new Date().toLocaleDateString()} | Active Tasks: ${topics.length}</p>
      `;
      printContainer.appendChild(headerDiv);

      clonedTable.style.width = '100%';
      clonedTable.querySelectorAll('td').forEach((td: any) => {
         td.style.whiteSpace = 'normal'; 
         td.style.overflow = 'visible';
         td.style.textOverflow = 'clip';
         td.style.verticalAlign = 'top';
         td.style.borderBottom = '1px solid #e2e8f0';
         td.style.padding = '12px';
         td.style.color = '#000'; // Force black text for PDF
      });

      clonedTable.querySelectorAll('th').forEach((th: any) => {
         th.style.whiteSpace = 'nowrap'; 
         th.style.backgroundColor = '#001A70';
         th.style.color = 'white';
         th.style.padding = '12px';
      });

      // Remove SVG icons from PDF to prevent rendering issues
      clonedTable.querySelectorAll('svg').forEach((svg: any) => svg.remove());

      printContainer.appendChild(clonedTable);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1800,
        windowWidth: 1800,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      
      const scaledHeight = imgHeight * ratio;

      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`PTT_Task_Tracker_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.removeChild(printContainer);

    } catch (error) {
      console.error("PDF Error", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div id="tracker-view-container" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors duration-300">
        {/* Filters Header */}
        <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-5 bg-white dark:bg-slate-900 relative z-30 transition-colors duration-300">
          
          {/* Top Row: Search, Date Range, and Export */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="relative flex-grow max-w-lg w-full group z-20">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#FE5800] transition-colors" />
              <input
                type="text"
                placeholder="Search tasks, owners..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FE5800] focus:border-transparent w-full text-sm transition-shadow shadow-sm placeholder-slate-400"
              />
              {/* Dropdown Suggestions */}
              {showDropdown && filters.searchTerm.length > 0 && topics.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <ul className="max-h-80 overflow-y-auto custom-scrollbar">
                    {topics.slice(0, 8).map(t => (
                      <li 
                        key={t.id}
                        onClick={() => handleSelectTopic(t.title)}
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[#101F40] dark:text-slate-200 text-sm">{t.title}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{t.id} • {t.owner}</p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 w-full xl:w-auto z-10">
              <div className="flex items-center gap-2 bg-[#F3F5F7] dark:bg-slate-800 px-3 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 w-full sm:w-auto transition-colors">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <input 
                  type="date" 
                  className="text-sm outline-none text-slate-600 dark:text-slate-300 bg-transparent font-medium w-full sm:w-auto cursor-pointer"
                  value={filters.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
                <span className="text-slate-400 dark:text-slate-500 text-xs">to</span>
                <input 
                  type="date" 
                  className="text-sm outline-none text-slate-600 dark:text-slate-300 bg-transparent font-medium w-full sm:w-auto cursor-pointer"
                  value={filters.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500 text-slate-500 dark:text-slate-400 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FE5800] hover:text-[#FE5800] text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap ${isGeneratingPDF ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isGeneratingPDF ? <Printer className="w-4 h-4 animate-pulse" /> : <Printer className="w-4 h-4" />}
                    <span>{isGeneratingPDF ? 'Gen...' : 'PDF'}</span>
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#009900] hover:text-[#009900] text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold transition-all shadow-sm ml-auto lg:ml-0 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Dropdown Filters & Status Toggle */}
          <div className="flex flex-wrap gap-3 pb-1 z-30 items-center relative">
            <div className="relative flex items-center w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-4" />
              <select 
                value={filters.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FE5800] appearance-none bg-white dark:bg-slate-800 cursor-pointer hover:border-[#FE5800] transition-colors shadow-sm text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Departments</option>
                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <select 
                value={filters.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FE5800] bg-white dark:bg-slate-800 cursor-pointer hover:border-[#FE5800] transition-colors shadow-sm text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Priorities</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            
            {/* Multi-Select Status Dropdown */}
            <div className="relative w-full sm:w-auto ml-auto sm:ml-0" ref={statusDropdownRef}>
                <button 
                   onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                   className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 cursor-pointer hover:border-[#FE5800] transition-colors shadow-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 min-w-[150px] justify-between focus:ring-2 focus:ring-[#FE5800]"
                >
                    <span>
                       {filters.status.includes('All') 
                         ? 'All Statuses' 
                         : `${filters.status.length} Selected`}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isStatusDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 p-2">
                         <div 
                           onClick={() => handleStatusToggle('All')}
                           className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                         >
                            <input 
                              type="checkbox" 
                              checked={filters.status.includes('All')} 
                              readOnly 
                              className="rounded text-[#FE5800] focus:ring-[#FE5800] dark:bg-slate-700 dark:border-slate-600"
                            />
                            <span className="text-sm font-medium text-[#101F40] dark:text-slate-200">All Statuses</span>
                         </div>
                         <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                         {Object.values(Status).map(s => (
                             <div 
                                key={s}
                                onClick={() => handleStatusToggle(s)}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                             >
                                <input 
                                  type="checkbox" 
                                  checked={filters.status.includes(s)} 
                                  readOnly
                                  className="rounded text-[#FE5800] focus:ring-[#FE5800] dark:bg-slate-700 dark:border-slate-600"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s}</span>
                             </div>
                         ))}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse" ref={tableRef}>
            <thead>
              <tr className="bg-[#001A70] text-white text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-5 rounded-tl-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Trend</th>
                <th className="px-6 py-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Priority</th>
                <th className="px-6 py-5 w-1/3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Topic Details</th>
                <th className="px-6 py-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Department</th>
                <th className="px-6 py-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Owner</th>
                <th className="px-6 py-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Status</th>
                <th className="px-6 py-5 text-right rounded-tr-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition duration-200 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex justify-center">
                          <div className={topic.riskTrend === RiskTrend.ESCALATING ? "text-red-500" : topic.riskTrend === RiskTrend.IMPROVING ? "text-green-500" : "text-slate-400"}>
                            {topic.riskTrend === RiskTrend.ESCALATING ? <TrendingUp className="w-5 h-5" /> : 
                             topic.riskTrend === RiskTrend.IMPROVING ? <TrendingDown className="w-5 h-5" /> : 
                             <Minus className="w-5 h-5" />}
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <PriorityBadge priority={topic.priority} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewingTopic(topic)}
                          className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-left"
                        >
                          {topic.title}
                        </button>
                        {topic.attachments && topic.attachments.length > 0 && (
                          <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {topic.department}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {topic.owner.charAt(0)}
                        </div>
                        {topic.owner}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge status={topic.status} />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(topic)}
                          className="text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white p-2 hover:bg-blue-600 rounded-full transition-colors"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setTopicToDelete(topic); 
                            setDeleteModalOpen(true); 
                          }}
                          className="text-slate-400 hover:text-white p-2 hover:bg-red-500 rounded-full transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium">No tasks found matching your current filters.</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-2 text-[#FE5800] text-sm font-bold hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center bg-[#F3F5F7] dark:bg-slate-950 transition-colors">
          Showing {topics.length} active tasks
        </div>
      </div>

      {/* Render Modal if a topic is selected */}
      {viewingTopic && (
        <TopicDetailModal topic={viewingTopic} onClose={() => setViewingTopic(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && topicToDelete && (
        <DeleteConfirmationModal 
          topic={topicToDelete} 
          onConfirm={confirmDelete} 
          onCancel={() => { setDeleteModalOpen(false); setTopicToDelete(null); }} 
        />
      )}
    </>
  );
};

export default TopicList;
