interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  type?: "primary" | "info" | "success" | "warning";
}

export default function StatCard({ icon, title, value, type = "primary" }: StatCardProps) {
  const colors = {
    primary: {
      border: "border-primary-500",
      bg: "bg-primary-100",
      text: "text-primary-600",
    },
    info: {
      border: "border-info",
      bg: "bg-blue-100",
      text: "text-info",
    },
    success: {
      border: "border-success",
      bg: "bg-green-100",
      text: "text-success",
    },
    warning: {
      border: "border-warning",
      bg: "bg-yellow-100",
      text: "text-warning",
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors[type].border}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors[type].bg} ${colors[type].text} mr-4`}>
          <span className="material-icons">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-xl font-semibold text-neutral-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
