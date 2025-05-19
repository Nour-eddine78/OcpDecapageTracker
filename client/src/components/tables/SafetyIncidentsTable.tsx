import { useState } from "react";
import { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/constants";
import { getColorClass } from "@/lib/colors";

type SafetyIncidentsTableProps = {
  incidents: any[];
  onView?: (incident: any) => void;
  onEdit?: (incident: any) => void;
  onDelete?: (id: string) => void;
  onExport?: (incident: any) => void;
};

export default function SafetyIncidentsTable({
  incidents,
  onView,
  onEdit,
  onDelete,
  onExport,
}: SafetyIncidentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.incidentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || incident.type === filterType;
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  // Get color class for status and severity
  const getStatusColorClass = (status: string) => {
    const statusItem = INCIDENT_STATUS.find((item) => item.id === status);
    return statusItem ? getColorClass(statusItem.color, "text") : "text-gray-500";
  };

  const getSeverityColorClass = (severity: string) => {
    const severityItem = INCIDENT_SEVERITY.find((item) => item.id === severity);
    return severityItem ? getColorClass(severityItem.color, "bg") : "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center relative w-full sm:w-64">
            <span className="absolute left-3 text-neutral-400 material-icons">search</span>
            <input
              type="text"
              placeholder="Rechercher par ID, lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Toutes les sévérités</option>
              {INCIDENT_SEVERITY.map((severity) => (
                <option key={severity.id} value={severity.id}>
                  {severity.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              {INCIDENT_STATUS.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Sévérité</th>
              <th className="px-4 py-3 font-medium">Lieu</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {incident.incidentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {formatDate(incident.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    <span className="inline-block px-2 py-1 rounded-full bg-neutral-100 text-xs font-medium">
                      {incident.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    <span className={`inline-block px-2 py-1 rounded-full ${getSeverityColorClass(incident.severity)} text-white text-xs font-medium`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-xs truncate">
                    {incident.location}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block ${getStatusColorClass(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(incident)}
                          className="text-primary-600 hover:text-primary-800"
                          title="Voir les détails"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(incident)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Modifier"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(incident.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <span className="material-icons text-base">delete</span>
                        </button>
                      )}
                      {onExport && (
                        <button
                          onClick={() => onExport(incident)}
                          className="text-green-600 hover:text-green-800"
                          title="Exporter en PDF"
                        >
                          <span className="material-icons text-base">download</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-icons text-3xl mb-2">search_off</span>
                    <p>Aucun incident trouvé</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}