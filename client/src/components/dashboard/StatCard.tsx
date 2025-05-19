interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
  };
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  iconBgColor = "bg-primary-100",
}: StatCardProps) {
  const getChangeColor = () => {
    if (!change) return "text-neutral-500";
    switch (change.direction) {
      case "up":
        return "text-emerald-600";
      case "down":
        return "text-red-600";
      case "neutral":
        return "text-amber-600";
      default:
        return "text-neutral-500";
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.direction) {
      case "up":
        return "arrow_upward";
      case "down":
        return "arrow_downward";
      case "neutral":
        return "remove";
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-neutral-800">{value}</p>
            
            {change && (
              <div className={`flex items-center text-xs ${getChangeColor()}`}>
                <span className="material-icons text-xs mr-0.5">
                  {getChangeIcon()}
                </span>
                <span>{change.value}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <span className="material-icons text-primary-600">{icon}</span>
        </div>
      </div>
    </div>
  );
}