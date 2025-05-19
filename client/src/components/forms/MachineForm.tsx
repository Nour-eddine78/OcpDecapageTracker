import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMachineSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { DECAPAGE_METHODS, MACHINE_STATUS } from "@/lib/constants";

const formSchema = insertMachineSchema.extend({});

type MachineFormValues = z.infer<typeof formSchema>;

export default function MachineForm({
  onClose,
  machineToEdit = null,
}: {
  onClose: () => void;
  machineToEdit?: any | null;
}) {
  const { toast } = useToast();

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      machineId: machineToEdit?.machineId || "",
      name: machineToEdit?.name || "",
      type: machineToEdit?.type || "",
      capacity: machineToEdit?.capacity || "",
      methode: machineToEdit?.methode || "Transport",
      status: machineToEdit?.status || "En service",
      specifications: machineToEdit?.specifications || {},
    },
  });

  const onSubmit = async (data: MachineFormValues) => {
    try {
      const url = machineToEdit 
        ? `/api/machines/${machineToEdit.id}` 
        : "/api/machines";
      
      const method = machineToEdit ? "PATCH" : "POST";
      
      await apiRequest(method, url, data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({
        title: machineToEdit ? "Machine mise à jour" : "Machine créée",
        description: machineToEdit 
          ? "La machine a été mise à jour avec succès." 
          : "Nouvelle machine enregistrée.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la machine.",
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
              {machineToEdit ? "Modifier la machine" : "Nouvelle machine"}
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
                ID de la machine
              </label>
              <input
                type="text"
                {...form.register("machineId")}
                placeholder="Ex: TWN-012"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.machineId && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.machineId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                {...form.register("name")}
                placeholder="Ex: Transwine 789D"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Type
              </label>
              <input
                type="text"
                {...form.register("type")}
                placeholder="Ex: Camion, Bulldozer, Excavatrice"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Capacité
              </label>
              <input
                type="text"
                {...form.register("capacity")}
                placeholder="Ex: 180 tonnes, 35 m³, 850 HP"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Méthode de décapage
              </label>
              <select
                {...form.register("methode")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {DECAPAGE_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.methode && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.methode.message}
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
                {MACHINE_STATUS.map((status) => (
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
              Spécifications (JSON)
            </label>
            <textarea
              {...form.register("specifications")}
              rows={4}
              placeholder='{"motorisation": "V12", "annee": 2023, "caracteristiques": ["4x4", "Turbo"]}'
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 font-mono text-sm"
            />
            {form.formState.errors.specifications && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.specifications.message}
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
              {machineToEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}