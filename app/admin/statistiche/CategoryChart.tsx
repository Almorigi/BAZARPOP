"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
const LABELS: Record<string, string> = {
  fumetti: "Fumetti", libri: "Libri", videogiochi: "Videogiochi", dvd: "DVD", oggetti: "Oggetti",
};

export default function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <div className="flex items-center justify-center h-[180px] text-neutral-600 text-sm">Nessun prodotto</div>;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: "12px", color: "#fff", fontSize: 12 }}
          formatter={(v: number, name: string) => [v, LABELS[name] ?? name]}
        />
        <Legend formatter={(v) => LABELS[v] ?? v} wrapperStyle={{ fontSize: 11, color: "#999" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
