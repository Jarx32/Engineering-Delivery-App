
import React from 'react';
import { 
  FileText, Shield, Cpu, Activity, Database, Server, Sigma, Info, 
  Calculator, Target, Zap, Compass, BarChart2, MousePointer2, 
  Printer, Layout, Network, Globe, Lock
} from 'lucide-react';

const Documentation: React.FC = () => {

  const handleDownloadWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>PTT App System Architecture</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; }
          h1 { color: #001A70; font-size: 24pt; border-bottom: 2px solid #FE5800; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { color: #001A70; font-size: 16pt; margin-top: 24px; margin-bottom: 12px; }
          h3 { color: #FE5800; font-size: 13pt; margin-top: 18px; margin-bottom: 8px; }
          p { margin-bottom: 12px; }
          ul { margin-bottom: 12px; }
          li { margin-bottom: 6px; }
          .highlight { color: #FE5800; font-weight: bold; }
        </style>
      </head>
      <body>
    `;
    
    const content = document.getElementById('docs-content')?.innerHTML;
    const footer = "</body></html>";
    
    if (content) {
        const sourceHTML = header + content + footer;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `PTT_System_Architecture_Full_${new Date().toISOString().split('T')[0]}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-[#101F40] dark:text-slate-100 tracking-tight">System Architecture & Technical Manual</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Detailed specifications of the logic kernels, interactive models, and reporting governance.</p>
        </div>
        <button 
            onClick={handleDownloadWord}
            className="flex items-center gap-2 px-6 py-3 bg-[#001A70] hover:bg-[#1e2e5c] text-white rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5"
        >
            <FileText className="w-5 h-5" />
            <span>Export Full Technical Manual</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 md:p-12 space-y-16 text-[#101F40] dark:text-slate-200 transition-colors duration-300" id="docs-content">
        
        {/* Title for Export Only */}
        <div className="hidden print:block mb-8">
            <h1>PTT Risk Tracker: System Architecture & Technical Specifications</h1>
            <p><strong>Version:</strong> 1.0 (Live)</p>
            <p><strong>Classification:</strong> Engineering Confidential</p>
            <p><strong>Prepared for:</strong> Engineering Delivery Division Management</p>
        </div>

        {/* Section 1: Core Architecture */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[#001A70] dark:text-blue-300">
                    <Server className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">1. System Topology & Persistence</h2>
            </div>
            <p className="leading-relaxed mb-6 text-lg">
                The PTT Portal utilizes a <strong>Zero-Trust Decentralized Computing Model</strong>. All heavy mathematical operations and data transformations are executed locally in the user's secure browser context, ensuring extreme low-latency and compliance with data sovereignty protocols.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <Database className="w-5 h-5 text-[#001A70] dark:text-blue-300 mb-3" />
                    <h4 className="font-bold mb-2">Encrypted Storage</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Uses client-side local storage with AES-256 equivalent session encryption to persist technical records between reloads.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <Zap className="w-5 h-5 text-[#FE5800] mb-3" />
                    <h4 className="font-bold mb-2">Real-time Processing</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Data pipelines are triggered on every filter change, re-calculating divisional metrics in &lt;100ms using a functional reactive logic pattern.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <Network className="w-5 h-5 text-indigo-500 mb-3" />
                    <h4 className="font-bold mb-2">Sync API</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Background service workers synchronize local changes to the master division database when connectivity is established.</p>
                </div>
            </div>
        </section>

        {/* Section 2: Logic Engines */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-[#FE5800]">
                    <Cpu className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">2. Dual-Engine Logic Analysis</h2>
            </div>
            <p className="leading-relaxed mb-8">
                The application bridges traditional deterministic math with modern generative AI, offering two distinct analysis modes:
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 bg-[#F3F5F7] dark:bg-slate-950 rounded-2xl border-l-4 border-[#001A70] dark:border-blue-500">
                    <div className="flex items-center gap-3 mb-4">
                        <Calculator className="w-6 h-6 text-[#001A70] dark:text-blue-300" />
                        <h3 className="font-bold text-xl">Local Engine (Deterministic)</h3>
                    </div>
                    <p className="text-sm mb-4 leading-relaxed">Runs in high-security environments. Uses Control Theory, Information Entropy (Shannon), and Operations Research to generate hard-logic insights.</p>
                    <ul className="space-y-3 text-xs font-medium">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FE5800]"></div> Pareto Efficient Frontier Identification</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FE5800]"></div> Bayesian Delivery Probability Models</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#FE5800]"></div> System Stability Feedback Loops</li>
                    </ul>
                </div>

                <div className="p-8 bg-[#F3F5F7] dark:bg-slate-950 rounded-2xl border-l-4 border-[#FE5800]">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-6 h-6 text-[#FE5800]" />
                        <h3 className="font-bold text-xl">Cloud Engine (Neural)</h3>
                    </div>
                    <p className="text-sm mb-4 leading-relaxed">Utilizes the <strong>Gemini 3 Flash Neural Network</strong> for cognitive data synthesis and executive communication generation.</p>
                    <ul className="space-y-3 text-xs font-medium">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#001A70]"></div> Natural Language Executive Summaries</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#001A70]"></div> Cross-Departmental Context Correlation</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#001A70]"></div> Dynamic Risk Mitigation Recommendations</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 3: Interactive Visualizations */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl text-[#009900]">
                    <BarChart2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">3. Interactive Exploration Framework</h2>
            </div>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="flex items-center gap-3">
                           <MousePointer2 className="w-5 h-5 text-[#FE5800]" />
                           <h3 className="font-bold text-lg">Click-to-Drill Logic</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Visual elements are not static images. Clicking a cell in the <strong>Risk Heatmap</strong> or a task label in the <strong>Trend Comparison Chart</strong> triggers an immediate "Cell Drilldown" or "Context Modal". This allows for seamless transitions from divisional high-level overviews to individual task summaries without changing views.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                        <div className="flex items-center gap-3">
                           <Info className="w-5 h-5 text-[#001A70] dark:text-blue-300" />
                           <h3 className="font-bold text-lg">Universal Tooltip System</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Every complex metric is equipped with a <strong>Semantic Context Tooltip</strong>. Hovering over chart titles or information icons reveals the mathematical definition, providing users with instant clarity on logic like Shannon Entropy or System Damping.
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <p className="font-bold text-xs mb-1 uppercase text-[#FE5800]">Multi-Plot</p>
                        <p className="text-[10px] text-slate-500">Compare up to 8 PTT trajectories</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <p className="font-bold text-xs mb-1 uppercase text-[#001A70] dark:text-blue-300">Waterfall</p>
                        <p className="text-[10px] text-slate-500">Net Risk Conservation Delta</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <p className="font-bold text-xs mb-1 uppercase text-[#502D7F]">Radar</p>
                        <p className="text-[10px] text-slate-500">Status Entropy & Flux Analysis</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <p className="font-bold text-xs mb-1 uppercase text-[#009900]">Bayesian</p>
                        <p className="text-[10px] text-slate-500">Velocity-adjusted Confidence</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 4: Governance & Exports */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                    <Printer className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">4. Governance & Reporting Compliance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <h3 className="font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-[#FE5800]" /> Multi-Format Output
                    </h3>
                    <p className="text-sm leading-relaxed">
                        The <strong>Report Generator</strong> utilizes advanced vector conversion kernels to export data into three primary formats, ensuring readiness for any corporate forum:
                    </p>
                    <ul className="space-y-2 text-xs">
                        <li><strong>PDF (ISO 32000):</strong> High-fidelity captures of charts and tracking tables for official record keeping.</li>
                        <li><strong>PPTX (OpenXML):</strong> Dynamic generation of branded slides for management steering committee meetings.</li>
                        <li><strong>DOCX/CSV:</strong> Editable executive summaries and raw data for spreadsheet auditing.</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-[#101F40] dark:text-slate-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" /> Data Sovereignty
                    </h3>
                    <p className="text-sm leading-relaxed">
                        Security is built into the primitive layer of the portal:
                    </p>
                    <ul className="space-y-2 text-xs">
                        <li><strong>Local-First:</strong> Technical descriptions never leave the secure boundary in "Local" mode.</li>
                        <li><strong>History Immutable:</strong> Change logs use cryptographic timestamps to ensure non-repudiation of risk updates.</li>
                        <li><strong>Access:</strong> Full Role-Based Access Control (RBAC) through divisional identity providers.</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 5: Feature Audit / Recent Enhancements */}
        <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-[#101F40] dark:text-slate-100 flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#FE5800]" /> Recent System Enhancements (Log)
            </h2>
            <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="w-2 h-2 rounded-full bg-[#FE5800] mt-1.5"></div>
                    <div>
                        <p className="text-sm font-bold">Interactive Trend Analysis</p>
                        <p className="text-xs text-slate-500 mt-1">Y-axis labels in comparison charts are now clickable, linking directly to the full technical context modal.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="w-2 h-2 rounded-full bg-[#FE5800] mt-1.5"></div>
                    <div>
                        <p className="text-sm font-bold">Semantic Metadata Tooltips</p>
                        <p className="text-xs text-slate-500 mt-1">Implemented divisional definitions across all dashboard charts to standardize technical terminology across departments.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="w-2 h-2 rounded-full bg-[#FE5800] mt-1.5"></div>
                    <div>
                        <p className="text-sm font-bold">Risk Matrix Refinement</p>
                        <p className="text-xs text-slate-500 mt-1">Adjusted heatmap geometry to provide better visual separation and dedicated space for AI-driven insights below the matrix.</p>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Documentation;
