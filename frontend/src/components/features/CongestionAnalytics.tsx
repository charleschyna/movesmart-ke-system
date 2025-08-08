import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import {
  ClockIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  CubeTransparentIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { KENYA_CITIES, CITY_ROADS } from '../../constants';
import apiService from '../../services/api';

interface CongestionDataPoint {
  time: string;
  congestion: number;
  speed: number;
  incidents: number;
}

type ChartType = 'line' | 'bar' | 'area' | 'pie';
type TimeRange = '24h' | '7d' | '30d';
type MetricType = 'congestion' | 'speed' | 'incidents' | 'all';

const CongestionAnalytics: React.FC = () => {
  // Primary (A) selection state
  const [data, setData] = useState<CongestionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState(KENYA_CITIES[0]);
  const [selectedRoadId, setSelectedRoadId] = useState<string>('all');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all');

  // Comparison (B) selection state
  const [compareEnabled, setCompareEnabled] = useState<boolean>(false);
  const [selectedCityB, setSelectedCityB] = useState(KENYA_CITIES[1] || KENYA_CITIES[0]);
  const [selectedRoadIdB, setSelectedRoadIdB] = useState<string>('all');
  const [dataB, setDataB] = useState<CongestionDataPoint[]>([]);
  const [lastUpdateB, setLastUpdateB] = useState<Date>(new Date());
  const [loadingB, setLoadingB] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<'same' | 'small'>('small');

  // Live KPI snapshot from summary endpoint (used for top cards)
  const [kpi, setKpi] = useState({ avgCongestion: 0, avgSpeed: 0, totalIncidents: 0 });

  // Determine max points to retain based on timeRange (approx 15-min buckets)
  const maxPointsByRange: Record<TimeRange, number> = {
    '24h': 96,   // 4 per hour
    '7d': 672,   // 96 * 7
    '30d': 2880, // 96 * 30
  };

  // Initialize empty data array - will be populated from API
  const initializeEmptyData = (): CongestionDataPoint[] => {
    return [];
  };

  // Transform trends API payload into CongestionDataPoint[]
  const transformTrends = (raw: any, range: TimeRange): CongestionDataPoint[] => {
    if (!raw) return [];
    const arr: any[] = Array.isArray(raw) ? raw : (raw.points || raw.data || []);
    const formatLabel = (dt: Date) => {
      if (range === '24h') return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      if (range === '7d') return dt.toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit' });
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return arr.map((it) => {
      // Try to extract a timestamp
      const ts = it.timestamp || it.time || it.datetime || it.date || it.hour;
      const dt = ts ? new Date(ts) : new Date();
      const label = typeof ts === 'string' || typeof ts === 'number' ? formatLabel(dt) : (it.label || formatLabel(dt));
      // Try to extract metrics with common names
      const congestion = Number(
        it.congestion ?? it.congestionLevel ?? it.value ?? it.avgCongestion ?? 0
      );
      const speed = Number(
        it.speed ?? it.avgSpeed ?? (congestion ? Math.round(60 - congestion * 0.4) : 0)
      );
      const incidents = Number(it.incidents ?? it.incidentCount ?? 0);
      return { time: label, congestion, speed, incidents } as CongestionDataPoint;
    });
  };

  // Fetch historical trends for a selection when road is 'all' (city aggregate)
  const fetchTrends = async () => {
    try {
      if (selectedRoadId !== 'all') {
        // For specific road, no historical API available; rely on live polling
        setData([]);
        return;
      }
      const resp = await apiService.getCongestionTrends(selectedCity.id, timeRange);
      if (resp?.success && resp.data) {
        const series = transformTrends(resp.data, timeRange);
        const capped = series.slice(-maxPointsByRange[timeRange]);
        setData(capped);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.warn('Failed to fetch congestion trends, falling back to snapshots:', (e as any)?.message || e);
      // Fallback to empty, realtime appends will fill
      setData([]);
    }
  };

  // Fetch a single snapshot and append to series (realtime)
  // Live snapshot fetcher for selection A (city or specific road)
  const fetchLiveA = async () => {
    try {
      const now = new Date();
      let newDataPoint: CongestionDataPoint | null = null;
      if (selectedRoadId === 'all') {
        const response = await apiService.getTrafficData(selectedCity.id);
        if (response.success && response.data) {
          newDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            congestion: response.data.congestionLevel || 0,
            speed: Math.round(60 - (response.data.congestionLevel * 0.4)) || 50,
            incidents: response.data.liveIncidents || 0
          };
        }
      } else {
        const res = await apiService.getRoadMetrics(selectedCity.id, selectedRoadId);
        if (res?.success && res.data) {
          newDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            congestion: Number(res.data.congestion ?? res.data.congestionLevel ?? 0),
            speed: Number(res.data.avgSpeed ?? res.data.speed ?? 0),
            incidents: Number(res.data.incidents ?? res.data.liveIncidents ?? 0),
          };
        }
      }

      if (newDataPoint) {
        setData(prevData => {
          const updatedData = [...prevData, newDataPoint as CongestionDataPoint];
          return updatedData.slice(-maxPointsByRange[timeRange]);
        });
        // Update KPI snapshot from latest point
        setKpi({
          avgCongestion: newDataPoint.congestion,
          avgSpeed: newDataPoint.speed,
          totalIncidents: newDataPoint.incidents,
        });
        setLastUpdate(now);
      }
    } catch (error) {
      console.error('Failed to fetch live data (A):', error);
    }
  };

  // Live snapshot fetcher for selection B (only when compare enabled)
  const fetchLiveB = async () => {
    if (!compareEnabled) return;
    try {
      const now = new Date();
      let newDataPoint: CongestionDataPoint | null = null;
      if (selectedRoadIdB === 'all') {
        const response = await apiService.getTrafficData(selectedCityB.id);
        if (response.success && response.data) {
          newDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            congestion: response.data.congestionLevel || 0,
            speed: Math.round(60 - (response.data.congestionLevel * 0.4)) || 50,
            incidents: response.data.liveIncidents || 0
          };
        }
      } else {
        const res = await apiService.getRoadMetrics(selectedCityB.id, selectedRoadIdB);
        if (res?.success && res.data) {
          newDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            congestion: Number(res.data.congestion ?? res.data.congestionLevel ?? 0),
            speed: Number(res.data.avgSpeed ?? res.data.speed ?? 0),
            incidents: Number(res.data.incidents ?? res.data.liveIncidents ?? 0),
          };
        }
      }

      if (newDataPoint) {
        setDataB(prevData => {
          const updatedData = [...prevData, newDataPoint as CongestionDataPoint];
          return updatedData.slice(-maxPointsByRange[timeRange]);
        });
        setLastUpdateB(now);
      }
    } catch (error) {
      console.error('Failed to fetch live data (B):', error);
    }
  };

  // Effects: initialize and poll for A and B
  useEffect(() => {
    setLoading(true);
    // Historical trends only for city aggregate
    fetchTrends().finally(() => setLoading(false));
    // Start realtime appends every 30s
    fetchLiveA();
    const intervalA = setInterval(fetchLiveA, 30000);
    return () => clearInterval(intervalA);
  }, [selectedCity.id, selectedRoadId, timeRange]);

  useEffect(() => {
    if (!compareEnabled) return;
    setLoadingB(true);
    // No historical fetch for B; we build forward using live
    setDataB([]);
    fetchLiveB().finally(() => setLoadingB(false));
    const intervalB = setInterval(fetchLiveB, 30000);
    return () => clearInterval(intervalB);
  }, [compareEnabled, selectedCityB.id, selectedRoadIdB, timeRange]);

  // History-based stats for insights (from analytics series)
  const avgCongestionHistorical = data.length > 0 ? data.reduce((sum, point) => sum + point.congestion, 0) / data.length : 0;
  const avgSpeedHistorical = data.length > 0 ? data.reduce((sum, point) => sum + point.speed, 0) / data.length : 0;
  const peakCongestion = data.length > 0 ? Math.max(...data.map(d => d.congestion)) : 0;
  const minSpeed = data.length > 0 ? Math.min(...data.map(d => d.speed)) : 0;
  const currentIncidents = data.length > 0 ? data[data.length - 1].incidents : kpi.totalIncidents;

  // Choose KPI display: prefer history for selected range if available
  const hasSeries = data.length > 0;
  const displayKPI = hasSeries
    ? {
        avgCongestion: avgCongestionHistorical,
        avgSpeed: avgSpeedHistorical,
        totalIncidents: currentIncidents,
      }
    : kpi;
  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar': return ChartBarIcon;
      case 'line': return ArrowTrendingUpIcon;
      case 'area': return CubeTransparentIcon;
      case 'pie': return ChartPieIcon;
    }
  };

  const getRoadName = (cityId: string, roadId: string) => {
    const list = (CITY_ROADS[cityId as keyof typeof CITY_ROADS] as any[]) || [];
    const it = list.find(r => r.id === roadId);
    return it?.name || 'All Roads';
  };

  const selectionLabelA = `${selectedCity.name} - ${getRoadName(selectedCity.id, selectedRoadId)}`;
  const selectionLabelB = `${selectedCityB.name} - ${getRoadName(selectedCityB.id, selectedRoadIdB)}`;

  // Simple analytics helpers for dynamic insights
  const safeNumber = (n: any, fallback = 0) => (Number.isFinite(Number(n)) ? Number(n) : fallback);
  const lastN = <T,>(arr: T[], n: number): T[] => arr.slice(Math.max(0, arr.length - n));
  const avg = (nums: number[]) => (nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0);
  const stdDev = (nums: number[]) => {
    if (!nums.length) return 0;
    const m = avg(nums);
    const v = avg(nums.map(x => (x - m) * (x - m)));
    return Math.sqrt(v);
  };
  const slope = (ys: number[]) => {
    const n = ys.length;
    if (n < 2) return 0;
    const xs = Array.from({ length: n }, (_, i) => i + 1);
    const xMean = avg(xs);
    const yMean = avg(ys);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - xMean) * (ys[i] - yMean);
      den += (xs[i] - xMean) * (xs[i] - xMean);
    }
    return den ? num / den : 0;
  };
  const pearson = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    if (n < 2) return 0;
    const aa = a.slice(-n), bb = b.slice(-n);
    const ma = avg(aa), mb = avg(bb);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) {
      const va = aa[i] - ma, vb = bb[i] - mb;
      num += va * vb; da += va * va; db += vb * vb;
    }
    const den = Math.sqrt(da * db);
    return den ? num / den : 0;
  };

  const insights = React.useMemo(() => {
    const series = data;
    if (!series || !series.length) {
      return {
        rushHourText: 'Insufficient data to determine rush hour right now.',
        speedText: 'Awaiting live samples to assess speeds.',
        incidentText: 'No live incident information available yet.',
        recs: ['Keep monitoring for updates.']
      };
    }
    const latest = series[series.length - 1];
    const congestionArr = series.map(p => safeNumber(p.congestion));
    const speedArr = series.map(p => safeNumber(p.speed));
    const incidentArr = series.map(p => safeNumber(p.incidents));
    const timeArr = series.map(p => p.time);

    const recentWindow = Math.min(24, series.length);
    const recentCong = lastN(congestionArr, recentWindow);
    const recentSpeed = lastN(speedArr, recentWindow);

    const congSlope = slope(recentCong);
    const speedSlope = slope(recentSpeed);
    const congVol = stdDev(recentCong);
    const speedVol = stdDev(recentSpeed);

    const maxCong = Math.max(...congestionArr);
    const maxIdx = congestionArr.indexOf(maxCong);
    const peakTime = maxIdx >= 0 ? timeArr[maxIdx] : '—';

    const corrIncidents = pearson(congestionArr, incidentArr);

    const rushHourText = `Peak congestion observed around ${peakTime} with ${Math.round(maxCong)}%. ${congSlope > 0 ? 'Trend is rising' : congSlope < 0 ? 'Trend is easing' : 'Trend is steady'} over the last ${recentWindow} samples (volatility ±${Math.round(congVol)}).`;
    const speedText = `Current avg speed ~${Math.round(latest.speed)} km/h. ${speedSlope < 0 ? 'Speeds decreasing' : speedSlope > 0 ? 'Speeds improving' : 'Speeds steady'} recently (variability ±${Math.round(speedVol)}).`;
    const incidentText = `Active incidents: ${safeNumber(latest.incidents)}. ${Math.abs(corrIncidents) >= 0.4 ? `Incidents ${corrIncidents > 0 ? 'positively' : 'negatively'} correlate with congestion` : 'Weak correlation with congestion'} in this window.`;

    const recs: string[] = [];
    if (latest.congestion >= 70) recs.push('Delay departure or choose alternative routes immediately.');
    if (latest.speed <= 25) recs.push('Expect significant delays; consider non-road options if available.');
    if (latest.incidents > 0) recs.push('Avoid affected corridors; incidents are impacting flow.');
    if (!recs.length) recs.push('Conditions are manageable; maintain usual routes and speeds.');

    return { rushHourText, speedText, incidentText, recs };
  }, [data, selectedCity.id, selectedRoadId, timeRange]);

  // Build aligned dataset for same-chart comparison by time label
  const buildAlignedForSameChart = () => {
    const mapA = new Map<string, CongestionDataPoint>();
    data.forEach(p => mapA.set(p.time, p));
    const keys = new Set<string>([...data.map(d => d.time), ...dataB.map(d => d.time)]);
    const rows = Array.from(keys).sort();
    return rows.map(t => {
      const a = mapA.get(t);
      const b = dataB.find(p => p.time === t);
      return {
        time: t,
        a_congestion: a?.congestion ?? null,
        a_speed: a?.speed ?? null,
        a_incidents: a?.incidents ?? null,
        b_congestion: b?.congestion ?? null,
        b_speed: b?.speed ?? null,
        b_incidents: b?.incidents ?? null,
      } as any;
    });
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'congestion' ? '%' : entry.dataKey === 'speed' ? ' km/h' : ''}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case 'line':
        if (compareEnabled && compareMode === 'same') {
          const aligned = buildAlignedForSameChart();
          return (
            <LineChart data={aligned} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
                <>
                  <Line type="monotone" dataKey="a_congestion" name="A Congestion" stroke="#ef4444" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="b_congestion" name="B Congestion" stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2} dot={false} />
                </>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'speed') && (
                <>
                  <Line type="monotone" dataKey="a_speed" name="A Speed" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="b_speed" name="B Speed" stroke="#3b82f6" strokeDasharray="5 3" strokeWidth={2} dot={false} />
                </>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
                <>
                  <Line type="monotone" dataKey="a_incidents" name="A Incidents" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="b_incidents" name="B Incidents" stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={2} dot={false} />
                </>
              )}
            </LineChart>
          );
        }
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Line 
                type="monotone" 
                dataKey="congestion" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Line 
                type="monotone" 
                dataKey="incidents" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Bar dataKey="congestion" fill="#ef4444" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Bar dataKey="speed" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Bar dataKey="incidents" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            )}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.6}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'speed') && (
              <Area 
                type="monotone" 
                dataKey="speed" 
                stackId="2"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
              <Area 
                type="monotone" 
                dataKey="incidents" 
                stackId="3"
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        );
      case 'pie':
        const pieData = [
          { name: 'High Congestion', value: data.filter(d => d.congestion > 70).length, fill: '#ef4444' },
          { name: 'Medium Congestion', value: data.filter(d => d.congestion > 30 && d.congestion <= 70).length, fill: '#f59e0b' },
          { name: 'Low Congestion', value: data.filter(d => d.congestion <= 30).length, fill: '#22c55e' }
        ];
        return (
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Congestion Analytics</h1>
                <p className="text-gray-600">Real-time traffic congestion trends and insights</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              {/* City Selector */}
              <div className="relative">
                <select
                  value={selectedCity.id}
                  onChange={(e) => {
                    const city = KENYA_CITIES.find(c => c.id === e.target.value) || KENYA_CITIES[0];
                    setSelectedCity(city);
                    setSelectedRoadId('all');
                  }}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {KENYA_CITIES.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Road Selector */}
              <div className="relative">
                <select
                  value={selectedRoadId}
                  onChange={(e) => setSelectedRoadId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {(CITY_ROADS[selectedCity.id as keyof typeof CITY_ROADS] || []).map((road: any) => (
                    <option key={road.id} value={road.id}>{road.name}</option>
                  ))}
                </select>
              </div>

              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              {/* Metric Selector */}
              <div className="relative">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Metrics</option>
                  <option value="congestion">Congestion Only</option>
                  <option value="speed">Speed Only</option>
                  <option value="incidents">Incidents Only</option>
                </select>
              </div>

              {/* Compare Toggle */}
              <div className="flex items-center space-x-2">
                <input id="compareToggle" type="checkbox" className="h-4 w-4 text-red-600" checked={compareEnabled} onChange={(e) => setCompareEnabled(e.target.checked)} />
                <label htmlFor="compareToggle" className="text-sm text-gray-700">Compare</label>
              </div>

              {compareEnabled && (
                <div className="relative">
                  <select
                    value={compareMode}
                    onChange={(e) => setCompareMode(e.target.value as 'same' | 'small')}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="same">Same Chart</option>
                    <option value="small">Small Multiples</option>
                  </select>
                </div>
              )}

              {/* Live Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Live Data</span>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Congestion</p>
                <p className="text-2xl font-bold text-gray-900">{displayKPI.avgCongestion.toFixed(0)}%</p>
              </div>
              <ArrowTrendingUpIcon className={`w-8 h-8 ${displayKPI.avgCongestion > 50 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900">{displayKPI.avgSpeed.toFixed(0)} km/h</p>
              </div>
              <SparklesIcon className={`w-8 h-8 ${displayKPI.avgSpeed > 35 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Congestion</p>
                <p className="text-2xl font-bold text-gray-900">{peakCongestion.toFixed(0)}%</p>
              </div>
              <ExclamationTriangleIcon className={`w-8 h-8 ${peakCongestion > 70 ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{displayKPI.totalIncidents}</p>
              </div>
              <MapIcon className={`w-8 h-8 ${displayKPI.totalIncidents > 10 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* Chart Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                {selectedCity.name} {selectedRoadId !== 'all' ? `- ${(CITY_ROADS[selectedCity.id as keyof typeof CITY_ROADS] || []).find((r: any) => r.id === selectedRoadId)?.name || ''}` : 'Traffic Trends'} - {timeRange.toUpperCase()}
              </h2>
              
              <div className="flex items-center space-x-2">
                {(['line', 'bar', 'area', 'pie'] as ChartType[]).map((type) => {
                  const IconComponent = getChartIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        chartType === type
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading congestion data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </div>

                {compareEnabled && compareMode === 'small' && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900">Comparison</h3>
                      <div className="flex flex-wrap items-center space-x-4">
                        {/* City B Selector */}
                        <div className="relative">
                          <select
                            value={selectedCityB.id}
                            onChange={(e) => {
                              const city = KENYA_CITIES.find(c => c.id === e.target.value) || KENYA_CITIES[0];
                              setSelectedCityB(city);
                              setSelectedRoadIdB('all');
                            }}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            {KENYA_CITIES.map(city => (
                              <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Road B Selector */}
                        <div className="relative">
                          <select
                            value={selectedRoadIdB}
                            onChange={(e) => setSelectedRoadIdB(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            {(CITY_ROADS[selectedCityB.id as keyof typeof CITY_ROADS] || []).map((road: any) => (
                              <option key={road.id} value={road.id}>{road.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Secondary chart (small multiple) */}
                    <div className="h-80">
                      {loadingB ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          {/* Reuse chart renderer by temporarily swapping data */}
                          {(() => {
                            const original = data;
                            // Temporarily render with dataB
                            const temp = dataB;
                            return (
                              <LineChart data={temp} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
                                  <Line type="monotone" dataKey="congestion" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                )}
                                {(selectedMetric === 'all' || selectedMetric === 'speed') && (
                                  <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                )}
                                {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
                                  <Line type="monotone" dataKey="incidents" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                )}
                              </LineChart>
                            );
                          })()}
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-4">
              {(selectedMetric === 'all' || selectedMetric === 'congestion') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Congestion %</span>
                </div>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'speed') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Speed km/h</span>
                </div>
              )}
              {(selectedMetric === 'all' || selectedMetric === 'incidents') && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600">Incidents</span>
                </div>
              )}
            </div>
            {compareEnabled && compareMode === 'same' && (
              <div className="mt-3 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div style={{ width: 28, borderTop: '3px solid #4b5563' }} />
                  <span className="text-sm text-gray-700">A: {selectionLabelA}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div style={{ width: 28, borderTop: '3px dashed #4b5563' }} />
                  <span className="text-sm text-gray-700">B: {selectionLabelB}</span>
                </div>
              </div>
            )}
            {selectedRoadId !== 'all' && (
              <div className="mt-2 text-center text-xs text-gray-500">
                Live per-road overlay using real-time metrics. Historical backfill is unavailable; the series builds forward from now.
              </div>
            )}
          </motion.div>

          {/* Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Insights</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Rush Hour Analysis (Live)</h4>
                <p className="text-sm text-red-700">{insights.rushHourText}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Speed Analysis (Live)</h4>
                <p className="text-sm text-blue-700">{insights.speedText}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Incident Pattern (Live)</h4>
                <p className="text-sm text-yellow-700">{insights.incidentText}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">AI Recommendations</h4>
                <div className="text-sm text-green-700 space-y-1">
                  {insights.recs.map((r, i) => <p key={i}>• {r}</p>)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Congestion Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Low Congestion (0-30%)</h4>
              <p className="text-2xl font-bold text-green-700">
                {data.filter(d => d.congestion <= 30).length}
              </p>
              <p className="text-sm text-green-600">time periods</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Medium Congestion (31-70%)</h4>
              <p className="text-2xl font-bold text-yellow-700">
                {data.filter(d => d.congestion > 30 && d.congestion <= 70).length}
              </p>
              <p className="text-sm text-yellow-600">time periods</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">High Congestion (71-100%)</h4>
              <p className="text-2xl font-bold text-red-700">
                {data.filter(d => d.congestion > 70).length}
              </p>
              <p className="text-sm text-red-600">time periods</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CongestionAnalytics;

