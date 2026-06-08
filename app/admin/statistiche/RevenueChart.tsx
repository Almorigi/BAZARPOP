"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RevenueChart({ data }: { data: { settimana: string; ricavi: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRicavi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis dataKey="settimana" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: "12px", color: "#fff", fontSize: 12 }}
          formatter={(v: number) => [`€${v}`, "Ricavi"]}
        />
        <Area type="monotone" dataKey="ricavi" stroke="#f97316" strokeWidth={2} fill="url(#colorRicavi)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
