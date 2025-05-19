import { useState } from "react";
import { USER_ROLES } from "@/lib/constants";

type UsersTableProps = {
  users: any[];
  onEdit?: (user: any) => void;
  onDelete?: (id: string) => void;
};

export default function UsersTable({
  users,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

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

  // Get role name from ID
  const getRoleName = (roleId: string) => {
    const role = USER_ROLES.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center relative w-full sm:w-64">
            <span className="absolute left-3 text-neutral-400 material-icons">search</span>
            <input
              type="text"
              placeholder="Rechercher par nom ou username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            >
              <option value="all">Tous les rôles</option>
              {USER_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
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
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Nom d'utilisateur</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Date de création</th>
              <th className="px-4 py-3 font-medium">Dernière connexion</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    <span className={`inline-block px-2 py-1 rounded-full bg-neutral-100 text-xs font-medium ${
                      user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Jamais"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Modifier"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                      )}
                      {onDelete && user.role !== "admin" && (
                        <button
                          onClick={() => onDelete(user.id)}
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
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-icons text-3xl mb-2">search_off</span>
                    <p>Aucun utilisateur trouvé</p>
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