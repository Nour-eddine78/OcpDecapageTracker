import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MachineTable from "@/components/tables/MachineTable";
import MachineForm from "@/components/forms/MachineForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Machines() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [machineDetails, setMachineDetails] = useState<any>(null);
  const [showMachineDetails, setShowMachineDetails] = useState(false);

  // Récupération des données des machines
  const { data: machines = [], isLoading, isError } = useQuery({
    queryKey: ["/api/machines"],
    queryFn: () => apiRequest("GET", "/api/machines").then(data => data || [])
  });

  // Suppression d'une machine
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/machines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({
        title: "Machine supprimée",
        description: "La machine a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la machine. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Erreur lors de la suppression:", error);
    },
  });

  // Gestion de la suppression
  const handleDeleteMachine = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette machine ?")) {
      deleteMutation.mutate(id);
    }
  };

  // Ouvrir le formulaire de création
  const handleCreateMachine = () => {
    setSelectedMachine(null);
    setShowMachineForm(true);
  };

  // Ouvrir le formulaire d'édition
  const handleEditMachine = (machine: any) => {
    setSelectedMachine(machine);
    setShowMachineForm(true);
  };

  // Voir les détails d'une machine
  const handleViewMachine = (machine: any) => {
    setMachineDetails(machine);
    setShowMachineDetails(true);
  };

  // Fermer les modales
  const handleCloseForm = () => {
    setShowMachineForm(false);
    setSelectedMachine(null);
  };

  const handleCloseDetails = () => {
    setShowMachineDetails(false);
    setMachineDetails(null);
  };

  // Format specifications for display
  const formatSpecifications = (specs: any) => {
    if (!specs) return "Aucune spécification disponible";
    
    return Object.entries(specs).map(([key, value]) => {
      // Format the key with capitalization and spaces
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/Puissance/, 'Puissance')
        .replace(/Capacite Charge/, 'Capacité de charge')
        .replace(/Annee/, 'Année')
        .replace(/Horaire Service/, 'Horaire de service')
        .replace(/Consommation/, 'Consommation');
        
      return (
        <div key={key} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
          <span className="text-neutral-600 font-medium">{formattedKey}</span>
          <span className="text-neutral-800">{value}</span>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Gestion des Machines
          </h1>
          <p className="text-neutral-500">
            Gérez votre flotte de machines pour les opérations de décapage.
          </p>
        </div>
        
        {user?.role === "admin" && (
          <button
            onClick={handleCreateMachine}
            className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <span className="material-icons text-base">add</span>
            Ajouter une machine
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
            <p className="text-neutral-600">Chargement des machines...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center text-red-600">
            <span className="material-icons text-4xl mb-2">error_outline</span>
            <p>Erreur lors du chargement des machines. Veuillez réessayer.</p>
          </div>
        </div>
      ) : (
        <MachineTable
          machines={machines}
          onEdit={user?.role === "admin" ? handleEditMachine : undefined}
          onDelete={user?.role === "admin" ? handleDeleteMachine : undefined}
          onSelect={handleViewMachine}
        />
      )}

      {/* Modale de formulaire pour créer/éditer une machine */}
      {showMachineForm && (
        <MachineForm 
          onClose={handleCloseForm}
          machineToEdit={selectedMachine}
        />
      )}

      {/* Modale de détails de la machine */}
      {showMachineDetails && machineDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Détails de la machine
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="md:w-1/2">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">ID de la machine</h3>
                    <p className="text-lg font-semibold text-neutral-800">{machineDetails.machineId}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">Nom</h3>
                    <p className="text-lg text-neutral-800">{machineDetails.name}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">Type</h3>
                    <p className="text-lg text-neutral-800">{machineDetails.type}</p>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">Capacité</h3>
                    <p className="text-lg text-neutral-800">{machineDetails.capacity}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">Méthode de décapage</h3>
                    <div>
                      {machineDetails.methode === "Transport" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Transport
                        </span>
                      )}
                      {machineDetails.methode === "Casement" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          Casement
                        </span>
                      )}
                      {machineDetails.methode === "Poussage" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                          Poussage
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-500">Statut</h3>
                    <div>
                      {machineDetails.status === "En service" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          En service
                        </span>
                      )}
                      {machineDetails.status === "Maintenance" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          En maintenance
                        </span>
                      )}
                      {machineDetails.status === "Hors service" && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Hors service
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-base font-medium text-neutral-800 mb-3">Spécifications techniques</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  {formatSpecifications(machineDetails.specifications)}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleEditMachine(machineDetails);
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors mr-3"
                  >
                    Modifier
                  </button>
                )}
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}