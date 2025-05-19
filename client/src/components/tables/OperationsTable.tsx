import { useState } from "react";
import { DECAPAGE_METHODS } from "@/lib/constants";

type OperationsTableProps = {
  operations: any[];
  onView?: (operation: any) => void;
  onEdit?: (operation: any) => void;
  onDelete?: (id: string) => void;
  onExport?: (operation: any) => void;
};

export default function OperationsTable({
  operations,
  onView,
  onEdit,
  onDelete,
  onExport,
}: OperationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  // Filter operations based on search term and method filter
  const filteredOperations = operations.filter((operation) => {
    const matchesSearch =
      operation.operationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.machine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.panneau?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === "all" || operation.methode === filterMethod;
    
    return matchesSearch && matchesMethod;
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center relative w-full sm:w-64">
            <span className="absolute left-3 text-neutral-400 material-icons">search</span>
            <input
              type="text"
              placeholder="Rechercher par ID, machine, panneau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Toutes les méthodes</option>
              {DECAPAGE_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
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
              <th className="px-4 py-3 font-medium">Méthode</th>
              <th className="px-4 py-3 font-medium">Machine</th>
              <th className="px-4 py-3 font-medium">Poste</th>
              <th className="px-4 py-3 font-medium">Panneau</th>
              <th className="px-4 py-3 font-medium">Rendement</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredOperations.length > 0 ? (
              filteredOperations.map((operation) => (
                <tr key={operation.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {operation.operationId}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {formatDate(operation.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    <span className="inline-block px-2 py-1 rounded-full bg-neutral-100 text-xs font-medium">
                      {operation.methode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {operation.machine}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    Poste {operation.poste}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {operation.panneau}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, operation.rendement)}%` }}
                        ></div>
                      </div>
                      <span>{operation.rendement}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(operation)}
                          className="text-primary-600 hover:text-primary-800"
                          title="Voir les détails"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(operation)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Modifier"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(operation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <span className="material-icons text-base">delete</span>
                        </button>
                      )}
                      {onExport && (
                        <button
                          onClick={() => onExport(operation)}
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
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-icons text-3xl mb-2">search_off</span>
                    <p>Aucune opération trouvée</p>
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