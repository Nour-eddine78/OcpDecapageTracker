import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import MethodCard from "@/components/dashboard/MethodCard";
import DocumentCard from "@/components/dashboard/DocumentCard";
import MachineTable from "@/components/tables/MachineTable";
import OperationsForm from "@/components/forms/OperationsForm";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOperationsForm, setShowOperationsForm] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines"],
  });

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleViewMachine = (machine: any) => {
    toast({
      title: "Fiche technique",
      description: `Affichage de la fiche technique de ${machine.name}`,
    });
  };

  const handleDownloadMachine = (machine: any) => {
    toast({
      title: "Téléchargement",
      description: `Téléchargement de la fiche technique de ${machine.name}`,
    });
  };

  const handleDocumentAction = (type: string) => {
    toast({
      title: "Document",
      description: `Action sur le document: ${type}`,
    });
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="flex-1 overflow-y-auto pt-0 md:pt-0">
        <Header toggleSidebar={toggleSidebar} />
        <div className="md:hidden h-16"></div>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">Accueil</h1>
            <p className="text-neutral-600">Gestion des Opérations de Décapage</p>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="engineering"
              title="Machines Actives"
              value={stats.activeMachines || 0}
              type="primary"
            />
            <StatCard
              icon="area_chart"
              title="Volume Décapé (m³)"
              value={stats.volume || 0}
              type="info"
            />
            <StatCard
              icon="speed"
              title="Rendement Moyen"
              value={stats.avgPerformance || "0%"}
              type="success"
            />
            <StatCard
              icon="error_outline"
              title="Incidents (30j)"
              value={stats.incidents || 0}
              type="warning"
            />
          </div>

          {/* Méthodes de Décapage */}
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Méthodes de Décapage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MethodCard
              title="Transport"
              description="Méthode utilisant des camions pour le déplacement des matériaux décapés vers des zones de stockage."
              machines="Transwine, Procaneq"
              image="https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
            />
            <MethodCard
              title="Poussage"
              description="Utilisation de bulldozers pour pousser et déplacer des matériaux sur des distances courtes."
              machines="D11"
              image="https://pixabay.com/get/g972a57b06a3693399d103113ae0b127168ff248d203f9da8892ab1f13ae897001926468d19cfd8307cf7910f0bab8761febcb0d1a72445071768bf7e660c9d46_1280.jpg"
            />
            <MethodCard
              title="Casement"
              description="Technique d'excavation impliquant l'extraction et la disposition des matériaux par couches."
              machines="750011, 750012, PH1, PH2, 200B1, Libhere"
              image="https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
            />
          </div>

          {/* Fiches Techniques */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">
                Fiches Techniques des Machines
              </h2>
              <button 
                onClick={() => setLocation("/operations")}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <span>Voir toutes</span>
                <span className="material-icons ml-1">arrow_forward</span>
              </button>
            </div>

            <MachineTable 
              machines={machines.slice(0, 3)}
              onView={handleViewMachine}
              onDownload={handleDownloadMachine}
            />
          </div>

          {/* Documentation & Ressources */}
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Documentation & Ressources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DocumentCard
              icon="description"
              title="Procédures d'opération standard"
              description="Protocoles et directives pour les opérations de décapage."
              actionIcon="file_download"
              actionText="Télécharger PDF"
              onClick={() => handleDocumentAction("Procédures")}
            />
            <DocumentCard
              icon="video_library"
              title="Vidéos de formation"
              description="Tutoriels vidéo pour l'utilisation optimale des machines."
              actionIcon="play_circle_outline"
              actionText="Voir la bibliothèque"
              onClick={() => handleDocumentAction("Vidéos")}
            />
            <DocumentCard
              icon="rule"
              title="Normes HSE"
              description="Règles et procédures de sécurité pour les opérations de terrain."
              actionIcon="file_download"
              actionText="Télécharger PDF"
              onClick={() => handleDocumentAction("HSE")}
            />
            <DocumentCard
              icon="build"
              title="Manuels techniques"
              description="Spécifications et guides d'entretien des équipements."
              actionIcon="folder_open"
              actionText="Parcourir les manuels"
              onClick={() => handleDocumentAction("Manuels")}
            />
          </div>
        </div>
      </main>

      {showOperationsForm && (
        <OperationsForm onClose={() => setShowOperationsForm(false)} />
      )}
    </div>
  );
}
