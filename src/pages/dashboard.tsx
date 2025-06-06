import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import DashboardTree from '@/components/DashboardTree';
import Breadcrumbs from '@/components/Breadcrumbs';
import { prisma } from '@/lib/prisma';
import { TreeNode } from '@/types/tree';
import ReactECharts from 'echarts-for-react';
import { useSession } from 'next-auth/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Device {
    id: string;
    macAddress: string;
    name: string;
    areaId: string;
    createdAt: string;
    updatedAt: string;
}

interface AccessPointStats {
    access_point: string;
    datum: string;
    anzahl_sessions: number;
    input_bytes: string;
    output_bytes: string;
    total_bytes: string;
}

interface DashboardProps {
    nodes: TreeNode[];
}

type TimeRange = '7d' | '14d' | '30d' | '3m' | '6m' | '1y';

export default function Dashboard({ nodes }: DashboardProps) {
    const { data: session } = useSession();
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [stats, setStats] = useState<AccessPointStats[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(false);
    const [filteredNodes, setFilteredNodes] = useState<TreeNode[]>([]);
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [isStructureOpen, setIsStructureOpen] = useState(true);

    // Funktion zum Aufbauen der Baumstruktur
    const buildTree = (nodes: TreeNode[], parentId: string | null = null): TreeNode[] => {
        return nodes
            .filter(node => node.parentId === parentId)
            .map(node => ({
                ...node,
                children: buildTree(nodes, node.id)
            }));
    };

    useEffect(() => {
        const builtTree = buildTree(nodes);
        setTree(builtTree);
        
        if (session?.user) {
            if (session.user.role === 'SUPERADMIN') {
                // SUPERADMIN sieht die komplette Struktur
                setFilteredNodes(builtTree);
            } else if (session.user.nodeId) {
                // ADMIN und USER sehen nur ab ihrem zugewiesenen Node
                const findNodeAndChildren = (nodes: TreeNode[], nodeId: string): TreeNode[] => {
                    const result: TreeNode[] = [];
                    const findNode = (nodes: TreeNode[], targetId: string): TreeNode | null => {
                        for (const node of nodes) {
                            if (node.id === targetId) return node;
                            if (node.children) {
                                const found = findNode(node.children, targetId);
                                if (found) return found;
                            }
                        }
                        return null;
                    };

                    const startNode = findNode(nodes, nodeId);
                    if (startNode) {
                        result.push(startNode);
                    }
                    return result;
                };

                setFilteredNodes(findNodeAndChildren(builtTree, session.user.nodeId));
            }
        }
    }, [session, nodes]);

    const getSubordinateAreaIds = (node: TreeNode): string[] => {
        let areaIds: string[] = [];
        
        // Wenn der aktuelle Knoten ein Bereich ist, füge seine ID hinzu
        if (node.category === 'BEREICH') {
            areaIds.push(node.id);
        }
        
        // Rekursiv IDs aller untergeordneten Bereiche sammeln
        if (node.children) {
            node.children.forEach(child => {
                areaIds = [...areaIds, ...getSubordinateAreaIds(child)];
            });
        }
        
        return areaIds;
    };

    const formatMacAddress = (mac: string) => {
        return mac.replace(/:/g, '-');
    };

    const getDateRange = (range: TimeRange) => {
        const today = new Date();
        const startDate = new Date();
        
        switch (range) {
            case '7d':
                startDate.setDate(today.getDate() - 7);
                break;
            case '14d':
                startDate.setDate(today.getDate() - 14);
                break;
            case '30d':
                startDate.setDate(today.getDate() - 30);
                break;
            case '3m':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case '6m':
                startDate.setMonth(today.getMonth() - 6);
                break;
            case '1y':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
        }
        
        return {
            from: startDate.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        };
    };

    useEffect(() => {
        const loadDevices = async () => {
            if (selectedNode) {
                setIsLoading(true);
                try {
                    // IDs aller untergeordneten Bereiche sammeln
                    const areaIds = getSubordinateAreaIds(selectedNode);
                    
                    if (areaIds.length > 0) {
                        // Geräte für alle gefundenen Bereiche laden
                        const devicesPromises = areaIds.map(areaId => 
                            fetch(`/api/devices?areaId=${areaId}`).then(res => res.json())
                        );
                        
                        const devicesArrays = await Promise.all(devicesPromises);
                        const allDevices = devicesArrays.flat();
                        setDevices(allDevices);

                        // Lade Statistiken für alle Geräte
                        const { from: fromDate, to: toDate } = getDateRange(timeRange);
                        const from = `${fromDate} 00:00:00`;
                        const to = `${toDate} 23:59:59`;
                        const statsPromises = allDevices.map(device => 
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accesspoint-stats?mac_prefix=${formatMacAddress(device.macAddress)}&from=${from}&to=${to}`, 
                                process.env.NEXT_PUBLIC_API_KEY ? {
                                    headers: {
                                        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
                                    }
                                } : undefined
                            ).then(res => res.json())
                        );
                        
                        const statsArrays = await Promise.all(statsPromises);
                        const allStats = statsArrays.flat();
                        setStats(allStats);
                    } else {
                        setDevices([]);
                        setStats([]);
                    }
                } catch (error) {
                    console.error('Fehler beim Laden der Daten:', error);
                    setDevices([]);
                    setStats([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setDevices([]);
                setStats([]);
                setIsLoading(false);
            }
        };

        loadDevices();
    }, [selectedNode, timeRange]);

    const getChartOptions = () => {
        // Erstelle die X-Achse (Daten)
        const dates = [...new Set(stats.map(stat => stat.datum))].sort();

        // Erstelle die aufsummierten Serien
        const totalSeries = [{
            name: 'Gesamt',
            type: 'bar',
            data: dates.map(date => {
                return stats
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + Math.round(parseInt(stat.total_bytes) / (1024 * 1024)), 0);
            })
        }];

        const totalSessionsSeries = [{
            name: 'Gesamt',
            type: 'bar',
            data: dates.map(date => {
                return stats
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + stat.anzahl_sessions, 0);
            })
        }];

        // Gruppiere die Daten nach Bereich
        const areaData = stats.reduce((acc, stat) => {
            const device = devices.find(d => {
                const deviceMac = d.macAddress.replace(/:/g, '-');
                const statMac = stat.access_point.replace(/:/g, '-').substring(0, 17);
                return deviceMac === statMac;
            });
            
            if (device) {
                const area = nodes.find(n => n.id === device.areaId);
                
                if (area) {
                    if (!acc[area.name]) {
                        acc[area.name] = [];
                    }
                    acc[area.name].push(stat);
                }
            }
            return acc;
        }, {} as Record<string, AccessPointStats[]>);

        // Erstelle die Serien für jeden Bereich
        const areaBytesSeries = Object.entries(areaData).map(([areaName, data]) => ({
            name: areaName,
            type: 'bar',
            data: dates.map(date => {
                return data
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + Math.round(parseInt(stat.total_bytes) / (1024 * 1024)), 0);
            })
        }));

        const areaSessionsSeries = Object.entries(areaData).map(([areaName, data]) => ({
            name: areaName,
            type: 'bar',
            data: dates.map(date => {
                return data
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + stat.anzahl_sessions, 0);
            })
        }));

        const totalOption = {
            title: {
                text: 'Gesamter Datenverkehr (MByte)',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params: any) {
                    return params[0].axisValue + '<br/>' + 
                           params[0].marker + ' Gesamt: ' + params[0].value + ' MByte';
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value',
                name: 'MByte'
            },
            series: totalSeries
        };

        const totalSessionsOption = {
            title: {
                text: 'Gesamtzahl der Sessions',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params: any) {
                    return params[0].axisValue + '<br/>' + 
                           params[0].marker + ' Gesamt: ' + params[0].value + ' Sessions';
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value',
                name: 'Sessions'
            },
            series: totalSessionsSeries
        };

        const areaBytesOption = {
            title: {
                text: 'Datenverkehr pro Bereich (MByte)',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params: any) {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach((param: any) => {
                        result += param.marker + ' ' + param.seriesName + ': ' + param.value + ' MByte<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: Object.keys(areaData),
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value',
                name: 'MByte'
            },
            series: areaBytesSeries
        };

        const areaSessionsOption = {
            title: {
                text: 'Sessions pro Bereich',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params: any) {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach((param: any) => {
                        result += param.marker + ' ' + param.seriesName + ': ' + param.value + ' Sessions<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: Object.keys(areaData),
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value',
                name: 'Sessions'
            },
            series: areaSessionsSeries
        };

        return { totalOption, totalSessionsOption, areaBytesOption, areaSessionsOption };
    };

    return (
        <div className="flex h-full">
            {/* Struktur-Lasche */}
            <div className={`fixed left-0 top-0 bottom-0 z-10 transition-transform duration-300 ${isStructureOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full w-80 bg-white shadow-lg">
                    <div className="p-4 border-b">
                        <h1 className="text-2xl font-bold text-gray-900">Struktur</h1>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
                        {filteredNodes.length > 0 ? (
                            <DashboardTree 
                                nodes={filteredNodes} 
                                onNodeSelect={setSelectedNode}
                            />
                        ) : (
                            <div className="text-gray-500 text-center">
                                Keine Struktur verfügbar
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hauptinhalt */}
            <div className={`flex-1 transition-all duration-300 ${isStructureOpen ? 'ml-80' : 'ml-0'}`}>
                <div className="p-4">
                    {/* Breadcrumbs */}
                    <div className="mb-4">
                        <Breadcrumbs node={selectedNode} nodes={nodes} />
                    </div>

                    {/* Struktur-Toggle-Button */}
                    <button
                        onClick={() => setIsStructureOpen(!isStructureOpen)}
                        className="fixed left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-r-lg shadow-lg hover:bg-gray-50"
                    >
                        {isStructureOpen ? (
                            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                        ) : (
                            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                        )}
                    </button>

                    {/* Rest des Inhalts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Statistiken</h1>
                            <div className="flex space-x-2">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                    className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="7d">7 Tage</option>
                                    <option value="14d">14 Tage</option>
                                    <option value="30d">30 Tage</option>
                                    <option value="3m">3 Monate</option>
                                    <option value="6m">6 Monate</option>
                                    <option value="1y">1 Jahr</option>
                                </select>
                            </div>
                        </div>
                        {selectedNode ? (
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-4">
                                    Statistiken für {selectedNode.name} und untergeordnete Bereiche
                                </h2>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-96">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : stats.length > 0 ? (
                                    <div className="space-y-8">
                                        <div>
                                            <ReactECharts
                                                option={getChartOptions().totalOption}
                                                style={{ height: '400px' }}
                                            />
                                        </div>
                                        <div>
                                            <ReactECharts
                                                option={getChartOptions().totalSessionsOption}
                                                style={{ height: '400px' }}
                                            />
                                        </div>
                                        <div>
                                            <ReactECharts
                                                option={getChartOptions().areaBytesOption}
                                                style={{ height: '400px' }}
                                            />
                                        </div>
                                        <div>
                                            <ReactECharts
                                                option={getChartOptions().areaSessionsOption}
                                                style={{ height: '400px' }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Keine Statistiken verfügbar</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 mt-8">
                                Bitte wählen Sie einen Knoten aus der Struktur aus
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    try {
        const nodes = await prisma.treeNode.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        // Convert Date objects to ISO strings
        const serializedNodes = nodes.map((node: any) => ({
            ...node,
            createdAt: node.createdAt.toISOString(),
            updatedAt: node.updatedAt.toISOString()
        }));

        return {
            props: {
                nodes: serializedNodes
            }
        };
    } catch (error) {
        console.error('Fehler beim Laden der Tree-Nodes:', error);
        return {
            props: {
                nodes: []
            }
        };
    }
} 