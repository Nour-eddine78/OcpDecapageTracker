import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOperationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

const formSchema = insertOperationSchema.extend({
  transportDistanceDecharge: z.number().optional(),
  transportNombreCamions: z.number().optional(),
  transportNombrePelles: z.number().optional(),
  poussageNombreBulldozers: z.number().optional(),
  poussageEtatEquipements: z.string().optional(),
  casementNombreEngins: z.number().optional(),
  casementTypeIntervention: z.string().optional(),
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
  const [showTransportFields, setShowTransportFields] = useState(false);
  const [showPoussageFields, setShowPoussageFields] = useState(false);
  const [showCasementFields, setShowCasementFields] = useState(false);

  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines"],
  });

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: operationToEdit?.id || "",
      date: operationToEdit?.date || new Date().toISOString().split("T")[0],
      methode: operationToEdit?.methode || "",
      machine: operationToEdit?.machine || "",
      poste: operationToEdit?.poste || "1",
      panneau: operationToEdit?.panneau || "",
      tranche: operationToEdit?.tranche || "",
      niveau: operationToEdit?.niveau || "",
      etatMachine: operationToEdit?.etatMachine || "marche",
      heuresMarche: operationToEdit?.heuresMarche || 0,
      dureeArret: operationToEdit?.dureeArret || 0,
      observation: operationToEdit?.observation || "",
      volumeSaute: operationToEdit?.volumeSaute || 0,
      // Method-specific fields
      transportDistanceDecharge: operationToEdit?.transportDistanceDecharge || 0,
      transportNombreCamions: operationToEdit?.transportNombreCamions || 0,
      transportNombrePelles: operationToEdit?.transportNombrePelles || 0,
      poussageNombreBulldozers: operationToEdit?.poussageNombreBulldozers || 0,
      poussageEtatEquipements: operationToEdit?.poussageEtatEquipements || "",
      casementNombreEngins: operationToEdit?.casementNombreEngins || 0,
      casementTypeIntervention: operationToEdit?.casementTypeIntervention || "",
    },
  });

  // Get values from form to check which method is selected
  const { methode, heuresMarche, volumeSaute } = form.watch();
  
  // Track calculations
  const [calculations, setCalculations] = useState({
    metrage: 0,
    rendement: 0,
    volume: 0,
    disponibilite: "0%",
  });

  // Filter machines based on selected method
  const filteredMachines = machines.filter((machine: any) => {
    if (!methode) return true;
    return machine.methode === methode;
  });

  // Effect to update form fields based on method selection
  useEffect(() => {
    setShowTransportFields(methode === "Transport");
    setShowPoussageFields(methode === "Poussage");
    setShowCasementFields(methode === "Casement");
    
    // Reset machine when method changes
    form.setValue("machine", "");
  }, [methode, form]);

  // Calculate performance metrics when relevant values change
  useEffect(() => {
    if (heuresMarche && volumeSaute) {
      // These would be more sophisticated in a real app
      const metrageCalculated = Math.round(volumeSaute * 0.4);  // Example calculation
      const rendementCalculated = heuresMarche > 0 ? Math.round(metrageCalculated / heuresMarche) : 0;
      const disponibiliteCalculated = `${Math.min(90, Math.round((heuresMarche / (heuresMarche + form.watch("dureeArret"))) * 100) || 0)}%`;
      
      setCalculations({
        metrage: metrageCalculated,
        rendement: rendementCalculated,
        volume: volumeSaute,
        disponibilite: disponibiliteCalculated,
      });
    }
  }, [heuresMarche, volumeSaute, form]);

  const onSubmit = async (data: OperationFormValues) => {
    try {
      // Prepare operation data
      const operationData = {
        ...data,
        // Add method-specific data as JSON
        methodSpecificData: methode === "Transport"
          ? {
              distanceDecharge: data.transportDistanceDecharge,
              nombreCamions: data.transportNombreCamions,
              nombrePelles: data.transportNombrePelles,
            }
          : methode === "Poussage"
          ? {
              nombreBulldozers: data.poussageNombreBulldozers,
              etatEquipements: data.poussageEtatEquipements,
            }
          : methode === "Casement"
          ? {
              nombreEngins: data.casementNombreEngins,
              typeIntervention: data.casementTypeIntervention,
            }
          : {},
        // Add calculated fields
        metrage: calculations.metrage,
        rendement: calculations.rendement,
        disponibilite: parseInt(calculations.disponibilite),
      };

      // Clean up unnecessary fields
      delete operationData.transportDistanceDecharge;
      delete operationData.transportNombreCamions;
      delete operationData.transportNombrePelles;
      delete operationData.poussageNombreBulldozers;
      delete operationData.poussageEtatEquipements;
      delete operationData.casementNombreEngins;
      delete operationData.casementTypeIntervention;

      const url = operationToEdit 
        ? `/api/operations/${operationToEdit.id}` 
        : "/api/operations";
      
      const method = operationToEdit ? "PATCH" : "POST";
      
      await apiRequest(method, url, operationData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/operations"] });
      toast({
        title: operationToEdit ? "Opération mise à jour" : "Opération créée",
        description: operationToEdit 
          ? "L'opération a été mise à jour avec succès." 
          : "Nouvelle opération de décapage enregistrée.",
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
              {operationToEdit ? "Modifier l'opération" : "Nouvelle Opération de Décapage"}
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
                ID de la fiche
              </label>
              <input
                type="text"
                value={operationToEdit?.id || "DCG-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000)}
                className="bg-neutral-100 w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date d'intervention
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Méthode de décapage
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="radio"
                  id="method-transport"
                  value="Transport"
                  {...form.register("methode")}
                  className="peer hidden"
                />
                <label
                  htmlFor="method-transport"
                  className="flex items-center p-4 bg-white border border-neutral-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:bg-neutral-50"
                >
                  <div className="mr-3 text-neutral-500 peer-checked:text-primary-600">
                    <span className="material-icons">local_shipping</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Transport</p>
                    <p className="text-xs text-neutral-500">
                      Transwine, Procaneq
                    </p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <input
                  type="radio"
                  id="method-poussage"
                  value="Poussage"
                  {...form.register("methode")}
                  className="peer hidden"
                />
                <label
                  htmlFor="method-poussage"
                  className="flex items-center p-4 bg-white border border-neutral-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:bg-neutral-50"
                >
                  <div className="mr-3 text-neutral-500 peer-checked:text-primary-600">
                    <span className="material-icons">construction</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Poussage</p>
                    <p className="text-xs text-neutral-500">D11</p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <input
                  type="radio"
                  id="method-casement"
                  value="Casement"
                  {...form.register("methode")}
                  className="peer hidden"
                />
                <label
                  htmlFor="method-casement"
                  className="flex items-center p-4 bg-white border border-neutral-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:bg-neutral-50"
                >
                  <div className="mr-3 text-neutral-500 peer-checked:text-primary-600">
                    <span className="material-icons">engineering</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Casement</p>
                    <p className="text-xs text-neutral-500">
                      PH1, PH2, 750011...
                    </p>
                  </div>
                </label>
              </div>
            </div>
            {form.formState.errors.methode && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.methode.message}
              </p>
            )}
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Poste
              </label>
              <select
                {...form.register("poste")}
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="1">Poste 1</option>
                <option value="2">Poste 2</option>
                <option value="3">Poste 3</option>
              </select>
              {form.formState.errors.poste && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.poste.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Panneau
              </label>
              <input
                type="text"
                {...form.register("panneau")}
                placeholder="Ex: P-25"
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
                placeholder="Ex: T-03"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.tranche && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.tranche.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Niveau
              </label>
              <input
                type="text"
                {...form.register("niveau")}
                placeholder="Ex: N-120"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.niveau && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.niveau.message}
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
                <option value="marche">En marche</option>
                <option value="arret">À l'arrêt</option>
              </select>
              {form.formState.errors.etatMachine && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.etatMachine.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Volume sauté (m³)
              </label>
              <input
                type="number"
                {...form.register("volumeSaute", { valueAsNumber: true })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.volumeSaute && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.volumeSaute.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Heures de marche
              </label>
              <input
                type="number"
                {...form.register("heuresMarche", { valueAsNumber: true })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.heuresMarche && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.heuresMarche.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Durée d'arrêt
              </label>
              <input
                type="number"
                {...form.register("dureeArret", { valueAsNumber: true })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              {form.formState.errors.dureeArret && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.dureeArret.message}
                </p>
              )}
            </div>
          </div>

          {/* Machine selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Machine
            </label>
            <select
              {...form.register("machine")}
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              disabled={!methode}
            >
              <option value="">Sélectionner une machine</option>
              {filteredMachines.map((machine: any) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
            {form.formState.errors.machine && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.machine.message}
              </p>
            )}
          </div>

          {/* Method-specific fields - Transport */}
          {showTransportFields && (
            <div className="form-transition opacity-100 h-auto">
              <hr className="my-6 border-neutral-200" />
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                Informations Spécifiques - Transport
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Distance de décharge (m)
                  </label>
                  <input
                    type="number"
                    {...form.register("transportDistanceDecharge", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre de camions
                  </label>
                  <input
                    type="number"
                    {...form.register("transportNombreCamions", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre de pelles
                  </label>
                  <input
                    type="number"
                    {...form.register("transportNombrePelles", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Method-specific fields - Poussage */}
          {showPoussageFields && (
            <div className="form-transition opacity-100 h-auto">
              <hr className="my-6 border-neutral-200" />
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                Informations Spécifiques - Poussage
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre de bulldozers D11
                  </label>
                  <input
                    type="number"
                    {...form.register("poussageNombreBulldozers", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  État des équipements
                </label>
                <textarea
                  {...form.register("poussageEtatEquipements")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  rows={3}
                  placeholder="Notes sur l'état des équipements..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Method-specific fields - Casement */}
          {showCasementFields && (
            <div className="form-transition opacity-100 h-auto">
              <hr className="my-6 border-neutral-200" />
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                Informations Spécifiques - Casement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre d'engins
                  </label>
                  <input
                    type="number"
                    {...form.register("casementNombreEngins", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type d'intervention
                </label>
                <textarea
                  {...form.register("casementTypeIntervention")}
                  className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  rows={3}
                  placeholder="Description du type d'intervention..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Performance calculations section */}
          <div className="bg-neutral-50 p-4 rounded-md mt-6 mb-6 border border-neutral-200">
            <h3 className="text-md font-medium text-neutral-800 mb-3">
              Calculs de Performance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Métrage décapé (m)</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {calculations.metrage}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Rendement (m/h)</p>
                <p className="text-lg font-semibold text-primary-600">
                  {calculations.rendement}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Volume décapé (m³)</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {calculations.volume}
                </p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-1">Disponibilité</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {calculations.disponibilite}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observation
            </label>
            <textarea
              {...form.register("observation")}
              className="w-full px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              rows={3}
              placeholder="Observations supplémentaires..."
            ></textarea>
            {form.formState.errors.observation && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.observation.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {operationToEdit ? "Mettre à jour" : "Soumettre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
