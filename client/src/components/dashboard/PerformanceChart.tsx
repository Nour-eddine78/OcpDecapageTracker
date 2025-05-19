import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  rendement: number;
  volume: number;
  disponibilite: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title: string;
  dataKeys: string[];
}

export default function PerformanceChart({
  data,
  title,
  dataKeys = ["rendement", "volume", "disponibilite"],
}: PerformanceChartProps) {
  const colorMap: Record<string, string> = {
    rendement: "hsl(var(--chart-1))",
    volume: "hsl(var(--chart-2))",
    disponibilite: "hsl(var(--chart-3))",
    metrage: "hsl(var(--chart-4))",
    heures: "hsl(var(--chart-5))",
  };

  const labelMap: Record<string, string> = {
    rendement: "Rendement (m/h)",
    volume: "Volume (m³)",
    disponibilite: "Disponibilité (%)",
    metrage: "Métrage (m)",
    heures: "Heures de marche",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">{title}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={labelMap[key] || key}
                stroke={colorMap[key] || "#8884d8"}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
