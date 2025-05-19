import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OperationsForm from "@/components/forms/OperationsForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Operations() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOperationsForm, setShowOperationsForm] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [filterMethod, setFilterMethod] = useState("all");
  const { toast } = useToast();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const { data: operations = [] } = useQuery({
    queryKey: ["/api/operations"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/operations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: "Opération supprimée",
        description: "L'opération a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    },
  });

  const handleNewOperation = () => {
    setSelectedOperation(null);
    setShowOperationsForm(true);
  };

  const handleEditOperation = (operation: any) => {
    setSelectedOperation(operation);
    setShowOperationsForm(true);
  };

  const handleDeleteOperation = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette opération?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredOperations = operations.filter((op: any) => 
    filterMethod === "all" || op.methode === filterMethod
  );

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
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Suivi des Opérations</h1>
              <p className="text-neutral-600">Gestion des opérations de décapage</p>
            </div>
            <button
              onClick={handleNewOperation}
              className="mt-3 sm:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              <span className="material-icons mr-1">add</span>
              Nouvelle Opération
            </button>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Filtrer par méthode
                </label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">Toutes les méthodes</option>
                  <option value="Transport">Transport</option>
                  <option value="Poussage">Poussage</option>
                  <option value="Casement">Casement</option>
                </select>
              </div>
              
              <div className="ml-auto flex items-center gap-2">
                <button className="px-3 py-2 bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50">
                  <span className="material-icons text-sm mr-1">filter_list</span>
                  Plus de filtres
                </button>
                <button className="px-3 py-2 bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50">
                  <span className="material-icons text-sm mr-1">file_download</span>
                  Exporter
                </button>
              </div>
            </div>
          </div>

          {/* Operations Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Machine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rendement
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredOperations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-neutral-500">
                        Aucune opération trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredOperations.map((operation: any) => (
                      <tr key={operation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {operation.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {new Date(operation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {operation.methode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {operation.machine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              operation.etatMachine === "marche"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {operation.etatMachine === "marche" ? "En marche" : "À l'arrêt"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {operation.rendement || 0} m/h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditOperation(operation)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOperation(operation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showOperationsForm && (
        <OperationsForm 
          onClose={() => setShowOperationsForm(false)} 
          operationToEdit={selectedOperation}
        />
      )}
    </div>
  );
}
