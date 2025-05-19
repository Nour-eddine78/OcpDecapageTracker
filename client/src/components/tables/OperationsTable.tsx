import { useState } from "react";
import { DECAPAGE_METHODS, POSTES } from "@/lib/constants";

type OperationsTableProps = {
  operations: any[];
  onEdit?: (operation: any) => void;
  onDelete?: (id: string) => void;
  onView?: (operation: any) => void;
};

export default function OperationsTable({
  operations,
  onEdit,
  onDelete,
  onView,
}: OperationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterPoste, setFilterPoste] = useState("all");
  const [filterPanneau, setFilterPanneau] = useState("");

  // Extract unique panneaux for filtering
  const uniquePanneaux = Array.from(
    new Set(operations.map((operation) => operation.panneau).filter(Boolean))
  );

  // Filter operations based on search term and filters
  const filteredOperations = operations.filter((operation) => {
    const matchesSearch =
      operation.operationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.panneau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.niveau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.tranche.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === "all" || operation.methode === filterMethod;
    const matchesPoste = filterPoste === "all" || operation.poste === filterPoste;
    const matchesPanneau = !filterPanneau || operation.panneau === filterPanneau;
    
    return matchesSearch && matchesMethod && matchesPoste && matchesPanneau;
  });

  // Get method name from ID
  const getMethodName = (methodId: string) => {
    const method = DECAPAGE_METHODS.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  // Get poste name from ID
  const getPosteName = (posteId: string) => {
    const poste = POSTES.find(p => p.id === posteId);
    return poste ? poste.name : posteId;
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
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center relative w-full sm:w-64">
            <span className="absolute left-3 text-neutral-400 material-icons">search</span>
            <input
              type="text"
              placeholder="Rechercher une opération..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
            <select
              value={filterPoste}
              onChange={(e) => setFilterPoste(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Tous les postes</option>
              {POSTES.map((poste) => (
                <option key={poste.id} value={poste.id}>
                  {poste.name}
                </option>
              ))}
            </select>
            <select
              value={filterPanneau}
              onChange={(e) => setFilterPanneau(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="">Tous les panneaux</option>
              {uniquePanneaux.map((panneau) => (
                <option key={panneau} value={panneau}>
                  {panneau}
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
              <th className="px-4 py-3 font-medium">Volume (m³)</th>
              <th className="px-4 py-3 font-medium">Métrage (m)</th>
              <th className="px-4 py-3 font-medium">Rendement</th>
              <th className="px-4 py-3 font-medium">Disponibilité</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredOperations.length > 0 ? (
              filteredOperations.map((operation) => (
                <tr 
                  key={operation.id} 
                  className={`hover:bg-neutral-50 ${onView ? 'cursor-pointer' : ''}`}
                  onClick={onView ? () => onView(operation) : undefined}
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {operation.operationId}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {formatDate(operation.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {getMethodName(operation.methode)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {operation.machine}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {getPosteName(operation.poste)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {operation.panneau || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 text-right">
                    {formatNumber(operation.volume)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 text-right">
                    {formatNumber(operation.metrage)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 text-right">
                    {formatNumber(operation.rendement)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 text-right">
                    {formatNumber(operation.disponibilite)}%
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
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
                      {onView && (
                        <button
                          onClick={() => onView(operation)}
                          className="text-primary-600 hover:text-primary-800"
                          title="Voir les détails"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-neutral-500">
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

      <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          {filteredOperations.length} opération(s) affichée(s)
        </div>
        
        {filteredOperations.length > 0 && (
          <div className="text-sm text-neutral-600">
            <span className="font-medium">Moyenne du rendement:</span> {formatNumber(
              filteredOperations.reduce((sum, op) => sum + (op.rendement || 0), 0) / filteredOperations.length
            )} m/h
            <span className="mx-4 text-neutral-300">|</span>
            <span className="font-medium">Disponibilité moyenne:</span> {formatNumber(
              filteredOperations.reduce((sum, op) => sum + (op.disponibilite || 0), 0) / filteredOperations.length
            )}%
          </div>
        )}
      </div>
    </div>
  );
}