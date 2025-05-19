import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOperationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { DECAPAGE_METHODS, POSTES, MACHINE_STATES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

const formSchema = insertOperationSchema.extend({
  heuresMarche: z.string().transform((val) => parseFloat(val) || 0),
  dureeArret: z.string().transform((val) => parseFloat(val) || 0),
  metrage: z.string().transform((val) => parseFloat(val) || 0),
  volume: z.string().transform((val) => parseFloat(val) || 0),
  distanceDecharge: z.string().optional().transform((val) => (val ? parseFloat(val) || 0 : undefined)),
  nombreCamions: z.string().optional().transform((val) => (val ? parseInt(val) || 0 : undefined)),
  nombrePelles: z.string().optional().transform((val) => (val ? parseInt(val) || 0 : undefined)),
  nombreBulldozers: z.string().optional().transform((val) => (val ? parseInt(val) || 0 : undefined)),
  nombreEngins: z.string().optional().transform((val) => (val ? parseInt(val) || 0 : undefined)),
  typeIntervention: z.string().optional(),
});

type OperationFormValues = z.infer<typeof formSchema>;

export default function OperationsForm({
  onClose,
  operationToEdit = null,
}: {
  onClose: () => void;
  operationToEdit?: any | null;
}) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState(operationToEdit?.methode || "Transport");
  
  // Fetch machines based on selected method
  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines", selectedMethod],
    queryFn: () => 
      apiRequest("GET", `/api/machines?methode=${selectedMethod}`)
        .then(data => data || [])
  });

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operationId: operationToEdit?.operationId || `OP-${new Date().getTime().toString().slice(-6)}`,
      date: operationToEdit?.date || new Date().toISOString().split('T')[0],
      methode: operationToEdit?.methode || "Transport",
      machine: operationToEdit?.machine || "",
      poste: operationToEdit?.poste || "1",
      panneau: operationToEdit?.panneau || "",
      tranche: operationToEdit?.tranche || "",
      niveau: operationToEdit?.niveau || "",
      etatMachine: operationToEdit?.etatMachine || "marche",
      heuresMarche: operationToEdit?.heuresMarche?.toString() || "0",
      dureeArret: operationToEdit?.dureeArret?.toString() || "0",
      observation: operationToEdit?.observation || "",
      volume: operationToEdit?.volume?.toString() || "0",
      metrage: operationToEdit?.metrage?.toString() || "0",
      rendement: operationToEdit?.rendement || 0,
      disponibilite: operationToEdit?.disponibilite || 0,
      // Method-specific fields
      distanceDecharge: operationToEdit?.methodSpecificData?.distanceDecharge?.toString() || "",
      nombreCamions: operationToEdit?.methodSpecificData?.nombreCamions?.toString() || "",
      nombrePelles: operationToEdit?.methodSpecificData?.nombrePelles?.toString() || "",
      nombreBulldozers: operationToEdit?.methodSpecificData?.nombreBulldozers?.toString() || "",
      nombreEngins: operationToEdit?.methodSpecificData?.nombreEngins?.toString() || "",
      typeIntervention: operationToEdit?.methodSpecificData?.typeIntervention || "",
    },
  });

  // Watch relevant fields for calculations
  const watchMethod = form.watch("methode");
  const watchHeuresMarche = form.watch("heuresMarche");
  const watchMetrage = form.watch("metrage");
  const watchEtatMachine = form.watch("etatMachine");
  const watchDureeArret = form.watch("dureeArret");
  
  // Update machine list when method changes
  useEffect(() => {
    setSelectedMethod(watchMethod);
    // Clear the machine selection when method changes
    if (watchMethod !== operationToEdit?.methode) {
      form.setValue("machine", "");
    }
  }, [watchMethod, form, operationToEdit]);

  // Automatic calculations
  useEffect(() => {
    // Calculate rendement (Performance) - metrage / heuresMarche
    const metrage = parseFloat(watchMetrage) || 0;
    const heuresMarche = parseFloat(watchHeuresMarche) || 0;
    
    // Avoid division by zero
    if (heuresMarche > 0) {
      const rendement = metrage / heuresMarche;
      form.setValue("rendement", parseFloat(rendement.toFixed(2)));
    } else {
      form.setValue("rendement", 0);
    }
    
    // Calculate disponibilité (Availability) - heuresMarche / (heuresMarche + dureeArret)
    const dureeArret = parseFloat(watchDureeArret) || 0;
    const totalHours = heuresMarche + dureeArret;
    
    if (totalHours > 0) {
      const disponibilite = (heuresMarche / totalHours) * 100;
      form.setValue("disponibilite", parseFloat(disponibilite.toFixed(2)));
    } else {
      form.setValue("disponibilite", 0);
    }
    
    // If machine is à l'arrêt, set heuresMarche to 0
    if (watchEtatMachine === "arret" && heuresMarche > 0) {
      form.setValue("heuresMarche", "0");
    }
  }, [watchMetrage, watchHeuresMarche, watchEtatMachine, watchDureeArret, form]);

  const onSubmit = async (data: OperationFormValues) => {
    try {
      // Prepare method-specific data based on selected method
      const methodSpecificData: any = {};
      
      if (data.methode === "Transport") {
        methodSpecificData.distanceDecharge = data.distanceDecharge;
        methodSpecificData.nombreCamions = data.nombreCamions;
        methodSpecificData.nombrePelles = data.nombrePelles;
      } else if (data.methode === "Poussage") {
        methodSpecificData.nombreBulldozers = data.nombreBulldozers;
      } else if (data.methode === "Casement") {
        methodSpecificData.nombreEngins = data.nombreEngins;
        methodSpecificData.typeIntervention = data.typeIntervention;
      }
      
      // Prepare the final data object with method-specific data
      const finalData = {
        ...data,
        methodSpecificData
      };
      
      // Remove undefined method-specific fields from the root object
      delete finalData.distanceDecharge;
      delete finalData.nombreCamions;
      delete finalData.nombrePelles;
      delete finalData.nombreBulldozers;
      delete finalData.nombreEngins;
      delete finalData.typeIntervention;
      
      const url = operationToEdit 
        ? `/api/operations/${operationToEdit.id}` 
        : "/api/operations";
      
      const method = operationToEdit ? "PATCH" : "POST";
      
      await apiRequest(method, url, finalData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: operationToEdit ? "Opération mise à jour" : "Opération créée",
        description: operationToEdit 
          ? "L'opération a été mise à jour avec succès." 
          : "Nouvelle opération enregistrée.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'opération.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-800">
              {operationToEdit ? "Modifier l'opération" : "Nouvelle opération"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                ID de l'opération
              </label>
              <input
                type="text"
                {...form.register("operationId")}
                readOnly={!!operationToEdit}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100"
              />
              {form.formState.errors.operationId && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.operationId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Machine
              </label>
              <select
                {...form.register("machine")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Sélectionnez une machine</option>
                {machines.map((machine: any) => (
                  <option key={machine.id} value={machine.machineId}>
                    {machine.machineId} - {machine.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.machine && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.machine.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Poste
              </label>
              <select
                {...form.register("poste")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {POSTES.map((poste) => (
                  <option key={poste.id} value={poste.id}>
                    {poste.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.poste && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.poste.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                État de la machine
              </label>
              <select
                {...form.register("etatMachine")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                {MACHINE_STATES.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.etatMachine && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.etatMachine.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Panneau
              </label>
              <input
                type="text"
                {...form.register("panneau")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.panneau && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.panneau.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tranche
              </label>
              <input
                type="text"
                {...form.register("tranche")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.tranche && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.tranche.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Niveau
              </label>
              <input
                type="text"
                {...form.register("niveau")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.niveau && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.niveau.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Heures de marche
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...form.register("heuresMarche")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                disabled={watchEtatMachine === "arret"}
              />
              {form.formState.errors.heuresMarche && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.heuresMarche.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Durée d'arrêt (heures)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...form.register("dureeArret")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.dureeArret && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.dureeArret.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Disponibilité (%)
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                value={form.getValues().disponibilite}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 bg-neutral-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Métrage (m)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...form.register("metrage")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.metrage && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.metrage.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Volume (m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...form.register("volume")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.volume && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.volume.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Rendement (m/h)
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                value={form.getValues().rendement}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 bg-neutral-50"
              />
            </div>
          </div>

          {/* Method-specific fields based on selected method */}
          {watchMethod === "Transport" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-blue-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Distance de décharge (m)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...form.register("distanceDecharge")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de camions
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...form.register("nombreCamions")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de pelles
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...form.register("nombrePelles")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          )}

          {watchMethod === "Poussage" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-emerald-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de bulldozers D11
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...form.register("nombreBulldozers")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          )}

          {watchMethod === "Casement" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-amber-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre d'engins
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...form.register("nombreEngins")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type d'intervention
                </label>
                <input
                  type="text"
                  {...form.register("typeIntervention")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observations
            </label>
            <textarea
              {...form.register("observation")}
              rows={4}
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {form.formState.errors.observation && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.observation.message}
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
              {operationToEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}