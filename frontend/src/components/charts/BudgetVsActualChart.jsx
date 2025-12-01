import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="font-medium mb-2">{data.category}</p>
        <p className="text-sm">Budgeted: ${data.budgeted.toFixed(2)}</p>
        <p className="text-sm">Actual: ${data.actual.toFixed(2)}</p>
        <p
          className={`text-sm font-medium ${
            data.difference > 0 ? "text-destructive" : "text-green-600"
          }`}
        >
          Difference: ${data.difference > 0 ? "+" : ""}
          {data.difference.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const BudgetVsActualChart = ({ data }) => {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No budget data available
      </div>
    );
  }

  const chartData = data.categories.map((item) => ({
    category: item.category,
    budgeted: item.budgeted,
    actual: item.actual,
    difference: item.difference,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="budgeted"
          fill="hsl(var(--chart-3))"
          name="Budgeted"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="actual"
          fill="hsl(var(--chart-4))"
          name="Actual"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetVsActualChart;
