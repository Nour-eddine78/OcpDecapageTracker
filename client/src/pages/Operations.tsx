import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import OperationsTable from "@/components/tables/OperationsTable";
import OperationsForm from "@/components/forms/OperationsForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { DECAPAGE_METHODS } from "@/lib/constants";

export default function Operations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [operationDetails, setOperationDetails] = useState<any>(null);
  const [showOperationDetails, setShowOperationDetails] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");

  // Récupération des données des opérations
  const { data: operations = [], isLoading, isError } = useQuery({
    queryKey: ["/api/operations", filterMethod],
    queryFn: () => {
      const url = filterMethod === "all" 
        ? "/api/operations" 
        : `/api/operations?methode=${filterMethod}`;
      return apiRequest("GET", url).then(data => data || []);
    }
  });

  // Suppression d'une opération
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/operations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: "Opération supprimée",
        description: "L'opération a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'opération. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Erreur lors de la suppression:", error);
    },
  });

  // Gestion de la suppression
  const handleDeleteOperation = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette opération ?")) {
      deleteMutation.mutate(id);
    }
  };

  // Ouvrir le formulaire de création
  const handleCreateOperation = () => {
    setSelectedOperation(null);
    setShowOperationForm(true);
  };

  // Ouvrir le formulaire d'édition
  const handleEditOperation = (operation: any) => {
    setSelectedOperation(operation);
    setShowOperationForm(true);
  };

  // Voir les détails d'une opération
  const handleViewOperation = (operation: any) => {
    setOperationDetails(operation);
    setShowOperationDetails(true);
  };

  // Fermer les modales
  const handleCloseForm = () => {
    setShowOperationForm(false);
    setSelectedOperation(null);
  };

  const handleCloseDetails = () => {
    setShowOperationDetails(false);
    setOperationDetails(null);
  };

  // Obtenir le nom d'une méthode à partir de son ID
  const getMethodName = (methodId: string) => {
    const method = DECAPAGE_METHODS.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format numbers with separators
  const formatNumber = (num: number, decimals = 2) => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Suivi des Opérations de Décapage
          </h1>
          <p className="text-neutral-500">
            Gérez les opérations de transport, casement et poussage
          </p>
        </div>
        
        {user?.role === "admin" || user?.role === "supervisor" ? (
          <button
            onClick={handleCreateOperation}
            className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2 transition-colors"
          >
            <span className="material-icons text-base">add</span>
            Ajouter une opération
          </button>
        ) : null}
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterMethod === "all" ? "border-primary-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterMethod("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Toutes les méthodes</h3>
                <p className="text-neutral-500">{operations.length} opérations au total</p>
              </div>
              <span className="material-icons text-2xl text-neutral-400">view_list</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterMethod === "Transport" ? "border-blue-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterMethod("Transport")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Transport</h3>
                <p className="text-neutral-500">
                  {operations.filter(op => op.methode === "Transport").length} opérations
                </p>
              </div>
              <span className="material-icons text-2xl text-blue-400">local_shipping</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterMethod === "Poussage" ? "border-emerald-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterMethod("Poussage")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Poussage</h3>
                <p className="text-neutral-500">
                  {operations.filter(op => op.methode === "Poussage").length} opérations
                </p>
              </div>
              <span className="material-icons text-2xl text-emerald-400">engineering</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterMethod === "Casement" ? "border-amber-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterMethod("Casement")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Casement</h3>
                <p className="text-neutral-500">
                  {operations.filter(op => op.methode === "Casement").length} opérations
                </p>
              </div>
              <span className="material-icons text-2xl text-amber-400">construction</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
            <p className="text-neutral-600">Chargement des opérations...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center text-red-600">
            <span className="material-icons text-4xl mb-2">error_outline</span>
            <p>Erreur lors du chargement des opérations. Veuillez réessayer.</p>
          </div>
        </div>
      ) : (
        <OperationsTable
          operations={operations}
          onEdit={(user?.role === "admin" || user?.role === "supervisor") ? handleEditOperation : undefined}
          onDelete={user?.role === "admin" ? handleDeleteOperation : undefined}
          onView={handleViewOperation}
        />
      )}

      {/* Modale de formulaire pour créer/éditer une opération */}
      {showOperationForm && (
        <OperationsForm 
          onClose={handleCloseForm}
          operationToEdit={selectedOperation}
        />
      )}

      {/* Modale de détails de l'opération */}
      {showOperationDetails && operationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Détails de l'opération
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
              <div className="mb-6">
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{
                    backgroundColor: 
                      operationDetails.methode === "Transport" ? "#3b82f6" :
                      operationDetails.methode === "Poussage" ? "#10b981" :
                      operationDetails.methode === "Casement" ? "#f59e0b" : "#6b7280"
                  }}
                >
                  {getMethodName(operationDetails.methode)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">ID de l'opération</h3>
                    <p className="text-base font-semibold text-neutral-800">{operationDetails.operationId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Date</h3>
                    <p className="text-base text-neutral-800">{formatDate(operationDetails.date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Machine</h3>
                    <p className="text-base text-neutral-800">{operationDetails.machine}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Poste</h3>
                    <p className="text-base text-neutral-800">Poste {operationDetails.poste}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">État de la machine</h3>
                    <p className="text-base text-neutral-800">
                      {operationDetails.etatMachine === "marche" ? "En marche" : "À l'arrêt"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Panneau</h3>
                    <p className="text-base text-neutral-800">{operationDetails.panneau || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Tranche</h3>
                    <p className="text-base text-neutral-800">{operationDetails.tranche || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Niveau</h3>
                    <p className="text-base text-neutral-800">{operationDetails.niveau || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-neutral-800 mb-3">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Heures de marche</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.heuresMarche)} h</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Durée d'arrêt</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.dureeArret)} h</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Disponibilité</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.disponibilite)}%</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Rendement</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.rendement)} m/h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="text-base font-medium text-neutral-800 mb-3">Volume et métrage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Volume</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.volume)} m³</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Métrage</h4>
                      <p className="text-base text-neutral-800">{formatNumber(operationDetails.metrage)} m</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Afficher les données spécifiques selon la méthode */}
              {operationDetails.methodSpecificData && (
                <div className="mb-6">
                  <h3 className="text-base font-medium text-neutral-800 mb-3">
                    Données spécifiques - {getMethodName(operationDetails.methode)}
                  </h3>
                  <div 
                    className="bg-neutral-50 rounded-lg p-4"
                    style={{
                      backgroundColor: 
                        operationDetails.methode === "Transport" ? "#eff6ff" :
                        operationDetails.methode === "Poussage" ? "#ecfdf5" :
                        operationDetails.methode === "Casement" ? "#fffbeb" : "#f9fafb"
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {operationDetails.methode === "Transport" && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Distance de décharge</h4>
                            <p className="text-base text-neutral-800">
                              {formatNumber(operationDetails.methodSpecificData.distanceDecharge || 0)} m
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Nombre de camions</h4>
                            <p className="text-base text-neutral-800">
                              {operationDetails.methodSpecificData.nombreCamions || 0}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Nombre de pelles</h4>
                            <p className="text-base text-neutral-800">
                              {operationDetails.methodSpecificData.nombrePelles || 0}
                            </p>
                          </div>
                        </>
                      )}

                      {operationDetails.methode === "Poussage" && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Nombre de bulldozers</h4>
                            <p className="text-base text-neutral-800">
                              {operationDetails.methodSpecificData.nombreBulldozers || 0}
                            </p>
                          </div>
                        </>
                      )}

                      {operationDetails.methode === "Casement" && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Nombre d'engins</h4>
                            <p className="text-base text-neutral-800">
                              {operationDetails.methodSpecificData.nombreEngins || 0}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-neutral-500">Type d'intervention</h4>
                            <p className="text-base text-neutral-800">
                              {operationDetails.methodSpecificData.typeIntervention || "-"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {operationDetails.observation && (
                <div className="mb-6">
                  <h3 className="text-base font-medium text-neutral-800 mb-3">Observations</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-neutral-700">{operationDetails.observation}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                {(user?.role === "admin" || user?.role === "supervisor") && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleEditOperation(operationDetails);
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