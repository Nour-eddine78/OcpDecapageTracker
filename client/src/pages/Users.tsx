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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                    <span className="material-icons">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Total Utilisateurs</p>
                    <p className="text-xl font-semibold text-neutral-800">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <span className="material-icons">admin_panel_settings</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Administrateurs</p>
                    <p className="text-xl font-semibold text-neutral-800">
                      {users.filter((u: any) => u.role === "admin").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <span className="material-icons">support_agent</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Superviseurs</p>
                    <p className="text-xl font-semibold text-neutral-800">
                      {users.filter((u: any) => u.role === "supervisor").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Nom Complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Dernière Connexion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
                              <span>{user.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-neutral-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {user.role === "admin" ? "Administrateur" : "Superviseur"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Jamais"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={currentUser?.id === user.id}
                            className={`${
                              currentUser?.id === user.id 
                                ? "text-neutral-400 cursor-not-allowed" 
                                : "text-red-600 hover:text-red-900"
                            }`}
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

      {/* New/Edit User Dialog */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le nom d'utilisateur"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedUser ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={selectedUser ? "••••••••" : "Entrez le mot de passe"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le nom complet"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenUserDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      {selectedUser ? "Mise à jour..." : "Création..."}
                    </div>
                  ) : selectedUser ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
