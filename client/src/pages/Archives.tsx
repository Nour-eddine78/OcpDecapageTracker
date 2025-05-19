import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { TIME_RANGES, DECAPAGE_METHODS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Archives() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Queries for different archive types
  const { data: operations = [] } = useQuery({
    queryKey: ["/api/operations", { archived: true, timeRange, methodFilter }],
  });

  const { data: safetyIncidents = [] } = useQuery({
    queryKey: ["/api/safety", { archived: true, timeRange }],
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports", { timeRange }],
  });

  // Simulated reports for demo
  const simulatedReports = [
    {
      id: 1,
      title: "Rapport Mensuel Décapage - Mars 2025",
      description: "Synthèse des opérations de décapage pour le mois de Mars 2025",
      date: "2025-04-01",
      type: "Mensuel",
      fileSize: "2.4 MB",
      format: "PDF"
    },
    {
      id: 2,
      title: "Rapport Trimestriel HSE - Q1 2025",
      description: "Bilan sécurité et environnement pour le premier trimestre 2025",
      date: "2025-04-05",
      type: "Trimestriel",
      fileSize: "4.1 MB",
      format: "PDF"
    },
    {
      id: 3,
      title: "Analyse des Performances Machines - Février 2025",
      description: "Analyse détaillée des performances et rendements par machine",
      date: "2025-03-05",
      type: "Mensuel",
      fileSize: "3.7 MB",
      format: "PDF"
    },
    {
      id: 4,
      title: "Audit Opérationnel - Poussage",
      description: "Résultats de l'audit des opérations de poussage",
      date: "2025-02-20",
      type: "Audit",
      fileSize: "5.2 MB",
      format: "PDF"
    },
    {
      id: 5,
      title: "Bilan Annuel 2024",
      description: "Bilan annuel des opérations de décapage pour l'année 2024",
      date: "2025-01-15",
      type: "Annuel",
      fileSize: "8.6 MB",
      format: "PDF"
    }
  ];

  // Function to handle report download
  const handleDownloadReport = (report: any) => {
    toast({
      title: "Téléchargement démarré",
      description: `Le rapport "${report.title}" va être téléchargé sous peu.`,
    });
  };

  // Function to handle operation export
  const handleExportOperations = (format: string) => {
    toast({
      title: `Export ${format.toUpperCase()}`,
      description: `L'export des opérations en format ${format.toUpperCase()} a démarré.`,
    });
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">
              Archives & Rapports
            </h1>
            <p className="text-neutral-600">
              Consultation et téléchargement des données historiques et rapports
            </p>
          </div>

          {/* Tabs for different archive types */}
          <Tabs defaultValue="reports" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="operations">Opérations</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Période
                        </label>
                        <select
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          {TIME_RANGES.map(range => (
                            <option key={range.id} value={range.id}>{range.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Type de Rapport
                        </label>
                        <select
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="all">Tous les types</option>
                          <option value="Mensuel">Mensuel</option>
                          <option value="Trimestriel">Trimestriel</option>
                          <option value="Annuel">Annuel</option>
                          <option value="Audit">Audit</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Format
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {simulatedReports.map((report) => (
                          <tr key={report.id}>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {report.title}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {report.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {formatDate(report.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {report.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              <div className="flex items-center">
                                <span className="material-icons text-red-500 mr-1 text-base">picture_as_pdf</span>
                                {report.format} ({report.fileSize})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadReport(report)}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <span className="material-icons mr-1">file_download</span>
                                Télécharger
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Operations Tab */}
            <TabsContent value="operations">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Période
                        </label>
                        <select
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          {TIME_RANGES.map(range => (
                            <option key={range.id} value={range.id}>{range.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Méthode
                        </label>
                        <select
                          value={methodFilter}
                          onChange={(e) => setMethodFilter(e.target.value)}
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="all">Toutes les méthodes</option>
                          {DECAPAGE_METHODS.map(method => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Date Spécifique
                        </label>
                        <input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportOperations("pdf")}
                        className="flex items-center"
                      >
                        <span className="material-icons mr-1 text-sm">picture_as_pdf</span>
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportOperations("excel")}
                        className="flex items-center"
                      >
                        <span className="material-icons mr-1 text-sm">table_chart</span>
                        Excel
                      </Button>
                    </div>
                  </div>

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
                            Méthode
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Machine
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Volume (m³)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Rendement
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {operations.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-neutral-500">
                              Aucune opération archivée trouvée
                            </td>
                          </tr>
                        ) : (
                          operations.map((operation: any) => (
                            <tr key={operation.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {operation.operationId || operation.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {formatDate(operation.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {operation.methode}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {operation.machine}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {operation.volumeSaute}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {operation.rendement} m/h
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <span className="material-icons">visibility</span>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Période
                        </label>
                        <select
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          {TIME_RANGES.map(range => (
                            <option key={range.id} value={range.id}>{range.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Type d'incident
                        </label>
                        <select
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="all">Tous les types</option>
                          <option value="HSE">HSE</option>
                          <option value="Technique">Technique</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Sévérité
                        </label>
                        <select
                          className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        >
                          <option value="all">Toutes les sévérités</option>
                          <option value="Bas">Bas</option>
                          <option value="Moyen">Moyen</option>
                          <option value="Élevé">Élevé</option>
                          <option value="Critique">Critique</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportOperations("pdf")}
                        className="flex items-center"
                      >
                        <span className="material-icons mr-1 text-sm">picture_as_pdf</span>
                        PDF
                      </Button>
                    </div>
                  </div>

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
                        {safetyIncidents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-neutral-500">
                              Aucun incident archivé trouvé
                            </td>
                          </tr>
                        ) : (
                          safetyIncidents.map((incident: any) => (
                            <tr key={incident.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {incident.incidentId || incident.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {formatDate(incident.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {incident.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  incident.severity === "Critique" 
                                    ? "bg-red-100 text-red-800" 
                                    : incident.severity === "Élevé"
                                    ? "bg-orange-100 text-orange-800"
                                    : incident.severity === "Moyen"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {incident.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {incident.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  incident.status === "Résolu" 
                                    ? "bg-green-100 text-green-800" 
                                    : incident.status === "En cours"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {incident.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <span className="material-icons">visibility</span>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
