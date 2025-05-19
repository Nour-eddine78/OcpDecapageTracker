import { useState } from "react";
import { DECAPAGE_METHODS, MACHINE_STATUS } from "@/lib/constants";
import { getColorClass } from "@/lib/colors";

type MachineTableProps = {
  machines: any[];
  onEdit?: (machine: any) => void;
  onDelete?: (id: string) => void;
  onSelect?: (machine: any) => void;
};

export default function MachineTable({
  machines,
  onEdit,
  onDelete,
  onSelect
}: MachineTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter machines based on search term and filters
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = filterMethod === "all" || machine.methode === filterMethod;
    const matchesStatus = filterStatus === "all" || machine.status === filterStatus;
    
    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Get method name from ID
  const getMethodName = (methodId: string) => {
    const method = DECAPAGE_METHODS.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  // Get status name from ID
  const getStatusName = (statusId: string) => {
    const status = MACHINE_STATUS.find(s => s.id === statusId);
    return status ? status.name : statusId;
  };

  // Get color for method
  const getMethodColor = (methodId: string) => {
    switch (methodId) {
      case "Transport":
        return "bg-blue-100 text-blue-800";
      case "Casement":
        return "bg-amber-100 text-amber-800";
      case "Poussage":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  // Get color for status
  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "En service":
        return "bg-green-100 text-green-800";
      case "En maintenance":
        return "bg-amber-100 text-amber-800";
      case "Hors service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
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
              placeholder="Rechercher une machine..."
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              {MACHINE_STATUS.map((status) => (
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
              <th className="px-4 py-3 font-medium">ID Machine</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Capacité</th>
              <th className="px-4 py-3 font-medium">Méthode</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredMachines.length > 0 ? (
              filteredMachines.map((machine) => (
                <tr 
                  key={machine.id} 
                  className={`hover:bg-neutral-50 ${onSelect ? 'cursor-pointer' : ''}`}
                  onClick={onSelect ? () => onSelect(machine) : undefined}
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {machine.machineId}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {machine.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {machine.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {machine.capacity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(machine.methode)}`}>
                      {getMethodName(machine.methode)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                      {getStatusName(machine.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(machine)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Modifier"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(machine.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <span className="material-icons text-base">delete</span>
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
                    <p>Aucune machine trouvée</p>
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