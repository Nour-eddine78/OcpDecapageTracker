import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SafetyIncidentsTable from "@/components/tables/SafetyIncidentsTable";
import SafetyIncidentForm from "@/components/forms/SafetyIncidentForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/constants";

// Définition du schéma Zod pour les incidents
const incidentSchema = {
  incidentId: "",
  date: "",
  type: "",
  severity: "",
  status: "",
  location: "",
  description: "",
  actions: "",
  reportedBy: 0,
  resolvedBy: null,
  resolvedAt: null
};

export default function Safety() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [incidentDetails, setIncidentDetails] = useState<any>(null);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Récupération des données des incidents
  const { data: incidents = [], isLoading, isError } = useQuery({
    queryKey: ["/api/safety", filterStatus],
    queryFn: () => {
      const url = filterStatus === "all" 
        ? "/api/safety" 
        : `/api/safety?status=${filterStatus}`;
      return apiRequest("GET", url).then(data => data || []);
    }
  });

  // Mutation pour ajouter/modifier un incident
  const incidentMutation = useMutation({
    mutationFn: (data: typeof incidentSchema) => {
      const url = selectedIncident
        ? `/api/safety/${selectedIncident.id}`
        : "/api/safety";
      const method = selectedIncident ? "PATCH" : "POST";
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safety"] });
      toast({
        title: selectedIncident ? "Incident mis à jour" : "Incident créé",
        description: selectedIncident 
          ? "L'incident a été mis à jour avec succès." 
          : "Le nouvel incident a été enregistré.",
      });
      setShowIncidentForm(false);
      setSelectedIncident(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Erreur lors de l'enregistrement:", error);
    },
  });

  // Suppression d'un incident
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/safety/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safety"] });
      toast({
        title: "Incident supprimé",
        description: "L'incident a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'incident. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Erreur lors de la suppression:", error);
    },
  });

  // Gestion de la soumission du formulaire
  const onSubmit = (data: typeof incidentSchema) => {
    incidentMutation.mutate(data);
  };

  // Gestion de la suppression
  const handleDeleteIncident = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet incident ?")) {
      deleteMutation.mutate(id);
    }
  };

  // Ouvrir le formulaire de création
  const handleCreateIncident = () => {
    setSelectedIncident(null);
    setShowIncidentForm(true);
  };

  // Ouvrir le formulaire d'édition
  const handleEditIncident = (incident: any) => {
    setSelectedIncident(incident);
    setShowIncidentForm(true);
  };

  // Voir les détails d'un incident
  const handleViewIncident = (incident: any) => {
    setIncidentDetails(incident);
    setShowIncidentDetails(true);
  };

  // Fermer les modales
  const handleCloseForm = () => {
    setShowIncidentForm(false);
    setSelectedIncident(null);
  };

  const handleCloseDetails = () => {
    setShowIncidentDetails(false);
    setIncidentDetails(null);
  };

  // Obtenir le nom d'un type d'incident à partir de son ID
  const getTypeName = (typeId: string) => {
    const type = INCIDENT_TYPES.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  // Obtenir le nom d'une sévérité à partir de son ID
  const getSeverityName = (severityId: string) => {
    const severity = INCIDENT_SEVERITY.find(s => s.id === severityId);
    return severity ? severity.name : severityId;
  };

  // Obtenir le nom d'un statut à partir de son ID
  const getStatusName = (statusId: string) => {
    const status = INCIDENT_STATUS.find(s => s.id === statusId);
    return status ? status.name : statusId;
  };

  // Obtenir la couleur pour la sévérité
  const getSeverityColor = (severityId: string) => {
    switch (severityId) {
      case "Bas":
        return "green";
      case "Moyen":
        return "yellow";
      case "Élevé":
        return "orange";
      case "Critique":
        return "red";
      default:
        return "gray";
    }
  };

  // Obtenir la couleur pour le statut
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "Ouvert":
        return "red";
      case "En cours":
        return "yellow";
      case "Résolu":
        return "green";
      default:
        return "gray";
    }
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

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
            Sécurité & Incidents
          </h1>
          <p className="text-neutral-500">
            Gérez les incidents HSE et techniques sur le site
          </p>
        </div>
        
        <button
          onClick={handleCreateIncident}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2 transition-colors"
        >
          <span className="material-icons text-base">add</span>
          Déclarer un incident
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterStatus === "all" ? "border-primary-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterStatus("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Tous les incidents</h3>
                <p className="text-neutral-500">{incidents.length} au total</p>
              </div>
              <span className="material-icons text-2xl text-neutral-400">visibility</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterStatus === "Ouvert" ? "border-red-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterStatus("Ouvert")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Ouverts</h3>
                <p className="text-neutral-500">
                  {incidents.filter(incident => incident.status === "Ouvert").length} incidents
                </p>
              </div>
              <span className="material-icons text-2xl text-red-400">report_problem</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterStatus === "En cours" ? "border-yellow-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterStatus("En cours")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">En cours</h3>
                <p className="text-neutral-500">
                  {incidents.filter(incident => incident.status === "En cours").length} incidents
                </p>
              </div>
              <span className="material-icons text-2xl text-yellow-400">pending</span>
            </div>
          </div>

          <div 
            className={`bg-white rounded-lg p-4 border-l-4 ${
              filterStatus === "Résolu" ? "border-green-500" : "border-neutral-200"
            } shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => setFilterStatus("Résolu")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Résolus</h3>
                <p className="text-neutral-500">
                  {incidents.filter(incident => incident.status === "Résolu").length} incidents
                </p>
              </div>
              <span className="material-icons text-2xl text-green-400">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
            <p className="text-neutral-600">Chargement des incidents...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center text-red-600">
            <span className="material-icons text-4xl mb-2">error_outline</span>
            <p>Erreur lors du chargement des incidents. Veuillez réessayer.</p>
          </div>
        </div>
      ) : (
        <SafetyIncidentsTable
          incidents={incidents}
          onEdit={user?.role === "admin" ? handleEditIncident : undefined}
          onDelete={user?.role === "admin" ? handleDeleteIncident : undefined}
          onView={handleViewIncident}
        />
      )}

      {/* Modale de formulaire pour créer/éditer un incident */}
      {showIncidentForm && (
        <SafetyIncidentForm 
          onClose={handleCloseForm}
          incidentToEdit={selectedIncident}
        />
      )}

      {/* Modale de détails de l'incident */}
      {showIncidentDetails && incidentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-800">
                  Détails de l'incident
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
              <div className="flex justify-between mb-6">
                <div className="flex items-center">
                  <span className={`material-icons text-2xl mr-2 text-${getSeverityColor(incidentDetails.severity)}-500`}>
                    {incidentDetails.severity === "Critique" || incidentDetails.severity === "Élevé" 
                      ? "warning" 
                      : "info"}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-neutral-800">
                      Incident {incidentDetails.incidentId}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Déclaré le {formatDate(incidentDetails.date)}
                    </p>
                  </div>
                </div>
                <div>
                  <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(incidentDetails.status)}-100 text-${getStatusColor(incidentDetails.status)}-800`}>
                    <span className="material-icons text-sm mr-1">
                      {incidentDetails.status === "Résolu" 
                        ? "check_circle" 
                        : incidentDetails.status === "En cours" 
                        ? "pending" 
                        : "error"}
                    </span>
                    {getStatusName(incidentDetails.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Type d'incident</h4>
                  <p className="text-neutral-800">{getTypeName(incidentDetails.type)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Sévérité</h4>
                  <p>
                    <span 
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(incidentDetails.severity)}-100 text-${getSeverityColor(incidentDetails.severity)}-800`}>
                      {getSeverityName(incidentDetails.severity)}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Lieu</h4>
                  <p className="text-neutral-800">{incidentDetails.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Déclaré par</h4>
                  <p className="text-neutral-800">
                    ID: {incidentDetails.reportedBy}
                    {incidentDetails.reportedBy === user?.id && " (Vous)"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-500 mb-1">Description</h4>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-700 whitespace-pre-line">{incidentDetails.description}</p>
                </div>
              </div>

              {incidentDetails.actions && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Actions correctives</h4>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-neutral-700 whitespace-pre-line">{incidentDetails.actions}</p>
                  </div>
                </div>
              )}

              {incidentDetails.status === "Résolu" && incidentDetails.resolvedAt && (
                <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <h4 className="font-medium text-green-800">Résolution de l'incident</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-1">
                    <strong>Résolu par:</strong> ID: {incidentDetails.resolvedBy}
                    {incidentDetails.resolvedBy === user?.id && " (Vous)"}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Date de résolution:</strong> {formatDate(incidentDetails.resolvedAt)}
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                {user?.role === "admin" && incidentDetails.status !== "Résolu" && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleEditIncident(incidentDetails);
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