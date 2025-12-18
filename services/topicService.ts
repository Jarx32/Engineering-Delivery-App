
import { Topic, Department, Priority, Status, DashboardMetrics, ScatterDataPoint, HeatmapCell, Consequence, Likelihood, RiskTrend, TopicHistory, WaterfallDataPoint, ReportMetrics, RiskHistoryPoint, EntropyMetric, ParetoPoint, BayesianConfidence, ControlStabilityPoint } from '../types';

const STORAGE_KEY = 'ptt_topics_v1';

// Helper to create a history entry
const createHistory = (desc: string, dateOffsetDays = 0): TopicHistory => ({
  date: new Date(Date.now() - 86400000 * dateOffsetDays).toISOString(),
  description: desc,
  user: 'System',
  changes: []
});

const MANUAL_SEED_DATA: Topic[] = [
  {
    id: '00001',
    title: 'Reactor Coolant Pump Vibration Analysis',
    description: 'Higher than expected vibration readings on RCP-2B during hot functional testing commissioning phase.',
    department: Department.NUCLEAR_ISLAND,
    priority: Priority.CRITICAL,
    status: Status.IN_PROGRESS,
    owner: 'Dr. A. Smith',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    targetResolutionDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    consequence: Consequence.SEVERE, 
    likelihood: Likelihood.POSSIBLE, 
    riskTrend: RiskTrend.ESCALATING,
    attachments: [
        {
            id: 'att-1',
            name: 'RCP_Vibration_Log_May.pdf',
            size: 1024500,
            type: 'application/pdf',
            uploadDate: new Date().toISOString()
        }
    ],
    history: [
      createHistory('Topic Created', 30),
      createHistory('Risk Escalated: Vibration levels increased during secondary test.', 5)
    ]
  },
  {
    id: '00002',
    title: 'Turbine Hall Crane Certification',
    description: 'Documentation for the main overhead crane in the conventional island is pending final regulatory review.',
    department: Department.CONVENTIONAL_ISLAND,
    priority: Priority.HIGH,
    status: Status.UNDER_REVIEW,
    owner: 'M. Johnson',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
    targetResolutionDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    consequence: Consequence.MAJOR, 
    likelihood: Likelihood.LIKELY, 
    riskTrend: RiskTrend.STABLE,
    attachments: [],
    history: [
       createHistory('Topic Created', 45),
       createHistory('Submitted for review', 10)
    ]
  },
  {
    id: '00003',
    title: 'Concrete Pour Schedule - Slab 4',
    description: 'Weather delays impacting the civil works schedule for the auxiliary building foundation.',
    department: Department.CIVIL_WORKS,
    priority: Priority.MEDIUM,
    status: Status.NEW,
    owner: 'S. Williams',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    targetResolutionDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    consequence: Consequence.MODERATE, 
    likelihood: Likelihood.ALMOST_CERTAIN, 
    riskTrend: RiskTrend.ESCALATING,
    attachments: [],
    history: [createHistory('Topic Created', 5)]
  },
  {
    id: '00004',
    title: 'Steam Generator Delivery Logistics',
    description: 'Route survey update required for heavy haul transport of SG-1.',
    department: Department.EQUIPMENT,
    priority: Priority.HIGH,
    status: Status.IN_PROGRESS,
    owner: 'K. Lee',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    targetResolutionDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    consequence: Consequence.MODERATE, 
    likelihood: Likelihood.POSSIBLE, 
    riskTrend: RiskTrend.IMPROVING,
    attachments: [
         {
            id: 'att-2',
            name: 'SG_Transport_Route_Map_v3.png',
            size: 4500100,
            type: 'image/png',
            uploadDate: new Date().toISOString()
        }
    ],
    history: [
      createHistory('Topic Created', 60),
      createHistory('Risk reduced after route survey confirmation', 2)
    ]
  },
  {
    id: '00005',
    title: 'Fire Suppression System Test',
    description: 'Routine testing of the deluge system in Zone 3 completed successfully.',
    department: Department.SAFETY_LICENSING,
    priority: Priority.LOW,
    status: Status.RESOLVED,
    owner: 'P. Davis',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
    targetResolutionDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    consequence: Consequence.MINOR, 
    likelihood: Likelihood.UNLIKELY, 
    riskTrend: RiskTrend.STABLE,
    attachments: [],
    history: [
      createHistory('Topic Created', 90),
      createHistory('Issue Resolved', 5)
    ]
  },
  {
      id: '00006',
      title: 'Control Room HVAC Damper Failure',
      description: 'Dampers failing to close within specified time limits during interlock tests.',
      department: Department.NUCLEAR_ISLAND,
      priority: Priority.CRITICAL,
      status: Status.NEW,
      owner: 'T. Harris',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      targetResolutionDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      consequence: Consequence.SEVERE, 
      likelihood: Likelihood.LIKELY, 
      riskTrend: RiskTrend.ESCALATING,
      attachments: [],
      history: [createHistory('Topic Created', 2)]
  }
];

const generateMockTopics = (): Topic[] => {
  const departments = Object.values(Department);
  const priorities = Object.values(Priority);
  const statuses = Object.values(Status);
  const owners = ['J. Doe', 'A. Smith', 'R. Geller', 'M. Bing', 'P. Buffay', 'C. Bing', 'L. Kudrow', 'S. Perry', 'J. Aniston', 'D. Schwimmer', 'G. Costanza', 'J. Seinfeld', 'E. Benes', 'K. Kramer'];
  
  const topics: Topic[] = [...MANUAL_SEED_DATA];
  const TITLES = ["Valve Leakage", "Cable Routing Clash", "Concrete Spalling", "Pump Seal Failure", "Software Glitch", "Drawing Mismatch", "Material Shortage", "Regulatory Finding", "Safety Observation", "Design Change", "Weld Defect", "Instrumentation Drift", "HVAC Performance", "Fire Door Latch", "Piping Vibration", "Seismic Anchor Bolt", "Electrical Grounding", "Emergency Lighting", "Access Control", "Cyber Security Patch"];
  const SUBTITLES = ["Unit 1", "Aux Building", "Turbine Hall", "Water Intake", "Switchyard", "Control Room", "Diesel Generator", "Fuel Pool", "Containment Vessel", "Cooling Tower", "Pump House", "Lab Facility"];

  for (let i = topics.length; i < 200; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const prio = priorities[Math.floor(Math.random() * priorities.length)];
    const stat = statuses[Math.floor(Math.random() * statuses.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const daysAgo = Math.floor(Math.random() * 365);
    const createdAt = new Date(Date.now() - 86400000 * daysAgo).toISOString();
    const updatedDaysAgo = Math.floor(Math.random() * daysAgo);
    const updatedAt = new Date(Date.now() - 86400000 * updatedDaysAgo).toISOString();
    const cons = Math.floor(Math.random() * 5) + 1;
    const like = Math.floor(Math.random() * 5) + 1;
    let trend = RiskTrend.STABLE;
    if (stat === Status.RESOLVED) trend = RiskTrend.IMPROVING;
    else if (prio === Priority.CRITICAL && Math.random() > 0.5) trend = RiskTrend.ESCALATING;
    else if (Math.random() > 0.8) trend = RiskTrend.ESCALATING;
    else if (Math.random() > 0.8) trend = RiskTrend.IMPROVING;
    const tIndex = Math.floor(Math.random() * TITLES.length);
    const sIndex = Math.floor(Math.random() * SUBTITLES.length);

    topics.push({
      id: String(i + 1).padStart(5, '0'),
      title: `${TITLES[tIndex]} - ${SUBTITLES[sIndex]} (${i + 1})`,
      description: `Automatically generated topic #${i + 1} concerning ${TITLES[tIndex].toLowerCase()} in the ${SUBTITLES[sIndex]} area.`,
      department: dept,
      priority: prio,
      status: stat,
      owner: owner,
      createdAt,
      updatedAt,
      targetResolutionDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      consequence: cons as Consequence,
      likelihood: like as Likelihood,
      riskTrend: trend,
      attachments: [],
      history: [{ date: createdAt, description: 'Topic Created', user: owner, changes: [] }]
    });
  }
  return topics;
};

export const getTopics = (): Topic[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = generateMockTopics();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const saveTopic = (topic: Topic, updateNote?: string): void => {
  const topics = getTopics();
  const existingIndex = topics.findIndex(t => t.id === topic.id);
  if (existingIndex >= 0) {
    topics[existingIndex] = topic;
  } else {
    topics.push(topic);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
};

export const deleteTopic = (id: string): void => {
  const topics = getTopics();
  const newTopics = topics.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTopics));
};

const calculateHistoricalRisk = (topics: Topic[], targetDate: Date): number => {
  return topics.reduce((total, topic) => {
    const createdDate = new Date(topic.createdAt);
    if (createdDate > targetDate) return total;
    if (topic.status === Status.RESOLVED) {
       const resolvedEntry = topic.history.find(h => 
         h.changes?.some(c => c.newValue === Status.RESOLVED) && new Date(h.date) <= targetDate
       );
       if (resolvedEntry) return total; 
    }
    return total + (topic.consequence * topic.likelihood);
  }, 0);
};

// NEW: Advanced Mathematical Kernels for Insights
const MathKernels = {
    calculateShannonEntropy: (topics: Topic[]) => {
        const departments = Object.values(Department);
        const statuses = Object.values(Status);
        
        return departments.map(dept => {
            const deptTopics = topics.filter(t => t.department === dept);
            if (deptTopics.length === 0) return { subject: dept, entropy: 0, diversity: 0, fullMark: 100 };
            
            const counts: Record<string, number> = {};
            deptTopics.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
            
            let entropy = 0;
            Object.values(counts).forEach(c => {
                const p = c / deptTopics.length;
                entropy -= p * Math.log2(p);
            });
            
            // Normalize to 0-100 for radar
            const maxPossibleEntropy = Math.log2(statuses.length);
            const normalized = (entropy / maxPossibleEntropy) * 100;
            
            return {
                subject: dept,
                entropy: parseFloat(normalized.toFixed(1)),
                diversity: deptTopics.length,
                fullMark: 100
            };
        });
    },

    calculateParetoFrontier: (topics: Topic[]) => {
        const active = topics.filter(t => t.status !== Status.RESOLVED);
        const data: ParetoPoint[] = active.map(t => {
            const risk = t.consequence * t.likelihood;
            const daysOpen = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 3600 * 24);
            const effort = daysOpen * (t.priority === Priority.CRITICAL ? 2 : 1);
            return {
                id: t.id,
                name: t.title,
                risk,
                effort: parseFloat(effort.toFixed(1)),
                isFrontier: false
            };
        });

        return data.map(p => {
            const betterExists = data.some(other => 
                other.id !== p.id && other.risk >= p.risk && other.effort < p.effort
            );
            return { ...p, isFrontier: !betterExists };
        });
    },

    calculateBayesianConfidence: (topics: Topic[]) => {
        const depts = Object.values(Department);
        return depts.map(dept => {
            const deptTopics = topics.filter(t => t.department === dept);
            if (deptTopics.length === 0) return { name: dept, probability: 0, variance: 0 };
            
            const resolved = deptTopics.filter(t => t.status === Status.RESOLVED).length;
            const total = deptTopics.length;
            
            // Bayesian Posterior using Beta Distribution (Alpha, Beta)
            const alpha = 1 + resolved;
            const beta = 1 + (total - resolved);
            const mean = alpha / (alpha + beta);
            const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
            
            return {
                name: dept,
                probability: parseFloat((mean * 100).toFixed(1)),
                variance: parseFloat((variance * 100).toFixed(2))
            };
        });
    },

    calculateSystemStability: (topics: Topic[]) => {
        const historyData: ControlStabilityPoint[] = [];
        for (let i = 12; i >= 0; i--) {
            const weekEnd = new Date(Date.now() - 86400000 * 7 * i);
            const weekStart = new Date(weekEnd.getTime() - 86400000 * 7);
            
            const newTopics = topics.filter(t => {
                const created = new Date(t.createdAt);
                return created >= weekStart && created <= weekEnd;
            }).length;

            const resolvedTopics = topics.filter(t => {
                const resolvedAt = t.history.find(h => h.changes?.some(c => c.newValue === Status.RESOLVED))?.date;
                if (!resolvedAt) return false;
                const d = new Date(resolvedAt);
                return d >= weekStart && d <= weekEnd;
            }).length;

            historyData.push({
                date: weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                gain: newTopics,
                damping: resolvedTopics,
                stability: resolvedTopics - newTopics
            });
        }
        return historyData;
    }
};

export const getMetrics = (topics: Topic[]): DashboardMetrics => {
  const byDepartmentMap = new Map<string, number>();
  const byPriorityMap = new Map<string, number>();
  const heatmapMatrix: Record<string, Record<string, number>> = {};
  const scatterData: ScatterDataPoint[] = [];

  const priorityValueMap: Record<Priority, number> = {
    [Priority.LOW]: 1, [Priority.MEDIUM]: 2, [Priority.HIGH]: 3, [Priority.CRITICAL]: 4
  };

  topics.forEach(t => {
    if (t.status !== Status.RESOLVED) {
        byDepartmentMap.set(t.department, (byDepartmentMap.get(t.department) || 0) + 1);
        byPriorityMap.set(t.priority, (byPriorityMap.get(t.priority) || 0) + 1);
        if (!heatmapMatrix[t.department]) heatmapMatrix[t.department] = {};
        heatmapMatrix[t.department][t.priority] = (heatmapMatrix[t.department][t.priority] || 0) + 1;
        
        const diffTime = Math.abs(Date.now() - new Date(t.createdAt).getTime());
        const daysOpen = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        scatterData.push({
          id: t.id, x: daysOpen, y: priorityValueMap[t.priority], z: 10,
          name: t.title, priorityLabel: t.priority, owner: t.owner, department: t.department 
        });
    }
  });

  const heatmapData: HeatmapCell[] = [];
  Object.values(Department).forEach(dept => {
    Object.values(Priority).forEach(prio => {
      heatmapData.push({ x: dept, y: prio, value: heatmapMatrix[dept]?.[prio] || 0 });
    });
  });

  const riskTrendData = [];
  for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - 86400000 * i);
      riskTrendData.push({
          date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          totalRiskScore: calculateHistoricalRisk(topics, date)
      });
  }

  const thirtyDaysAgo = new Date(Date.now() - 86400000 * 30);
  const startRisk = calculateHistoricalRisk(topics, thirtyDaysAgo);
  const endRisk = calculateHistoricalRisk(topics, new Date());
  const newRisk = topics.reduce((acc, t) => new Date(t.createdAt) > thirtyDaysAgo ? acc + (t.consequence * t.likelihood) : acc, 0);
  const resolvedRisk = topics.reduce((acc, t) => {
      if (t.status === Status.RESOLVED && t.history.some(h => h.changes?.some(c => c.newValue === Status.RESOLVED) && new Date(h.date) > thirtyDaysAgo)) {
          return acc + (t.consequence * t.likelihood);
      }
      return acc;
  }, 0);
  const netChange = endRisk - startRisk - newRisk + resolvedRisk;

  return {
    totalTopics: topics.length,
    criticalCount: topics.filter(t => t.priority === Priority.CRITICAL && t.status !== Status.RESOLVED).length,
    resolvedCount: topics.filter(t => t.status === Status.RESOLVED).length,
    escalatingCount: topics.filter(t => t.riskTrend === RiskTrend.ESCALATING && t.status !== Status.RESOLVED).length,
    improvingCount: topics.filter(t => t.riskTrend === RiskTrend.IMPROVING && t.status !== Status.RESOLVED).length,
    byDepartment: Array.from(byDepartmentMap, ([name, value]) => ({ name, value })),
    byPriority: Array.from(byPriorityMap, ([name, value]) => ({ name, value })),
    scatterData,
    heatmapData,
    riskTrendData,
    waterfallData: [
      { name: 'Start', value: startRisk, fill: '#64748b' },
      { name: 'New Risks', value: newRisk, fill: '#ef4444' },
      { name: 'Resolved', value: -resolvedRisk, fill: '#10b981' },
      { name: 'Net Change', value: netChange, fill: netChange >= 0 ? '#f97316' : '#3b82f6' },
      { name: 'Current', value: endRisk, fill: '#3b82f6', isTotal: true }
    ],
    // ADDED: Mathematical Extensions
    entropyData: MathKernels.calculateShannonEntropy(topics),
    paretoData: MathKernels.calculateParetoFrontier(topics),
    bayesianData: MathKernels.calculateBayesianConfidence(topics),
    controlData: MathKernels.calculateSystemStability(topics)
  };
};

export const generateReportMetrics = (filteredTopics: Topic[], startDateStr: string, endDateStr: string): ReportMetrics => {
  const dates: string[] = [];
  const riskTrend: number[] = [];
  const activeCount: number[] = [];
  const resolvedCount: number[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let current = new Date(start);
  current.setDate(1);
  const finalEnd = new Date(end);
  finalEnd.setMonth(finalEnd.getMonth() + 1);
  finalEnd.setDate(0);

  while (current <= finalEnd) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      dates.push(current.toLocaleDateString('default', { month: 'short', year: '2-digit' }));
      riskTrend.push(calculateHistoricalRisk(filteredTopics, monthEnd));
      let active = 0, resolved = 0;
      filteredTopics.forEach(t => {
        const created = new Date(t.createdAt);
        if (created <= monthEnd) {
           const isRes = t.status === Status.RESOLVED && t.history.some(h => h.changes?.some(c => c.newValue === Status.RESOLVED) && new Date(h.date) <= monthEnd);
           isRes ? resolved++ : active++;
        }
      });
      activeCount.push(active);
      resolvedCount.push(resolved);
      current.setMonth(current.getMonth() + 1);
  }

  return { dates, riskTrend, activeCount, resolvedCount, topicMovements: filteredTopics.filter(t => t.riskTrend !== RiskTrend.STABLE && t.status !== Status.RESOLVED) };
};

export const getTopicRiskHistory = (topic: Topic, startDateStr?: string, endDateStr?: string): RiskHistoryPoint[] => {
    const historyPoints: RiskHistoryPoint[] = [];
    let start = startDateStr ? new Date(startDateStr) : new Date();
    if (!startDateStr) start.setMonth(start.getMonth() - 6);
    let end = endDateStr ? new Date(endDateStr) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
    let current = new Date(start);
    while (current <= end) {
        if (new Date(topic.createdAt) <= current) {
             let score = topic.consequence * topic.likelihood;
             const isResolved = topic.status === Status.RESOLVED && topic.history.some(h => h.changes?.some(c => c.newValue === Status.RESOLVED) && new Date(h.date) <= current);
             if (isResolved) score = 0;
             historyPoints.push({ date: current.toLocaleDateString('default', { day: 'numeric', month: 'short' }), riskScore: score, trend: topic.riskTrend });
        }
        current.setDate(current.getDate() + 7);
    }
    return historyPoints;
};

export const getMultiTopicRiskHistory = (topics: Topic[], startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr), end = new Date(endDateStr);
    const data: any[] = [];
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || topics.length === 0) return [];
    let current = new Date(start);
    while (current <= end) {
        const point: any = { date: current.toLocaleDateString('default', { day: 'numeric', month: 'short' }), fullDate: current.toISOString() };
        topics.forEach(topic => {
            const created = new Date(topic.createdAt);
            if (created > current) point[topic.id] = 0;
            else {
                const isRes = topic.status === Status.RESOLVED && topic.history.some(h => h.changes?.some(c => c.newValue === Status.RESOLVED) && new Date(h.date) <= current);
                point[topic.id] = isRes ? 0 : topic.consequence * topic.likelihood;
            }
        });
        data.push(point);
        current.setDate(current.getDate() + 7);
    }
    return data;
};
