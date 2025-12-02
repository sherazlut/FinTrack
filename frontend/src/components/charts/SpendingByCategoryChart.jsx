import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Colors that work well in both light and dark mode
const COLORS = [
  "#60a5fa", // Blue
  "#f87171", // Red
  "#fbbf24", // Yellow
  "#a78bfa", // Purple
  "#34d399", // Green
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          ${data.value.toFixed(2)} ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const SpendingByCategoryChart = ({ data }) => {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No spending data available
      </div>
    );
  }

  const chartData = data.categories.map((item) => ({
    name: item.category,
    value: item.totalAmount,
    percentage: item.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value) => (
            <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SpendingByCategoryChart;
