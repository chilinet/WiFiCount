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

interface SessionData {
    username: string;
    client_mac: string;
    client_ip: string;
    ap_ip: string;
    ap_bssid_ssid: string;
    ap_bssid: string;
    ssid: string;
    acctsessionid: string;
    acctstarttime: string;
    last_update: string;
    session_time_seconds: string;
    bytes_rx: number;
    bytes_tx: number;
    bytes_total: number;
}

interface SessionsResponse {
    success: boolean;
    count: number;
    ap_mac: string[];
    ap_mac_count: number;
    data: SessionData[];
}

interface DashboardProps {
    nodes: TreeNode[];
}

type TimeRange = '7d' | '14d' | '30d' | '3m' | '6m' | '1y';
type TabType = 'statistics' | 'sessions';

export default function Dashboard({ nodes }: DashboardProps) {
    const { data: session } = useSession();
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [stats, setStats] = useState<AccessPointStats[]>([]);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [filteredNodes, setFilteredNodes] = useState<TreeNode[]>([]);
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [isStructureOpen, setIsStructureOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('statistics');

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
        const loadTreeData = async () => {
            try {
                const response = await fetch('/api/tree');
                if (response.ok) {
                    const treeData = await response.json();
                    setTree([treeData]); // Tree API returns single root node
                    
                    if (session?.user) {
                        if (session.user.role === 'SUPERADMIN') {
                            // SUPERADMIN sieht die komplette Struktur
                            setFilteredNodes([treeData]);
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

                            setFilteredNodes(findNodeAndChildren([treeData], session.user.nodeId));
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading tree data:', error);
                // Fallback to buildTree if API fails
                const builtTree = buildTree(nodes);
                setTree(builtTree);
                setFilteredNodes(builtTree);
            }
        };

        loadTreeData();
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

    // Sammle alle Access Point MAC-Adressen für den ausgewählten Node und alle untergeordneten Bereiche
    const getAllAccessPointMacs = (node: TreeNode, allDevices: Device[]): string[] => {
        const macs: string[] = [];
        const areaIds = getSubordinateAreaIds(node);
        
        areaIds.forEach(areaId => {
            const areaDevices = allDevices.filter(d => d.areaId === areaId);
            areaDevices.forEach(device => {
                const mac = formatMacAddress(device.macAddress);
                if (!macs.includes(mac)) {
                    macs.push(mac);
                }
            });
        });
        
        return macs;
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

    // Lade Sessions wenn der Sessions-Tab aktiv ist
    useEffect(() => {
        const loadSessions = async () => {
            if (selectedNode && activeTab === 'sessions' && devices.length > 0) {
                setIsLoadingSessions(true);
                try {
                    const apMacs = getAllAccessPointMacs(selectedNode, devices);
                    
                    if (apMacs.length > 0) {
                        const apMacsParam = apMacs.join(',');
                        const response = await fetch(`/api/sessions?ap_mac=${encodeURIComponent(apMacsParam)}`);
                        
                        if (response.ok) {
                            const data: SessionsResponse = await response.json();
                            setSessions(data.data || []);
                        } else {
                            console.error('Fehler beim Laden der Sessions');
                            setSessions([]);
                        }
                    } else {
                        setSessions([]);
                    }
                } catch (error) {
                    console.error('Fehler beim Laden der Sessions:', error);
                    setSessions([]);
                } finally {
                    setIsLoadingSessions(false);
                }
            } else {
                setSessions([]);
            }
        };

        loadSessions();
    }, [selectedNode, activeTab, devices]);

    // Formatierung für Session-Zeit
    const formatSessionTime = (seconds: string): string => {
        const totalSeconds = parseInt(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Formatierung für Bytes
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getChartOptions = () => {
        // Erstelle eine kontinuierliche Zeitachse für den gesamten Zeitraum
        const { from: fromDate, to: toDate } = getDateRange(timeRange);
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        
        // Erstelle ein Array mit allen Tagen im Zeitraum
        const allDates: string[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            allDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Erstelle die aufsummierten Serien mit allen Tagen
        const totalSeries = [{
            name: 'Gesamt',
            type: 'bar',
            data: allDates.map(date => {
                return stats
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + Math.round(parseInt(stat.total_bytes) / (1024 * 1024)), 0);
            })
        }];

        const totalSessionsSeries = [{
            name: 'Gesamt',
            type: 'bar',
            data: allDates.map(date => {
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

        // Erstelle die Serien für jeden Bereich mit allen Tagen
        const areaBytesSeries = Object.entries(areaData).map(([areaName, data]) => ({
            name: areaName,
            type: 'bar',
            data: allDates.map(date => {
                return data
                    .filter(stat => stat.datum === date)
                    .reduce((sum, stat) => sum + Math.round(parseInt(stat.total_bytes) / (1024 * 1024)), 0);
            })
        }));

        const areaSessionsSeries = Object.entries(areaData).map(([areaName, data]) => ({
            name: areaName,
            type: 'bar',
            data: allDates.map(date => {
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
                data: allDates
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
                data: allDates
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
                data: allDates
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
                data: allDates
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
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            {activeTab === 'statistics' && (
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
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('statistics')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'statistics'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Statistiken
                                </button>
                                <button
                                    onClick={() => setActiveTab('sessions')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'sessions'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Sessions
                                </button>
                            </nav>
                        </div>

                        {selectedNode ? (
                            <div className="mt-6">
                                {activeTab === 'statistics' ? (
                                    <>
                                        <h2 className="text-lg font-semibold mb-4">
                                            Statistiken für {selectedNode.name} und untergeordnete Bereiche
                                        </h2>
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-96">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : stats.length > 0 ? (
                                            <div className="space-y-8">
                                                <div className="w-full">
                                                    <ReactECharts
                                                        option={getChartOptions().totalOption}
                                                        style={{ height: '400px', width: '100%' }}
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <ReactECharts
                                                        option={getChartOptions().totalSessionsOption}
                                                        style={{ height: '400px', width: '100%' }}
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <ReactECharts
                                                        option={getChartOptions().areaBytesOption}
                                                        style={{ height: '400px', width: '100%' }}
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <ReactECharts
                                                        option={getChartOptions().areaSessionsOption}
                                                        style={{ height: '400px', width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Keine Statistiken verfügbar</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold mb-4">
                                            Aktive Sessions für {selectedNode.name} und untergeordnete Bereiche
                                        </h2>
                                        {isLoadingSessions ? (
                                            <div className="flex justify-center items-center h-96">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : sessions.length > 0 ? (
                                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Username
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Client MAC
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Client IP
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Access Point
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    SSID
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Session Zeit
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Daten (RX/TX)
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Startzeit
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Letzte Aktualisierung
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {sessions.map((session, index) => (
                                                                <tr key={session.acctsessionid || index} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {session.username}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                                        {session.client_mac}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {session.client_ip}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                                        {session.ap_bssid}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {session.ssid}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {formatSessionTime(session.session_time_seconds)}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-green-600">↓ {formatBytes(session.bytes_rx)}</span>
                                                                            <span className="text-blue-600">↑ {formatBytes(session.bytes_tx)}</span>
                                                                            <span className="text-gray-600 font-semibold">Σ {formatBytes(session.bytes_total)}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(session.acctstarttime).toLocaleString('de-DE')}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(session.last_update).toLocaleString('de-DE')}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        Gesamt: <span className="font-semibold">{sessions.length}</span> aktive Session{sessions.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Keine aktiven Sessions verfügbar</p>
                                        )}
                                    </>
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