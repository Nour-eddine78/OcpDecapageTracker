import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INCIDENT_TYPES, INCIDENT_SEVERITY, INCIDENT_STATUS } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const incidentSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  type: z.string().min(1, "Le type d'incident est requis"),
  severity: z.string().min(1, "La sévérité est requise"),
  location: z.string().min(1, "Le lieu est requis"),
  description: z.string().min(1, "La description est requise"),
  actions: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

export default function Safety() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: "",
      severity: "",
      location: "",
      description: "",
      actions: "",
      status: "Ouvert",
    },
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["/api/safety", filterType, filterSeverity, filterStatus],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormValues) => {
      return apiRequest("POST", "/api/safety", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safety"] });
      toast({
        title: "Incident créé",
        description: "L'incident a été enregistré avec succès",
      });
      setOpenIncidentDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'incident",
        variant: "destructive",
      });
    },
  });

  const updateIncidentMutation = useMutation({
    mutationFn: async (data: { id: number; data: Partial<IncidentFormValues> }) => {
      return apiRequest("PATCH", `/api/safety/${data.id}`, data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safety"] });
      toast({
        title: "Incident mis à jour",
        description: "L'incident a été mis à jour avec succès",
      });
      setOpenIncidentDialog(false);
      setSelectedIncident(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'incident",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IncidentFormValues) => {
    if (selectedIncident) {
      updateIncidentMutation.mutate({ id: selectedIncident.id, data });
    } else {
      createIncidentMutation.mutate(data);
    }
  };

  const handleNewIncident = () => {
    setSelectedIncident(null);
    form.reset({
      date: new Date().toISOString().split('T')[0],
      type: "",
      severity: "",
      location: "",
      description: "",
      actions: "",
      status: "Ouvert",
    });
    setOpenIncidentDialog(true);
  };

  const handleEditIncident = (incident: any) => {
    setSelectedIncident(incident);
    form.reset({
      date: incident.date,
      type: incident.type,
      severity: incident.severity,
      location: incident.location,
      description: incident.description,
      actions: incident.actions || "",
      status: incident.status,
    });
    setOpenIncidentDialog(true);
  };

  const getSeverityColor = (severity: string) => {
    const severityObj = INCIDENT_SEVERITY.find(s => s.id === severity);
    return severityObj ? severityObj.color : "gray";
  };

  const getStatusColor = (status: string) => {
    const statusObj = INCIDENT_STATUS.find(s => s.id === status);
    return statusObj ? statusObj.color : "gray";
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
              <h1 className="text-2xl font-bold text-neutral-800">Sécurité & Incidents</h1>
              <p className="text-neutral-600">Gestion des incidents et de la sécurité opérationnelle</p>
            </div>
            <button
              onClick={handleNewIncident}
              className="mt-3 sm:mt-0 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              <span className="material-icons mr-1">add</span>
              Nouvel Incident
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <span className="material-icons">error_outline</span>
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium text-neutral-500">Incidents Ouverts</CardDescription>
                    <CardTitle className="text-xl font-semibold text-neutral-800">
                      {incidents.filter((i: any) => i.status === "Ouvert").length}
                    </CardTitle>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <span className="material-icons">pending_actions</span>
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium text-neutral-500">En Cours</CardDescription>
                    <CardTitle className="text-xl font-semibold text-neutral-800">
                      {incidents.filter((i: any) => i.status === "En cours").length}
                    </CardTitle>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <span className="material-icons">check_circle_outline</span>
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium text-neutral-500">Résolus</CardDescription>
                    <CardTitle className="text-xl font-semibold text-neutral-800">
                      {incidents.filter((i: any) => i.status === "Résolu").length}
                    </CardTitle>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                    <span className="material-icons">priority_high</span>
                  </div>
                  <div>
                    <CardDescription className="text-sm font-medium text-neutral-500">Incidents Critiques</CardDescription>
                    <CardTitle className="text-xl font-semibold text-neutral-800">
                      {incidents.filter((i: any) => i.severity === "Critique").length}
                    </CardTitle>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Type d'incident
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">Tous les types</option>
                  {INCIDENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sévérité
                </label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">Toutes les sévérités</option>
                  {INCIDENT_SEVERITY.map(severity => (
                    <option key={severity.id} value={severity.id}>{severity.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Statut
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">Tous les statuts</option>
                  {INCIDENT_STATUS.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="ml-auto">
                <button className="px-4 py-2 bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 flex items-center">
                  <span className="material-icons text-sm mr-1">file_download</span>
                  Exporter
                </button>
              </div>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Sévérité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-500">
                        Aucun incident trouvé
                      </td>
                    </tr>
                  ) : (
                    incidents.map((incident: any) => (
                      <tr key={incident.id} onClick={() => handleEditIncident(incident)} className="cursor-pointer hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {incident.incidentId || `INC-${incident.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {incident.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {incident.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getSeverityColor(incident.severity)}-100 text-${getSeverityColor(incident.severity)}-800`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {incident.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(incident.status)}-100 text-${getStatusColor(incident.status)}-800`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditIncident(incident);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <span className="material-icons">edit</span>
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

      {/* New/Edit Incident Dialog */}
      <Dialog open={openIncidentDialog} onOpenChange={setOpenIncidentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedIncident ? "Modifier l'incident" : "Nouvel Incident"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Localisation de l'incident"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INCIDENT_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sévérité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une sévérité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INCIDENT_SEVERITY.map(severity => (
                            <SelectItem key={severity.id} value={severity.id}>{severity.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée de l'incident"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="actions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actions entreprises</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Actions entreprises pour résoudre l'incident"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INCIDENT_STATUS.map(status => (
                          <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
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
                  onClick={() => setOpenIncidentDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createIncidentMutation.isPending || updateIncidentMutation.isPending}
                >
                  {createIncidentMutation.isPending || updateIncidentMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      {selectedIncident ? "Mise à jour..." : "Création..."}
                    </div>
                  ) : selectedIncident ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
