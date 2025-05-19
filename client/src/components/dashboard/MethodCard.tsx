import { useLocation } from "wouter";

interface MethodCardProps {
  title: string;
  description: string;
  machines: string;
  image: string;
}

export default function MethodCard({ title, description, machines, image }: MethodCardProps) {
  const [_, setLocation] = useLocation();

  const handleDetailsClick = () => {
    setLocation("/operations");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={`Opération de ${title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-neutral-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-700">Machines utilisées:</p>
            <p className="text-sm text-neutral-500">{machines}</p>
          </div>
          <button
            onClick={handleDetailsClick}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}
