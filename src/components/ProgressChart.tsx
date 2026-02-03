import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

interface ChartData {
  day: string;
  value: number;
  completed?: boolean;
}

interface ProgressChartProps {
  data: ChartData[];
  height?: number;
  showLabels?: boolean;
}

const ProgressChart = ({ data, height = 120, showLabels = true }: ProgressChartProps) => {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="barGradientInactive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          {showLabels && (
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: "hsl(var(--muted-foreground))", 
                fontSize: 11,
              }}
              dy={10}
            />
          )}
          
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.value > 0 ? "url(#barGradient)" : "url(#barGradientInactive)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
