
import React from 'react';

export enum Department {
  NUCLEAR_ISLAND = 'Nuclear Island',
  CONVENTIONAL_ISLAND = 'Conventional Island',
  EQUIPMENT = 'Equipment Area',
  CIVIL_WORKS = 'Civil Works',
  SAFETY_LICENSING = 'Safety & Licensing',
  PROJECT_CONTROLS = 'Project Controls'
}

export enum Priority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Status {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
  ON_HOLD = 'On Hold'
}

export enum Likelihood {
  RARE = 1,
  UNLIKELY = 2,
  POSSIBLE = 3,
  LIKELY = 4,
  ALMOST_CERTAIN = 5
}

export enum Consequence {
  INSIGNIFICANT = 1,
  MINOR = 2,
  MODERATE = 3,
  MAJOR = 4,
  SEVERE = 5
}

export enum RiskTrend {
  ESCALATING = 'Escalating',
  STABLE = 'Stable',
  IMPROVING = 'Improving'
}

export type AIMode = 'cloud' | 'local';
export type ThemeMode = 'light' | 'dark';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url?: string;
}

export interface TopicHistory {
  date: string;
  description: string;
  user: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  department: Department;
  priority: Priority;
  status: Status;
  owner: string;
  createdAt: string; 
  updatedAt: string; 
  targetResolutionDate: string; 
  consequence: Consequence;
  likelihood: Likelihood;
  riskTrend: RiskTrend;
  comments?: string;
  attachments?: Attachment[];
  history: TopicHistory[];
}

export interface ScatterDataPoint {
  id: string;
  x: number; // Days open
  y: number; // Priority numeric value (1-4)
  z: number; // Bubble size (fixed or based on attachments)
  name: string;
  priorityLabel: string;
  owner?: string;
  department?: string;
}

export interface HeatmapCell {
  x: string; // Department
  y: string; // Priority
  value: number; // Count
}

export interface WaterfallDataPoint {
  name: string;
  value: number;
  fill: string;
  isTotal?: boolean; 
}

// NEW: Math-driven metric interfaces
export interface EntropyMetric {
  subject: string;
  entropy: number;
  diversity: number;
  fullMark: number;
}

export interface ParetoPoint {
  id: string;
  name: string;
  risk: number;
  effort: number;
  isFrontier: boolean;
}

export interface BayesianConfidence {
  name: string;
  probability: number;
  variance: number;
}

export interface ControlStabilityPoint {
  date: string;
  gain: number;
  damping: number;
  stability: number;
}

export interface DashboardMetrics {
  totalTopics: number;
  criticalCount: number;
  resolvedCount: number;
  escalatingCount: number;
  improvingCount: number;
  byDepartment: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
  scatterData: ScatterDataPoint[];
  heatmapData: HeatmapCell[];
  riskTrendData: { date: string; totalRiskScore: number }[];
  waterfallData: WaterfallDataPoint[];
  // Mathematical extensions
  entropyData: EntropyMetric[];
  paretoData: ParetoPoint[];
  bayesianData: BayesianConfidence[];
  controlData: ControlStabilityPoint[];
}

export interface ChartInsights {
  distributionInsight: string;
  agingInsight: string;
  riskHeatmapInsight: string;
  waterfallInsight?: string;
  entropyInsight?: string;
  paretoInsight?: string;
  bayesianInsight?: string;
  controlInsight?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface FilterState {
  searchTerm: string;
  department: string;
  priority: string;
  status: string[]; 
  startDate: string;
  endDate: string;
}

export interface RiskHistoryPoint {
  date: string;
  riskScore: number;
  trend: string;
}

export interface ReportMetrics {
  dates: string[];
  riskTrend: number[];
  activeCount: number[];
  resolvedCount: number[];
  topicMovements: Topic[];
}

export type ViewState = 'dashboard' | 'list' | 'add' | 'insights' | 'report' | 'update' | 'trend' | 'docs';
