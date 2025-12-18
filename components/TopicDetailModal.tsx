
import React from 'react';
import { Topic, Priority, Status, RiskTrend } from '../types';
import { X, User, Calendar, FileText, Activity, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import TopicTrendChart from './TopicTrendChart';

// --- Helper Badges (Duplicated here for self-containment/reusability) ---

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

const TrendIcon: React.FC<{ trend: RiskTrend }> = ({ trend }) => {
    switch (trend) {
        case RiskTrend.ESCALATING:
            return (
              <div title="Escalating" className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-full inline-block flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-xs pr-3">
                <TrendingUp className="w-4 h-4" /> Escalating
              </div>
            );
        case RiskTrend.IMPROVING:
            return (
              <div title="Improving" className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-full inline-block flex items-center gap-1 text-[#009900] dark:text-green-400 font-bold text-xs pr-3">
                <TrendingDown className="w-4 h-4" /> Improving
              </div>
            );
        default:
            return (
              <div title="Stable" className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full inline-block flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold text-xs pr-3">
                <Minus className="w-4 h-4" /> Stable
              </div>
            );
    }
};

const TopicDetailModal: React.FC<{ topic: Topic; onClose: () => void }> = ({ topic, onClose }) => {
  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(today.getMonth() - 12);
  const startDateStr = twelveMonthsAgo.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-[#0B142F] p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-mono tracking-wide text-blue-200">{topic.id}</span>
               <span className="text-sm font-bold text-[#FE5800] uppercase tracking-wider">{topic.department}</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">{topic.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow transition-colors duration-300">
          
          {/* Key Metrics Row */}
          <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current Priority</p>
               <PriorityBadge priority={topic.priority} large />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Risk Trend</p>
               <TrendIcon trend={topic.riskTrend} />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
               <StatusBadge status={topic.status} />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Owner</p>
               <div className="flex items-center gap-2 font-bold text-[#101F40] dark:text-slate-200">
                 <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                 </div>
                 {topic.owner}
               </div>
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Site Need Date</p>
               <div className="flex items-center gap-2 font-bold text-[#FE5800]">
                  <Calendar className="w-4 h-4" />
                  {new Date(topic.targetResolutionDate).toLocaleDateString()}
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left Column: Context & Chart */}
             <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-[#101F40] dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-[#001A70] dark:text-blue-400" /> Context & Description
                   </h3>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                     {topic.description}
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-[#101F40] dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-2">
                     <Activity className="w-4 h-4 text-[#FE5800]" /> 12-Month Risk Trend
                   </h3>
                   <div className="h-60 w-full border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                      <TopicTrendChart topic={topic} startDate={startDateStr} endDate={endDateStr} />
                   </div>
                </div>
             </div>

             {/* Right Column: Update History */}
             <div className="flex flex-col h-full">
                <h3 className="text-sm font-bold text-[#101F40] dark:text-slate-100 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" /> Update Notes
                </h3>
                <div className="flex-grow bg-[#F3F5F7] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 max-h-[400px] overflow-y-auto custom-scrollbar transition-colors">
                   {topic.history && topic.history.length > 0 ? (
                      <ul className="space-y-6 relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 my-2">
                        {topic.history.slice().reverse().map((h, idx) => (
                          <li key={idx} className="ml-6 relative">
                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-[#001A70] dark:border-blue-500"></div>
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                               <p className="text-sm font-bold text-[#101F40] dark:text-slate-200">{h.description}</p>
                               {h.changes && h.changes.length > 0 && (
                                 <ul className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                   {h.changes.map((c, cIdx) => (
                                     <li key={cIdx}>
                                       <span className="font-semibold">{c.field}:</span> {c.oldValue} &rarr; {c.newValue}
                                     </li>
                                   ))}
                                 </ul>
                               )}
                               <p className="text-[10px] text-slate-400 mt-2 font-medium flex justify-between">
                                  <span>{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span>{h.user}</span>
                               </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                       <p className="text-sm italic">No update history recorded.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopicDetailModal;
