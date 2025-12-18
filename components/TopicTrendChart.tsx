
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Topic } from '../types';
import { getTopicRiskHistory } from '../services/topicService';
import { Activity } from 'lucide-react';

interface TopicTrendChartProps {
    topic: Topic;
    startDate?: string;
    endDate?: string;
}

const TopicTrendChart: React.FC<TopicTrendChartProps> = ({ topic, startDate, endDate }) => {
    const historyData = getTopicRiskHistory(topic, startDate, endDate);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-lg font-bold text-[#101F40] flex items-center gap-2">
                       <Activity className="w-5 h-5 text-[#FE5800]" />
                       Historical Risk Profile
                   </h3>
                   <p className="text-xs text-slate-500">
                       {startDate && endDate 
                           ? `Weekly Risk Evolution: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                           : 'Weekly Risk Evolution (Last 6 Months)'
                       }
                   </p>
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-extrabold text-[#101F40]">{topic.consequence * topic.likelihood}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Score</span>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="date" 
                            fontSize={11} 
                            stroke="#64748b" 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={20}
                        />
                        <YAxis domain={[0, 25]} fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="riskScore"
                            stroke="#FE5800"
                            strokeWidth={3}
                            dot={{ r: 3, fill: '#FE5800', strokeWidth: 1, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                This graph plots the product of Consequence × Likelihood weekly over the selected period.
            </div>
        </div>
    );
};

export default TopicTrendChart;
