import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PerformanceChart from "@/components/dashboard/PerformanceChart";

export default function Progress() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [site, setSite] = useState("all");

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const { data: progressData = [] } = useQuery({
    queryKey: ["/api/progress", site],
  });

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
              <h1 className="text-2xl font-bold text-neutral-800">
                Suivi des Avancements
              </h1>
              <p className="text-neutral-600">
                Analyse des progressions par zone et méthode
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="all">Tous les sites</option>
                <option value="site-1">Site Nord</option>
                <option value="site-2">Site Sud</option>
                <option value="site-3">Site Est</option>
              </select>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Progression des Décapages
            </h3>
            <div className="h-80">
              <PerformanceChart
                data={progressData}
                title=""
                dataKeys={["realise", "prevu"]}
              />
            </div>
          </div>

          {/* Zones Progress */}
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Détail par Zone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Zone Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-neutral-800">
                  Panneau P-25
                </h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  En avance
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600">Progression</span>
                  <span className="text-sm font-medium text-neutral-900">85%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-xs text-neutral-500">Volume prévu</p>
                  <p className="text-sm font-medium text-neutral-800">12,500 m³</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Volume réalisé</p>
                  <p className="text-sm font-medium text-neutral-800">10,625 m³</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Date début</p>
                  <p className="text-sm font-medium text-neutral-800">15/04/2023</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Date fin prévue</p>
                  <p className="text-sm font-medium text-neutral-800">02/06/2023</p>
                </div>
              </div>
            </div>
            
            {/* Zone Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-neutral-800">
                  Panneau P-18
                </h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  En retard
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600">Progression</span>
                  <span className="text-sm font-medium text-neutral-900">63%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: "63%" }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-xs text-neutral-500">Volume prévu</p>
                  <p className="text-sm font-medium text-neutral-800">18,200 m³</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Volume réalisé</p>
                  <p className="text-sm font-medium text-neutral-800">11,466 m³</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Date début</p>
                  <p className="text-sm font-medium text-neutral-800">22/03/2023</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Date fin prévue</p>
                  <p className="text-sm font-medium text-neutral-800">10/05/2023</p>
                </div>
              </div>
            </div>
            
            {/* Zone Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-neutral-800">
                  Panneau P-30
                </h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  À démarrer
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600">Progression</span>
                  <span className="text-sm font-medium text-neutral-900">0%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <p className="text-xs text-neutral-500">Volume prévu</p>
                  <p className="text-sm font-medium text-neutral-800">15,800 m³</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Volume réalisé</p>
                  <p className="text-sm font-medium text-neutral-800">0 m³</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Date début prévue</p>
                  <p className="text-sm font-medium text-neutral-800">12/06/2023</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Date fin prévue</p>
                  <p className="text-sm font-medium text-neutral-800">30/07/2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Progress Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800">
                Détail des Avancements
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Volume Prévu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Volume Réalisé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Progression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      P-25-T03
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Transport
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      5,200 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      4,550 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: "87%" }}
                          ></div>
                        </div>
                        <span>87%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        En avance
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      P-25-T04
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Poussage
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      7,300 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      6,075 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: "83%" }}
                          ></div>
                        </div>
                        <span>83%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        En avance
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      P-18-T02
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Casement
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      8,900 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      5,251 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: "59%" }}
                          ></div>
                        </div>
                        <span>59%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        En retard
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      P-18-T03
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Transport
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      9,300 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      6,215 m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: "67%" }}
                          ></div>
                        </div>
                        <span>67%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Normal
                      </span>
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
