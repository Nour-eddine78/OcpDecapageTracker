import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { TIME_RANGES, DECAPAGE_METHODS } from "@/lib/constants";

export default function Performance() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [methodFilter, setMethodFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const { data: performanceData = [] } = useQuery({
    queryKey: ["/api/stats/performance", timeRange, methodFilter],
  });

  const { data: machines = [] } = useQuery({
    queryKey: ["/api/machines"],
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">
              Suivi des Performances
            </h1>
            <p className="text-neutral-600">
              Analyse des performances techniques et opérationnelles
            </p>
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
                  Machine
                </label>
                <select
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="px-4 py-2 rounded-md text-neutral-800 border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="all">Toutes les machines</option>
                  {machines.map((machine: any) => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="ml-auto">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center">
                  <span className="material-icons text-sm mr-1">file_download</span>
                  Exporter
                </button>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PerformanceChart
              data={performanceData}
              title="Rendement et Disponibilité"
              dataKeys={["rendement", "disponibilite"]}
            />
            <PerformanceChart
              data={performanceData}
              title="Heures d'Opération"
              dataKeys={["heures"]}
            />
          </div>

          {/* Machine Performance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800">
                Performance par Machine
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Machine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Heures Totales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rendement Moyen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Disponibilité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Temps Moyen Entre Pannes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {machines.map((machine: any, index: number) => (
                    <tr key={machine.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-neutral-200 rounded-md flex items-center justify-center">
                            <span className="material-icons text-neutral-500">
                              construction
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {machine.name}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {machine.machineId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {machine.methode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {Math.floor(Math.random() * 1000 + 200)} h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {Math.floor(Math.random() * 30 + 20)} m/h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-neutral-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${Math.floor(Math.random() * 30 + 60)}%` }}
                            ></div>
                          </div>
                          <span>{Math.floor(Math.random() * 30 + 60)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {Math.floor(Math.random() * 100 + 50)} h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operator Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Performance par Opérateur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white mr-3">
                    <span>MH</span>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-neutral-800">Mohammed Hassan</h4>
                    <p className="text-xs text-neutral-500">Opérateur D11</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Rendement</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Heures</span>
                      <span className="font-medium">154h</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white mr-3">
                    <span>AB</span>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-neutral-800">Ahmed Benali</h4>
                    <p className="text-xs text-neutral-500">Opérateur Transwine</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Rendement</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Heures</span>
                      <span className="font-medium">168h</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "93%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white mr-3">
                    <span>KB</span>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-neutral-800">Karim Bouzidi</h4>
                    <p className="text-xs text-neutral-500">Opérateur PH1</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Rendement</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Heures</span>
                      <span className="font-medium">142h</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: "79%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
