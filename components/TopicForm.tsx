
import React, { useState, useRef } from 'react';
import { Department, Priority, Status, Topic, Attachment, Likelihood, Consequence, RiskTrend, TopicHistory } from '../types';
import { Save, X, Paperclip, Upload, FileText, Trash2, TrendingUp, TrendingDown, Minus, Activity, AlertCircle, Info, Calendar, MessageSquare, ClipboardCheck } from 'lucide-react';

interface TopicFormProps {
  onSave: (topic: Topic, updateNote?: string, evidence?: string) => void;
  onCancel: () => void;
  initialData?: Topic | null;
}

// Reusable Label Component with Tooltip
const FormLabel: React.FC<{ label: string; required?: boolean; tooltip: string }> = ({ label, required, tooltip }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <div className="relative group z-10">
      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-[#FE5800] cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-[#0B142F] text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center border border-slate-700">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#0B142F]"></div>
      </div>
    </div>
  </div>
);

const TopicForm: React.FC<TopicFormProps> = ({ onSave, onCancel, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState<string>('');
  const [evidence, setEvidence] = useState<string>(initialData?.evidence || '');
  
  const [formData, setFormData] = useState<Partial<Topic>>(initialData || {
    title: '',
    description: '',
    department: Department.NUCLEAR_ISLAND,
    priority: Priority.MEDIUM,
    status: Status.NEW,
    owner: '',
    targetResolutionDate: '', 
    consequence: Consequence.MODERATE,
    likelihood: Likelihood.POSSIBLE,
    riskTrend: RiskTrend.STABLE,
    attachments: [],
    history: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setError(null); 
    if (name === 'consequence' || name === 'likelihood') {
       setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== id) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    const missingFields: string[] = [];
    if (!formData.title?.trim()) missingFields.push('Topic Title');
    if (!formData.description?.trim()) missingFields.push('Description');
    if (!formData.department) missingFields.push('Department');
    if (!formData.owner?.trim()) missingFields.push('Owner');
    if (!formData.targetResolutionDate) missingFields.push('Site Need Date');
    if (!formData.priority) missingFields.push('Priority Level');
    if (!formData.status) missingFields.push('Status');
    
    // Check for evidence if this is an update and risk assessment changed
    if (initialData) {
        const riskChanged = initialData.consequence !== formData.consequence || initialData.likelihood !== formData.likelihood;
        if (riskChanged && !evidence.trim()) {
            missingFields.push('Evidence (Justification for Risk Change)');
        }
    }

    if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const updatedHistory = [...(initialData?.history || [])];
    const newEntry: TopicHistory = {
        date: new Date().toISOString(),
        description: updateNote || (initialData ? 'Task Updated' : 'Task Created'),
        user: formData.owner || 'System',
        evidence: evidence,
        changes: []
    };

    if (initialData) {
        // Track specific changes
        const fields: (keyof Topic)[] = ['priority', 'status', 'consequence', 'likelihood', 'riskTrend', 'department'];
        fields.forEach(field => {
            if (initialData[field] !== formData[field]) {
                newEntry.changes?.push({
                    field: field.charAt(0).toUpperCase() + field.slice(1),
                    oldValue: initialData[field],
                    newValue: formData[field]
                });
            }
        });
        updatedHistory.push(newEntry);
    } else {
        updatedHistory.push(newEntry);
    }

    const newTopic: Topic = {
      id: initialData?.id || String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0'),
      title: formData.title!,
      description: formData.description!,
      department: formData.department as Department,
      priority: formData.priority as Priority,
      status: formData.status as Status,
      owner: formData.owner!,
      targetResolutionDate: formData.targetResolutionDate!,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      consequence: formData.consequence as Consequence,
      likelihood: formData.likelihood as Likelihood,
      riskTrend: formData.riskTrend as RiskTrend,
      evidence: evidence,
      attachments: formData.attachments || [],
      history: updatedHistory
    };

    onSave(newTopic, updateNote, evidence);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentRiskScore = (formData.consequence || 1) * (formData.likelihood || 1);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-5xl mx-auto relative overflow-visible transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#FE5800] rounded-t-2xl"></div>
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
           <div className="bg-[#FE5800] p-2 rounded-full text-white">
              <Activity className="w-5 h-5" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-[#101F40] dark:text-slate-100">
                {initialData ? 'Update Task Details' : 'Create New Task'}
              </h2>
              <p className="text-[10px] font-bold text-[#FE5800] uppercase tracking-widest opacity-70">Task designed by Poki</p>
           </div>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in transition-colors">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Main Information */}
          <div className="col-span-2 space-y-6">
             <div>
              <FormLabel 
                label="Topic Title" 
                required 
                tooltip="Enter a clear, concise headline describing the technical issue or risk." 
              />
              <input
                type="text"
                name="title"
                placeholder="e.g., Reactor Pump Vibration Analysis"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] focus:border-transparent outline-none transition text-lg font-medium text-[#101F40] dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 shadow-sm"
              />
            </div>
            <div>
              <FormLabel 
                label="Description" 
                required 
                tooltip="Provide detailed context, background information, and the potential impact of this issue." 
              />
              <textarea
                name="description"
                rows={4}
                placeholder="Detailed explanation of the issue..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] focus:border-transparent outline-none transition text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 shadow-sm"
              />
            </div>
          </div>

          <div>
            <FormLabel 
                label="Department" 
                required 
                tooltip="Select the engineering functional area responsible for this task." 
            />
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 appearance-none cursor-pointer font-medium text-slate-700 dark:text-slate-300 shadow-sm"
              >
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <FormLabel 
                label="Owner" 
                required 
                tooltip="The name of the individual currently assigned to resolve this task." 
            />
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Responsible Individual"
              className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none transition font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 shadow-sm"
            />
          </div>

          {/* Date Section - Side by Side */}
          <div>
            <FormLabel 
                label="Date of Update" 
                tooltip="The current date of this update entry (Read-only)." 
            />
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
               <input
                 type="date"
                 value={today}
                 readOnly
                 className="w-full pl-12 pr-5 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-600 rounded-lg outline-none font-medium cursor-not-allowed transition-colors"
               />
            </div>
          </div>

          <div>
            <FormLabel 
                label="Site Need Date" 
                required 
                tooltip="The target deadline by which this issue must be resolved to avoid site impact." 
            />
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FE5800] w-5 h-5" />
               <input
                 type="date"
                 name="targetResolutionDate"
                 value={formData.targetResolutionDate ? new Date(formData.targetResolutionDate).toISOString().split('T')[0] : ''}
                 onChange={handleChange}
                 className="w-full pl-12 pr-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none transition shadow-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-colors"
               />
            </div>
          </div>

          {/* Update Justification Logic */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <FormLabel 
                    label="Reason for Change / Update Note" 
                    tooltip="Provide a short explanation for this update entry (e.g., 'Target date delayed')." 
                 />
                 <div className="relative">
                   <MessageSquare className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                   <textarea
                     name="updateNote"
                     rows={3}
                     placeholder="Summary of what changed in this version..."
                     value={updateNote}
                     onChange={(e) => setUpdateNote(e.target.value)}
                     className="w-full pl-12 pr-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] focus:border-transparent outline-none transition text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 shadow-sm transition-colors"
                   />
                 </div>
              </div>

              <div>
                 <FormLabel 
                    label="Evidence / Justification" 
                    required={initialData && (initialData.consequence !== formData.consequence || initialData.likelihood !== formData.likelihood)}
                    tooltip="Provide specific evidence to justify changes, especially for risk assessment adjustments (e.g., 'Based on meeting minutes from 12/04/24', 'Verified by site inspection report #88')." 
                 />
                 <div className="relative">
                   <ClipboardCheck className="absolute left-4 top-4 text-[#FE5800] w-5 h-5" />
                   <textarea
                     name="evidence"
                     rows={3}
                     placeholder="What evidence justifies this change? (e.g. Meeting results, inspection data...)"
                     value={evidence}
                     onChange={(e) => setEvidence(e.target.value)}
                     className="w-full pl-12 pr-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] focus:border-transparent outline-none transition text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 shadow-sm transition-colors"
                   />
                 </div>
              </div>
          </div>

          {/* Risk Assessment Section */}
          <div className="col-span-1 md:col-span-2 bg-[#F3F5F7] dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
               <h3 className="text-sm font-bold text-[#101F40] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                 <Activity className="w-4 h-4 text-[#FE5800]" />
                 Risk Assessment Model
               </h3>
               <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Score</span>
                 <span className={`px-2.5 py-0.5 rounded-full text-sm font-extrabold text-white 
                   ${currentRiskScore >= 15 ? 'bg-[#FF0000]' : 
                     currentRiskScore >= 10 ? 'bg-[#FE5800]' :
                     currentRiskScore >= 5 ? 'bg-[#FFB600]' : 'bg-[#009900]'}`}>
                   {currentRiskScore}
                 </span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <FormLabel 
                    label="Consequence (1-5)" 
                    required 
                    tooltip="Rate the severity of impact if this risk materializes." 
                />
                <select
                  name="consequence"
                  value={formData.consequence}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <option value={1}>1 - Insignificant</option>
                  <option value={2}>2 - Minor</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - Major</option>
                  <option value={5}>5 - Severe</option>
                </select>
              </div>

              <div>
                <FormLabel 
                    label="Likelihood (1-5)" 
                    required 
                    tooltip="Rate the probability of this risk occurring." 
                />
                <select
                  name="likelihood"
                  value={formData.likelihood}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <option value={1}>1 - Rare</option>
                  <option value={2}>2 - Unlikely</option>
                  <option value={3}>3 - Possible</option>
                  <option value={4}>4 - Likely</option>
                  <option value={5}>5 - Almost Certain</option>
                </select>
              </div>

              <div>
                <FormLabel 
                    label="Risk Momentum" 
                    required 
                    tooltip="Indicate if the risk profile is increasing, decreasing, or stable." 
                />
                <div className="relative">
                  <select
                    name="riskTrend"
                    value={formData.riskTrend}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 appearance-none font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <option value={RiskTrend.ESCALATING}>Escalating</option>
                    <option value={RiskTrend.STABLE}>Stable</option>
                    <option value={RiskTrend.IMPROVING}>Improving</option>
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                     {formData.riskTrend === RiskTrend.ESCALATING && <TrendingUp className="w-4 h-4 text-red-500" />}
                     {formData.riskTrend === RiskTrend.STABLE && <Minus className="w-4 h-4 text-slate-400" />}
                     {formData.riskTrend === RiskTrend.IMPROVING && <TrendingDown className="w-4 h-4 text-[#009900]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <FormLabel 
                label="Priority Level" 
                required 
                tooltip="Select the urgency level." 
            />
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <FormLabel 
                label="Current Status" 
                required 
                tooltip="Update the current workflow state." 
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#FE5800] outline-none bg-white dark:bg-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {Object.values(Status).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#001A70] dark:text-blue-400" />
                Attached Documentation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Stored in SharePoint repository (Optional).</p>
            </div>
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-slate-800 text-[#001A70] dark:text-blue-300 rounded-full text-sm font-bold hover:bg-blue-100 dark:hover:bg-slate-700 transition border border-blue-100 dark:border-slate-700"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </label>
            </div>
          </div>

          <div className="bg-[#F3F5F7] dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 min-h-[100px] flex flex-col justify-center transition-colors">
            {formData.attachments && formData.attachments.length > 0 ? (
              <ul className="space-y-3">
                {formData.attachments.map((file) => (
                  <li key={file.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#101F40] dark:text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{formatSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(file.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-600 text-sm italic">
                No documents currently attached.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition">
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#FE5800] hover:bg-[#D94A00] text-white font-bold flex items-center space-x-2 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Save Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicForm;
