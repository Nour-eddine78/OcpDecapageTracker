import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { USER_ROLES } from "@/lib/constants";

const formSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof formSchema>;

export default function UserForm({
  onClose,
  userToEdit = null,
}: {
  onClose: () => void;
  userToEdit?: any | null;
}) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: userToEdit?.username || "",
      name: userToEdit?.name || "",
      password: "",
      confirmPassword: "",
      role: userToEdit?.role || "supervisor",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      
      const url = userToEdit 
        ? `/api/users/${userToEdit.id}` 
        : "/api/users";
      
      const method = userToEdit ? "PATCH" : "POST";
      
      // If editing and password is empty, don't send it
      if (userToEdit && !userData.password) {
        delete userData.password;
      }
      
      await apiRequest(method, url, userData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: userToEdit ? "Utilisateur mis à jour" : "Utilisateur créé",
        description: userToEdit 
          ? "L'utilisateur a été mis à jour avec succès." 
          : "Nouvel utilisateur enregistré.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'utilisateur.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-800">
              {userToEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              {...form.register("username")}
              placeholder="Ex: jdupont"
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              {...form.register("name")}
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Rôle
            </label>
            <select
              {...form.register("role")}
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              {USER_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {form.formState.errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Mot de passe {userToEdit && "(laisser vide pour ne pas modifier)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                placeholder="Mot de passe"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-icons text-base">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...form.register("confirmPassword")}
                placeholder="Confirmer le mot de passe"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              {userToEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}