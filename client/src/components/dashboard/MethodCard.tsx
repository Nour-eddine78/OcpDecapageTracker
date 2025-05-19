import { Link } from "wouter";
import { METHOD_IMAGES } from "@/lib/constants";

interface MethodCardProps {
  title: string;
  description: string;
  machines: string;
  image: string;
}

export default function MethodCard({ title, description, machines, image }: MethodCardProps) {
  const imageUrl = METHOD_IMAGES[image as keyof typeof METHOD_IMAGES] || "";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {imageUrl && (
        <div className="h-40 bg-neutral-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        
        <div className="mb-4">
          <h4 className="text-xs font-medium text-neutral-500 uppercase mb-1">Machines</h4>
          <p className="text-sm text-neutral-700">{machines}</p>
        </div>
        
        <Link href={`/operations?method=${title}`}>
          <a className="inline-block w-full text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors">
            Voir les opérations
          </a>
        </Link>
      </div>
    </div>
  );
}