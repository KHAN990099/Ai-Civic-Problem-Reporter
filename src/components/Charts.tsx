import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];
const tip = { contentStyle: { borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 } };
const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;

function Empty() {
  return <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet</div>;
}

export function DailyChart({ data, height = 240 }: { data: { label: string; count: number }[]; height?: number }) {
  if (!data.some((d) => d.count)) return <div style={{ height }}><Empty /></div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} {...axis} />
        <Tooltip {...tip} />
        <Area type="monotone" dataKey="count" name="Reports" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#g1)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({ data, height = 240, horizontal }: { data: { name: string; count: number }[]; height?: number; horizontal?: boolean }) {
  if (!data.some((d) => d.count)) return <div style={{ height }}><Empty /></div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 0 : -20, right: 12 }}>
        <CartesianGrid horizontal={!horizontal} vertical={!!horizontal} stroke="var(--border)" />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} {...axis} />
            <YAxis type="category" dataKey="name" width={130} {...axis} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" {...axis} />
            <YAxis allowDecimals={false} {...axis} />
          </>
        )}
        <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" name="Reports" radius={6}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 240 }: { data: { name: string; count: number }[]; height?: number }) {
  if (!data.some((d) => d.count)) return <div style={{ height }}><Empty /></div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={3} stroke="none">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
