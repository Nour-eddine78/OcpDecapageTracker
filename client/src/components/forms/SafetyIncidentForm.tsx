import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSafetyIncidentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/components/auth/AuthProvider";
import { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/constants";

const formSchema = insertSafetyIncidentSchema.extend({});

type SafetyIncidentFormValues = z.infer<typeof formSchema>;

export default function SafetyIncidentForm({
  onClose,
  incidentToEdit = null,
}: {
  onClose: () => void;
  incidentToEdit?: any | null;
}) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<SafetyIncidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: incidentToEdit?.date || new Date().toISOString().split("T")[0],
      type: incidentToEdit?.type || "HSE",
      severity: incidentToEdit?.severity || "Moyen",
      location: incidentToEdit?.location || "",
      description: incidentToEdit?.description || "",
      actions: incidentToEdit?.actions || "",
      status: incidentToEdit?.status || "Ouvert",
      reportedBy: incidentToEdit?.reportedBy || (user ? user.id : 1),
    },
  });

  const onSubmit = async (data: SafetyIncidentFormValues) => {
    try {
      const url = incidentToEdit 
        ? `/api/safety/${incidentToEdit.id}` 
        : "/api/safety";
      
      const method = incidentToEdit ? "PATCH" : "POST";
      
      // If a new incident being created, add an incidentId
      if (!incidentToEdit) {
        data.incidentId = `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
      }
      
      await apiRequest(method, url, data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/safety"] });
      toast({
        title: incidentToEdit ? "Incident mis à jour" : "Incident créé",
        description: incidentToEdit 
          ? "L'incident a été mis à jour avec succès." 
          : "Nouvel incident de sécurité enregistré.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'incident.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-800">
              {incidentToEdit ? "Modifier l'incident" : "Nouvel incident de sécurité"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                ID de l'incident
              </label>
              <input
                type="text"
                value={incidentToEdit?.incidentId || "INC-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000)}
                className="bg-neutral-100 w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date de l'incident
              </label>
              <input
                type="date"
                {...form.register("date")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Type d'incident
              </label>
              <select
                {...form.register("type")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {INCIDENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sévérité
              </label>
              <select
                {...form.register("severity")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {INCIDENT_SEVERITY.map((severity) => (
                  <option key={severity.id} value={severity.id}>
                    {severity.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.severity && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.severity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Statut
              </label>
              <select
                {...form.register("status")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {INCIDENT_STATUS.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.status && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              {...form.register("location")}
              placeholder="Ex: Panneau P-25, Niveau N-120"
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              {...form.register("description")}
              rows={4}
              placeholder="Décrivez l'incident en détail..."
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Actions correctives
            </label>
            <textarea
              {...form.register("actions")}
              rows={3}
              placeholder="Actions entreprises ou à entreprendre..."
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.actions && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.actions.message}
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
              {incidentToEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}