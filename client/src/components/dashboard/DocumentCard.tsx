interface DocumentCardProps {
  icon: string;
  title: string;
  description: string;
  actionIcon: string;
  actionText: string;
  onClick: () => void;
}

export default function DocumentCard({
  icon,
  title,
  description,
  actionIcon,
  actionText,
  onClick,
}: DocumentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 flex">
      <div className="p-3 bg-primary-50 rounded-lg mr-4">
        <span className="material-icons text-primary-600">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 mb-3">{description}</p>
        <button
          onClick={onClick}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <span className="material-icons text-base mr-1">{actionIcon}</span>
          {actionText}
        </button>
      </div>
    </div>
  );
}