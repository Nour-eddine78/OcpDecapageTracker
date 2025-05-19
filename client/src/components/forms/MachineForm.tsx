import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMachineSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { DECAPAGE_METHODS, MACHINE_STATUS } from "@/lib/constants";

const formSchema = insertMachineSchema.extend({
  specifications: z.object({
    puissance: z.string().optional(),
    capaciteCharge: z.string().optional(),
    annee: z.string().optional(),
    horaireService: z.string().optional(),
    consommation: z.string().optional(),
  }).optional(),
});

type MachineFormValues = z.infer<typeof formSchema>;

export default function MachineForm({
  onClose,
  machineToEdit = null,
}: {
  onClose: () => void;
  machineToEdit?: any | null;
}) {
  const { toast } = useToast();

  // Set up default values for the form
  const defaultSpecifications = machineToEdit?.specifications || {};
  
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      machineId: machineToEdit?.machineId || `M-${new Date().getTime().toString().slice(-6)}`,
      name: machineToEdit?.name || "",
      type: machineToEdit?.type || "",
      methode: machineToEdit?.methode || "Transport",
      capacity: machineToEdit?.capacity || "",
      status: machineToEdit?.status || "En service",
      specifications: {
        puissance: defaultSpecifications.puissance || "",
        capaciteCharge: defaultSpecifications.capaciteCharge || "",
        annee: defaultSpecifications.annee || "",
        horaireService: defaultSpecifications.horaireService || "",
        consommation: defaultSpecifications.consommation || "",
      },
    },
  });

  const onSubmit = async (data: MachineFormValues) => {
    try {
      // Clean empty specs fields
      const specifications: Record<string, string> = {};
      if (data.specifications) {
        Object.entries(data.specifications).forEach(([key, value]) => {
          if (value && value.trim() !== "") {
            specifications[key] = value;
          }
        });
      }
      
      // Only include specifications if we have at least one valid entry
      const finalData = {
        ...data,
        specifications: Object.keys(specifications).length > 0 ? specifications : null,
      };
      
      const url = machineToEdit 
        ? `/api/machines/${machineToEdit.id}` 
        : "/api/machines";
      
      const method = machineToEdit ? "PATCH" : "POST";
      
      await apiRequest(method, url, finalData);
      
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
                readOnly={!!machineToEdit}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100"
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
                placeholder="Ex: Bulldozer CAT D11"
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
                Type de machine
              </label>
              <input
                type="text"
                {...form.register("type")}
                placeholder="Ex: Bulldozer, Pelleteuse, Camion, etc."
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Capacité
              </label>
              <input
                type="text"
                {...form.register("capacity")}
                placeholder="Ex: 60 tonnes, 12m³, etc."
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.capacity.message}
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
            <div className="flex items-center mb-4">
              <h3 className="text-base font-medium text-neutral-800">Spécifications techniques</h3>
              <div className="flex-grow ml-3 h-px bg-neutral-200"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Puissance
                </label>
                <input
                  type="text"
                  {...form.register("specifications.puissance")}
                  placeholder="Ex: 850 CV"
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Capacité de charge
                </label>
                <input
                  type="text"
                  {...form.register("specifications.capaciteCharge")}
                  placeholder="Ex: 100 tonnes"
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Année de fabrication
                </label>
                <input
                  type="text"
                  {...form.register("specifications.annee")}
                  placeholder="Ex: 2020"
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Horaire de service
                </label>
                <input
                  type="text"
                  {...form.register("specifications.horaireService")}
                  placeholder="Ex: 24/7, 8h-20h"
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Consommation
                </label>
                <input
                  type="text"
                  {...form.register("specifications.consommation")}
                  placeholder="Ex: 50L/h"
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
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