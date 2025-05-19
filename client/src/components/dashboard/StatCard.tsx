interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600"
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconBgColor} ${iconColor} mr-4`}>
            <span className="material-icons">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-xl font-semibold text-neutral-800">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}