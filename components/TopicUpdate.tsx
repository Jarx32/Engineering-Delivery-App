
import React, { useState, useMemo } from 'react';
import { Topic, Department, Priority, Status } from '../types';
import { Search, Edit2, Calendar, User, ArrowRight, Filter, X } from 'lucide-react';
import TopicTrendChart from './TopicTrendChart';

interface TopicUpdateProps {
    topics: Topic[];
    onEdit: (topic: Topic) => void;
}

const TopicUpdate: React.FC<TopicUpdateProps> = ({ topics, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Filters for Update Search
    const [filterDept, setFilterDept] = useState<string>('All');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<string>('All');

    const filteredSuggestions = useMemo(() => {
        if (!searchTerm && filterDept === 'All' && filterPriority === 'All' && filterStatus === 'All') return [];
        
        return topics.filter(t => {
            const matchSearch = searchTerm.length === 0 || 
                               t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               t.id.includes(searchTerm);
            const matchDept = filterDept === 'All' || t.department === filterDept;
            const matchPrio = filterPriority === 'All' || t.priority === filterPriority;
            const matchStatus = filterStatus === 'All' || t.status === filterStatus;
            
            return matchSearch && matchDept && matchPrio && matchStatus;
        }).slice(0, 10);
    }, [topics, searchTerm, filterDept, filterPriority, filterStatus]);

    const handleSelect = (topic: Topic) => {
        setSelectedTopic(topic);
        setSearchTerm(topic.title);
        setShowDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const cleanTerm = searchTerm.trim().toLowerCase();
            if (!cleanTerm && filterDept === 'All' && filterPriority === 'All' && filterStatus === 'All') return;

            // 1. Try to find an EXACT match (Title or ID)
            const exactMatch = topics.find(t => 
                t.title.toLowerCase() === cleanTerm || 
                t.id.toLowerCase() === cleanTerm
            );

            if (exactMatch) {
                handleSelect(exactMatch);
                return;
            }

            // 2. If no exact match, select the first item in the filtered suggestions
            if (filteredSuggestions.length > 0) {
                handleSelect(filteredSuggestions[0]);
            }
        }
    };

    const clearLocalFilters = () => {
        setSearchTerm('');
        setFilterDept('All');
        setFilterPriority('All');
        setFilterStatus('All');
        setShowDropdown(false);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Task Update</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Locate a task via ID or search criteria to view history and apply updates.</p>
            </div>

            {/* Filter & Search Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-colors duration-300">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Narrow Search</span>
                    </div>

                    <select 
                        value={filterDept} 
                        onChange={(e) => { setFilterDept(e.target.value); setShowDropdown(true); }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Departments</option>
                        {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select 
                        value={filterPriority} 
                        onChange={(e) => { setFilterPriority(e.target.value); setShowDropdown(true); }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Priorities</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value); setShowDropdown(true); }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {(filterDept !== 'All' || filterPriority !== 'All' || filterStatus !== 'All' || searchTerm) && (
                        <button 
                            onClick={clearLocalFilters}
                            className="text-[#FE5800] text-xs font-bold hover:underline uppercase flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear Filters
                        </button>
                    )}
                </div>

                <div className="relative z-20">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-[#FE5800] transition-colors" />
                        <input
                            type="text"
                            placeholder="Enter task ID (e.g. 00001) or title keywords..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-16 pr-6 py-5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 focus:border-[#FE5800] text-lg font-medium shadow-sm transition-all bg-white dark:bg-slate-900 text-[#101F40] dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600"
                        />
                    </div>
                    
                    {showDropdown && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                            <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Matching Tasks ({filteredSuggestions.length})
                            </div>
                            <ul>
                                {filteredSuggestions.map(t => (
                                    <li 
                                        key={t.id} 
                                        onClick={() => handleSelect(t)}
                                        className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono font-bold bg-[#001A70] text-white px-2 py-0.5 rounded">ID: {t.id}</span>
                                                    <span className="text-[10px] font-bold text-[#FE5800] uppercase">{t.department}</span>
                                                </div>
                                                <p className="font-bold text-[#101F40] dark:text-slate-100">{t.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{t.owner} • {t.status}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {showDropdown && searchTerm && filteredSuggestions.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 text-center z-50">
                             <p className="text-slate-400 text-sm font-medium">No tasks match your ID or search criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            {selectedTopic && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    {/* Metadata Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#FE5800]"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-block px-3 py-1 bg-[#001A70] text-white rounded-full text-xs font-mono font-bold">
                                            TASK ID: {selectedTopic.id}
                                        </span>
                                        <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#001A70] dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {selectedTopic.department}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#101F40] dark:text-slate-100 mb-2">{selectedTopic.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedTopic.description}</p>
                                </div>
                                <button 
                                    onClick={() => onEdit(selectedTopic)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#101F40] dark:bg-slate-800 hover:bg-[#1e2e5c] dark:hover:bg-slate-700 text-white rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5 shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                                >
                                    <Edit2 className="w-4 h-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
                                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Update Task</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Created Date</p>
                                    <div className="flex items-center gap-2 text-[#101F40] dark:text-slate-200 font-medium">
                                        <Calendar className="w-4 h-4 text-[#FE5800]" />
                                        {new Date(selectedTopic.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Last Updated</p>
                                    <div className="flex items-center gap-2 text-[#101F40] dark:text-slate-200 font-medium">
                                        <Calendar className="w-4 h-4 text-[#FE5800]" />
                                        {new Date(selectedTopic.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Site Need Date</p>
                                    <div className="flex items-center gap-2 text-[#101F40] dark:text-slate-200 font-medium">
                                        <Calendar className="w-4 h-4 text-[#FE5800]" />
                                        {new Date(selectedTopic.targetResolutionDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Owner</p>
                                    <div className="flex items-center gap-2 text-[#101F40] dark:text-slate-200 font-medium">
                                        <User className="w-4 h-4 text-[#FE5800]" />
                                        {selectedTopic.owner}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Log */}
                         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                            <h4 className="font-bold text-[#101F40] dark:text-slate-100 mb-6 text-lg">Change History</h4>
                            <ul className="space-y-4 relative border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                                {selectedTopic.history.slice().reverse().map((h, idx) => (
                                    <li key={idx} className="ml-6 relative">
                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600"></div>
                                        <p className="text-sm font-bold text-[#101F40] dark:text-slate-200">{h.description}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(h.date).toLocaleDateString()} • {h.user}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Chart Column */}
                    <div className="lg:col-span-1">
                        <TopicTrendChart topic={selectedTopic} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicUpdate;
