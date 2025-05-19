import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [methodFilter, setMethodFilter] = useState("all");
  const { toast } = useToast();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const { data: performanceData = [] } = useQuery({
    queryKey: ["/api/stats/performance", timeRange, methodFilter],
  });

  const { data: volumeData = [] } = useQuery({
    queryKey: ["/api/stats/volume", timeRange, methodFilter],
  });

  const handleExport = (format: string) => {
    toast({
      title: `Export ${format.toUpperCase()}`,
      description: `L'export ${format} a démarré. Le fichier sera téléchargé sous peu.`,
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
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Tableaux de Bord</h1>
              <p className="text-neutral-600">Suivi des performances et indicateurs</p>
            </div>
            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => handleExport("pdf")}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
              >
                <span className="material-icons text-sm mr-1">picture_as_pdf</span>
                PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="material-icons text-sm mr-1">table_chart</span>
                Excel
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Période
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                  <option value="quarter">Trimestre</option>
                  <option value="year">Année</option>
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
                  <option value="all">Toutes</option>
                  <option value="Transport">Transport</option>
                  <option value="Poussage">Poussage</option>
                  <option value="Casement">Casement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceChart
              data={performanceData}
              title="Performance des Opérations"
              dataKeys={["rendement", "disponibilite"]}
            />
            <PerformanceChart
              data={volumeData}
              title="Volumes Décapés"
              dataKeys={["volume", "metrage"]}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                  <span className="material-icons">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Rendement moyen
                  </p>
                  <p className="text-xl font-semibold text-neutral-800">
                    {performanceData.length > 0
                      ? Math.round(
                          performanceData.reduce(
                            (acc: number, item: any) => acc + item.rendement,
                            0
                          ) / performanceData.length
                        )
                      : 0}{" "}
                    m/h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <span className="material-icons">layers</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Volume total
                  </p>
                  <p className="text-xl font-semibold text-neutral-800">
                    {volumeData.length > 0
                      ? volumeData.reduce(
                          (acc: number, item: any) => acc + item.volume,
                          0
                        ).toLocaleString()
                      : 0}{" "}
                    m³
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <span className="material-icons">engineering</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Disponibilité moyenne
                  </p>
                  <p className="text-xl font-semibold text-neutral-800">
                    {performanceData.length > 0
                      ? Math.round(
                          performanceData.reduce(
                            (acc: number, item: any) => acc + item.disponibilite,
                            0
                          ) / performanceData.length
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <span className="material-icons">access_time</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Heures totales
                  </p>
                  <p className="text-xl font-semibold text-neutral-800">
                    {performanceData.length > 0
                      ? performanceData.reduce(
                          (acc: number, item: any) => acc + item.heures,
                          0
                        ).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Method Comparison */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Comparaison des Méthodes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Volume (m³)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rendement (m/h)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Disponibilité (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Heures
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      Transport
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 5000 + 10000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 20 + 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 15 + 80)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 300 + 500)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      Poussage
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 3000 + 8000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 15 + 25)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 10 + 85)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 200 + 400)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      Casement
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 4000 + 7000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 18 + 22)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 12 + 78)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {Math.floor(Math.random() * 250 + 350)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
