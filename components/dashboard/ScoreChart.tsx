"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDate } from "@/lib/utils/format";
import type { SessionWithDetails } from "@/types/database";

interface ScoreChartProps {
  sessions: SessionWithDetails[];
}

export function ScoreChart({ sessions }: ScoreChartProps) {
  const data = sessions
    .filter((s) => s.status === "completed" && s.overall_score !== null)
    .slice(-10)
    .map((s) => ({
      date: formatDate(s.created_at),
      score: Math.round(s.overall_score!),
      company: s.company.name,
    }));

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        Complete your first session to see score trends
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`${value}`, "Score"]}
          labelFormatter={(label, payload) => {
            const company = payload?.[0]?.payload?.company;
            return company ? `${company} · ${label}` : label;
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--foreground))"
          strokeWidth={1.5}
          dot={{ r: 3, fill: "hsl(var(--foreground))" }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
