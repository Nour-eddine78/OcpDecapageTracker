import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import MethodCard from "@/components/dashboard/MethodCard";
import DocumentCard from "@/components/dashboard/DocumentCard";
import MachineTable from "@/components/tables/MachineTable";
import OperationsForm from "@/components/forms/OperationsForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOperationsForm, setShowOperationsForm] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: machines = [], isLoading: machinesLoading } = useQuery({
    queryKey: ["/api/machines"],
  });

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleViewMachine = (machine: any) => {
    toast({
      title: "Fiche technique",
      description: `Affichage de la fiche technique de ${machine.name}`,
    });
  };

  const handleDownloadMachine = (machine: any) => {
    toast({
      title: "Téléchargement",
      description: `Téléchargement de la fiche technique de ${machine.name}`,
    });
  };

  const handleDocumentAction = (type: string) => {
    toast({
      title: "Document",
      description: `Téléchargement du document: ${type}`,
    });
  };

  const machineImages = [
    {
      id: 1,
      name: "Bulldozer Caterpillar D11",
      description: "Bulldozer puissant pour les opérations de poussage en terrain difficile",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format",
      specs: "Puissance: 850 hp, Lame: 5m, Capacité: 35m³/h"
    },
    {
      id: 2,
      name: "Pelle hydraulique Liebherr R 9800",
      description: "Pelle hydraulique haute performance pour extraction efficace",
      image: "https://images.unsplash.com/photo-1575661290979-0a8e2f7b5291?q=80&w=2069&auto=format",
      specs: "Capacité: 42m³, Portée: 15m, Puissance: 4000 hp"
    },
    {
      id: 3,
      name: "Tombereau Komatsu 930E",
      description: "Camion minier à haute capacité pour transport de matériaux",
      image: "https://images.unsplash.com/photo-1506843056359-bc61bb533ff4?q=80&w=2071&auto=format",
      specs: "Charge utile: 290 tonnes, Vitesse max: 64km/h"
    },
    {
      id: 4,
      name: "Foreuse Atlas Copco DM45",
      description: "Foreuse puissante pour forage de précision",
      image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=2069&auto=format",
      specs: "Profondeur: 53m, Diamètre: 152-229mm"
    }
  ];

  const progressData = [
    { site: "Benguerir", completed: 68, total: 100 },
    { site: "Khouribga", completed: 42, total: 100 },
    { site: "Youssoufia", completed: 85, total: 100 },
    { site: "Laâyoune", completed: 23, total: 100 }
  ];

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
          {/* Hero Section with Project Overview */}
          <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 rounded-xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative z-10 p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-6 md:mb-0 md:w-2/3">
                  <Badge className="bg-white/20 text-white mb-3 backdrop-blur-sm">Projet OCP Décapage</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">Gestion des Opérations de Décapage</h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">
                    Système intégré de suivi des opérations de décapage minier pour l'amélioration de la performance et de la sécurité.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="secondary"
                      className="bg-white text-primary-900 hover:bg-white/90"
                      onClick={() => setLocation("/operations")}
                    >
                      <span className="material-icons mr-2">play_arrow</span>
                      Commencer une opération
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/20"
                      onClick={() => window.open('/documentation.pdf', '_blank')}
                    >
                      <span className="material-icons mr-2">download</span>
                      Documentation
                    </Button>
                  </div>
                </div>
                <div className="md:w-1/3">
                  <Card className="bg-white/10 backdrop-blur-sm border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Objectifs de forage et décapage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {progressData.map((site) => (
                          <div key={site.site} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-white">{site.site}</span>
                              <span className="text-sm font-medium text-white">{site.completed}%</span>
                            </div>
                            <Progress value={site.completed} max={site.total} className="h-2 bg-white/20" indicatorClassName="bg-white" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for different content sections */}
          <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="methods">Méthodes</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {/* Quick Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon="engineering"
                  title="Machines Actives"
                  value={stats.activeMachines || 0}
                  type="primary"
                />
                <StatCard
                  icon="area_chart"
                  title="Volume Décapé (m³)"
                  value={stats.volume || 0}
                  type="info"
                />
                <StatCard
                  icon="speed"
                  title="Rendement Moyen"
                  value={stats.avgPerformance || "0%"}
                  type="success"
                />
                <StatCard
                  icon="error_outline"
                  title="Incidents (30j)"
                  value={stats.incidents || 0}
                  type="warning"
                />
              </div>

              {/* Stade de Foration Section */}
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Stade de Foration Actuel</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium text-neutral-800 mb-3">Aperçu des Opérations</h3>
                    <p className="text-neutral-600 mb-4">
                      Le processus de foration et de décapage est actuellement en cours sur plusieurs sites. Les équipes travaillent 
                      selon un planning optimisé pour maximiser l'efficacité et minimiser l'impact environnemental.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-50 p-3 rounded-md">
                        <p className="text-sm text-neutral-500">Profondeur moyenne</p>
                        <p className="text-xl font-semibold text-neutral-800">42,5 m</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-md">
                        <p className="text-sm text-neutral-500">Trous forés ce mois</p>
                        <p className="text-xl font-semibold text-neutral-800">583</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-md">
                        <p className="text-sm text-neutral-500">Rendement journalier</p>
                        <p className="text-xl font-semibold text-neutral-800">12 250 m³</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-md">
                        <p className="text-sm text-neutral-500">Efficacité opérationnelle</p>
                        <p className="text-xl font-semibold text-neutral-800">87,2%</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium text-neutral-800 mb-3">Objectifs Actuels</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="material-icons text-green-500 mr-2 mt-0.5">check_circle</span>
                        <div>
                          <p className="font-medium text-neutral-800">Finalisation du site Benguerir</p>
                          <p className="text-sm text-neutral-600">Objectif à 68%, prévu pour fin Juin 2025</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-amber-500 mr-2 mt-0.5">pending</span>
                        <div>
                          <p className="font-medium text-neutral-800">Préparation zone Nord Khouribga</p>
                          <p className="text-sm text-neutral-600">42% complété, en cours selon planning</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-blue-500 mr-2 mt-0.5">arrow_forward</span>
                        <div>
                          <p className="font-medium text-neutral-800">Optimisation du processus de forage</p>
                          <p className="text-sm text-neutral-600">Réduction de 8% des coûts opérationnels</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="material-icons text-primary-500 mr-2 mt-0.5">trending_up</span>
                        <div>
                          <p className="font-medium text-neutral-800">Amélioration des standards HSE</p>
                          <p className="text-sm text-neutral-600">Zéro incident majeur sur les 45 derniers jours</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="machines">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Parc machines
              </h2>

              {/* Featured Machines with Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {machineImages.map((machine) => (
                  <Card key={machine.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={machine.image} 
                        alt={machine.name} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">{machine.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{machine.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-neutral-500 mb-3">{machine.specs}</p>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewMachine({ name: machine.name })}
                        >
                          <span className="material-icons text-sm mr-1">visibility</span>
                          Fiche
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDownloadMachine({ name: machine.name })}
                        >
                          <span className="material-icons text-sm mr-1">file_download</span>
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Machine Table */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-800">
                    Fiches Techniques des Machines
                  </h2>
                  <button 
                    onClick={() => setLocation("/machines")}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <span>Voir toutes</span>
                    <span className="material-icons ml-1">arrow_forward</span>
                  </button>
                </div>

                {machinesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <MachineTable 
                    machines={machines.slice(0, 5)}
                    onView={handleViewMachine}
                    onDownload={handleDownloadMachine}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="methods">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Méthodes de Décapage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MethodCard
                  title="Transport"
                  description="Méthode utilisant des camions pour le déplacement des matériaux décapés vers des zones de stockage."
                  machines="Transwine, Procaneq"
                  image="https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                />
                <MethodCard
                  title="Poussage"
                  description="Utilisation de bulldozers pour pousser et déplacer des matériaux sur des distances courtes."
                  machines="D11, D9R, 834K"
                  image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format"
                />
                <MethodCard
                  title="Casement"
                  description="Technique d'excavation impliquant l'extraction et la disposition des matériaux par couches."
                  machines="750011, 750012, PH1, PH2, 200B1, Libhere"
                  image="https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                />
              </div>

              {/* Workflow & Process Diagram */}
              <h3 className="text-lg font-medium text-neutral-800 mb-4">Processus de Décapage</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="bg-primary-100 mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      <span className="material-icons text-primary-600">explore</span>
                    </div>
                    <h4 className="font-medium text-neutral-800">Exploration</h4>
                    <p className="text-sm text-neutral-600">Identification des zones à décaper</p>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="bg-primary-100 mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      <span className="material-icons text-primary-600">science</span>
                    </div>
                    <h4 className="font-medium text-neutral-800">Analyse</h4>
                    <p className="text-sm text-neutral-600">Évaluation géologique</p>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="bg-primary-100 mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      <span className="material-icons text-primary-600">construction</span>
                    </div>
                    <h4 className="font-medium text-neutral-800">Foration</h4>
                    <p className="text-sm text-neutral-600">Préparation du terrain</p>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="bg-primary-100 mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      <span className="material-icons text-primary-600">engineering</span>
                    </div>
                    <h4 className="font-medium text-neutral-800">Décapage</h4>
                    <p className="text-sm text-neutral-600">Transport ou poussage</p>
                  </div>
                  <div className="text-center p-4 border border-neutral-200 rounded-lg">
                    <div className="bg-primary-100 mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-2">
                      <span className="material-icons text-primary-600">done_all</span>
                    </div>
                    <h4 className="font-medium text-neutral-800">Finalisation</h4>
                    <p className="text-sm text-neutral-600">Traitement et stabilisation</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Documentation Technique & Ressources
              </h2>
              
              {/* Documents Section - Categorized */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-primary-600">description</span>
                      <CardTitle>Procédures Opérationnelles</CardTitle>
                    </div>
                    <CardDescription>Documents officiels pour les opérations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Manuel d'opérations de décapage</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Manuel d'opérations")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Procédures de forage 2025</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Procédures forage")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Guide technique des machines</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Guide technique")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-red-600">health_and_safety</span>
                      <CardTitle>Normes HSE</CardTitle>
                    </div>
                    <CardDescription>Santé, Sécurité et Environnement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Procédures d'urgence sur site</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Procédures d'urgence")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Gestion des risques opérationnels</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Gestion risques")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                      <li className="flex justify-between items-center p-2 hover:bg-neutral-50 rounded-md">
                        <span className="text-neutral-800">Impact environnemental</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDocumentAction("Impact environnemental")}
                        >
                          <span className="material-icons">file_download</span>
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation & Ressources Cards */}
              <h3 className="text-lg font-medium text-neutral-800 mb-4">Ressources supplémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DocumentCard
                  icon="description"
                  title="Procédures d'opération standard"
                  description="Protocoles et directives pour les opérations de décapage."
                  actionIcon="file_download"
                  actionText="Télécharger PDF"
                  onClick={() => handleDocumentAction("Procédures")}
                />
                <DocumentCard
                  icon="video_library"
                  title="Vidéos de formation"
                  description="Tutoriels vidéo pour l'utilisation optimale des machines."
                  actionIcon="play_circle_outline"
                  actionText="Voir la bibliothèque"
                  onClick={() => handleDocumentAction("Vidéos")}
                />
                <DocumentCard
                  icon="rule"
                  title="Normes HSE"
                  description="Règles et procédures de sécurité pour les opérations de terrain."
                  actionIcon="file_download"
                  actionText="Télécharger PDF"
                  onClick={() => handleDocumentAction("HSE")}
                />
                <DocumentCard
                  icon="build"
                  title="Manuels techniques"
                  description="Spécifications et guides d'entretien des équipements."
                  actionIcon="folder_open"
                  actionText="Parcourir les manuels"
                  onClick={() => handleDocumentAction("Manuels")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {showOperationsForm && (
        <OperationsForm onClose={() => setShowOperationsForm(false)} />
      )}
    </div>
  );
}
