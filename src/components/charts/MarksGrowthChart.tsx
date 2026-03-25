'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface DataPoint {
  name: string;
  score: number;
  max: number;
  percentage: number;
}

interface MarksGrowthChartProps {
  data: DataPoint[];
}

export function MarksGrowthChart({ data }: MarksGrowthChartProps) {
  if (data.length === 0) return (
    <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
          formatter={(value: number, name: string) => [`${value}%`, 'Score']}
        />
        <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '75%', fill: '#f59e0b', fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#fbbf24"
          strokeWidth={2}
          dot={{ fill: '#fbbf24', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
