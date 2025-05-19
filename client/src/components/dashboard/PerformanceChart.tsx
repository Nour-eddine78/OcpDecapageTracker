import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  chartType?: "area" | "line" | "bar";
}

export default function PerformanceChart({
  data,
  title,
  dataKeys,
  chartType = "area",
}: PerformanceChartProps) {
  // Get proper colors for each data key
  const getColorForKey = (key: string): string => {
    switch (key) {
      case "rendement":
        return "#10b981"; // emerald-500
      case "volume":
        return "#3b82f6"; // blue-500
      case "disponibilite":
        return "#f59e0b"; // amber-500
      case "metrage":
        return "#8b5cf6"; // violet-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Format date for display
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("fr-FR", { 
        day: "2-digit", 
        month: "short" 
      });
    } catch (e) {
      return date;
    }
  };

  // Format tooltip value based on data key
  const formatTooltipValue = (value: any, key: string) => {
    switch (key) {
      case "rendement":
      case "disponibilite":
        return `${value}%`;
      case "volume":
      case "metrage":
        return `${value} m³`;
      default:
        return value;
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-md shadow-md">
          <p className="text-sm font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              className="text-sm" 
              style={{ color: entry.color }}
            >
              <span className="font-medium">{entry.name}: </span>
              {formatTooltipValue(entry.value, entry.dataKey)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render the appropriate chart type
  const renderChart = () => {
    switch (chartType) {
      case "area":
        return (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <defs>
              {dataKeys.map((key) => (
                <linearGradient
                  key={`gradient-${key}`}
                  id={`color-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={getColorForKey(key)}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={getColorForKey(key)}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={getColorForKey(key)}
                fillOpacity={1}
                fill={`url(#color-${key})`}
              />
            ))}
          </AreaChart>
        );

      case "line":
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={getColorForKey(key)}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                fill={getColorForKey(key)}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden h-full">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
      </div>
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}