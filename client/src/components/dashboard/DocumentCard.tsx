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
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
        <span className="material-icons text-primary-600">{icon}</span>
      </div>
      <h3 className="text-md font-semibold text-neutral-800 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 mb-4 flex-grow">{description}</p>
      <button
        onClick={onClick}
        className="flex items-center text-primary-600 hover:text-primary-700"
      >
        <span className="material-icons mr-1 text-sm">{actionIcon}</span>
        <span className="text-sm">{actionText}</span>
      </button>
    </div>
  );
}
