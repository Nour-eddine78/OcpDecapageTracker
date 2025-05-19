import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/forms/UserForm";
import UsersTable from "@/components/tables/UsersTable";
import StatCard from "@/components/dashboard/StatCard";



export default function Users() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Redirect if not admin
  if (currentUser?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <span className="material-icons text-4xl text-red-500">lock</span>
              <h1 className="text-xl font-bold">Accès Restreint</h1>
              <p className="text-neutral-600">
                Vous n'avez pas les droits d'accès nécessaires pour cette page.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Retourner à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const handleNewUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteUserMutation.mutate(id);
    }
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
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Gestion des Utilisateurs</h1>
              <p className="text-neutral-600">Administration des comptes et des droits d'accès</p>
            </div>
            <button
              onClick={handleNewUser}
              className="mt-3 sm:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              <span className="material-icons mr-1">person_add</span>
              Nouvel Utilisateur
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard 
              title="Total Utilisateurs" 
              value={users.length} 
              icon="person"
              iconBgColor="bg-primary-100" 
              iconColor="text-primary-600" 
            />
            
            <StatCard 
              title="Administrateurs" 
              value={users.filter((u: any) => u.role === "admin").length} 
              icon="admin_panel_settings"
              iconBgColor="bg-blue-100" 
              iconColor="text-blue-600" 
            />
            
            <StatCard 
              title="Superviseurs" 
              value={users.filter((u: any) => u.role === "supervisor").length} 
              icon="support_agent"
              iconBgColor="bg-green-100" 
              iconColor="text-green-600" 
            />
          </div>

          {/* Users Table */}
          <UsersTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </div>
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm 
          onClose={() => setShowUserForm(false)} 
          userToEdit={selectedUser} 
        />
      )}
    </div>
  );
}
