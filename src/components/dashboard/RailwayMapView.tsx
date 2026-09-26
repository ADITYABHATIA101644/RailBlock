import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MapPin, Layers, Train as TrainIcon, RotateCw, Database } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Station {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  zone: string;
  division: string;
  type: string;
  isJunction: boolean;
}

interface RailwayZone {
  code: string;
  name: string;
  color: string;
}

interface Corridor {
  id: string;
  name: string;
  type: string;
  points: [number, number][];
}

interface TrainData {
  id: string;
  name: string;
  number: string;
  corridorId: string;
  progress: number;
  status: string;
  speed: number;
  delay: number;
  pos: [number, number];
}

// ─── ZONES ───
const railwayZones: RailwayZone[] = [
  { code: 'NR', name: 'Northern Railway', color: '#3B82F6' },
  { code: 'NCR', name: 'North Central Railway', color: '#10B981' },
  { code: 'NER', name: 'North Eastern Railway', color: '#F59E0B' },
  { code: 'NFR', name: 'Northeast Frontier Railway', color: '#EC4899' },
  { code: 'ER', name: 'Eastern Railway', color: '#8B5CF6' },
  { code: 'ECR', name: 'East Central Railway', color: '#06B6D4' },
  { code: 'SCR', name: 'South Central Railway', color: '#EF4444' },
  { code: 'SR', name: 'Southern Railway', color: '#F97316' },
  { code: 'SWR', name: 'South Western Railway', color: '#84CC16' },
  { code: 'SECR', name: 'South East Central Railway', color: '#14B8A6' },
  { code: 'WCR', name: 'West Central Railway', color: '#A855F7' },
  { code: 'CR', name: 'Central Railway', color: '#2563EB' },
  { code: 'WR', name: 'Western Railway', color: '#059669' },
  { code: 'NWR', name: 'North Western Railway', color: '#DC2626' },
];

// ─── STATIONS (real GPS) ───
const majorStations: Station[] = [
  { id: 'NDLS', name: 'New Delhi', code: 'NDLS', lat: 28.6412, lng: 77.2189, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: true },
  { id: 'ASR', name: 'Amritsar', code: 'ASR', lat: 31.634, lng: 74.8723, zone: 'NR', division: 'Firozpur', type: 'Terminal', isJunction: true },
  { id: 'LDH', name: 'Ludhiana', code: 'LDH', lat: 30.901, lng: 75.8573, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'CDG', name: 'Chandigarh', code: 'CDG', lat: 30.7333, lng: 76.7794, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'UMB', name: 'Ambala Cantt', code: 'UMB', lat: 30.3272, lng: 76.8179, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'BTI', name: 'Bathinda', code: 'BTI', lat: 30.207, lng: 74.9521, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'LKO', name: 'Lucknow', code: 'LKO', lat: 26.8467, lng: 80.9462, zone: 'NR', division: 'Lucknow', type: 'Terminal', isJunction: true },
  { id: 'CNB', name: 'Kanpur Central', code: 'CNB', lat: 26.4499, lng: 80.3319, zone: 'NER', division: 'Kanpur', type: 'Junction', isJunction: true },
  { id: 'JP', name: 'Jaipur', code: 'JP', lat: 26.9124, lng: 75.7873, zone: 'NWR', division: 'Jaipur', type: 'Junction', isJunction: true },
  { id: 'JU', name: 'Jodhpur', code: 'JU', lat: 26.2389, lng: 73.0243, zone: 'NWR', division: 'Jodhpur', type: 'Junction', isJunction: true },
  { id: 'BKN', name: 'Bikaner', code: 'BKN', lat: 28.0229, lng: 73.322, zone: 'NWR', division: 'Bikaner', type: 'Junction', isJunction: true },
  { id: 'AII', name: 'Ajmer', code: 'AII', lat: 26.4499, lng: 74.6399, zone: 'NWR', division: 'Ajmer', type: 'Junction', isJunction: true },
  { id: 'ADI', name: 'Ahmedabad', code: 'ADI', lat: 23.0225, lng: 72.5714, zone: 'WR', division: 'Ahmedabad', type: 'Junction', isJunction: true },
  { id: 'BRC', name: 'Vadodara', code: 'BRC', lat: 22.3072, lng: 73.1812, zone: 'WR', division: 'Vadodara', type: 'Junction', isJunction: true },
  { id: 'ST', name: 'Surat', code: 'ST', lat: 21.1702, lng: 72.8311, zone: 'WR', division: 'Mumbai', type: 'Junction', isJunction: true },
  { id: 'RTM', name: 'Ratlam', code: 'RTM', lat: 23.3343, lng: 75.0373, zone: 'WR', division: 'Ratlam', type: 'Junction', isJunction: true },
  { id: 'BCT', name: 'Mumbai Central', code: 'BCT', lat: 19.0596, lng: 72.8295, zone: 'WR', division: 'Mumbai', type: 'Terminal', isJunction: true },
  { id: 'CSTM', name: 'CST Mumbai', code: 'CSTM', lat: 18.9398, lng: 72.8355, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },
  { id: 'MTJ', name: 'Mathura', code: 'MTJ', lat: 27.4924, lng: 77.6737, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'AGC', name: 'Agra Cantt', code: 'AGC', lat: 27.1767, lng: 78.0081, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'JHS', name: 'Jhansi', code: 'JHS', lat: 25.4484, lng: 78.5685, zone: 'NCR', division: 'Jhansi', type: 'Junction', isJunction: true },
  { id: 'ALY', name: 'Prayagraj', code: 'ALY', lat: 25.4358, lng: 81.8463, zone: 'NCR', division: 'Prayagraj', type: 'Junction', isJunction: true },
  { id: 'MGS', name: 'Pt. DD Upadhyaya', code: 'MGS', lat: 25.2817, lng: 83.1161, zone: 'NCR', division: 'Pt. DD Upadhyaya', type: 'Junction', isJunction: true },
  { id: 'BPL', name: 'Bhopal', code: 'BPL', lat: 23.2599, lng: 77.4126, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'ET', name: 'Itarsi', code: 'ET', lat: 22.6145, lng: 77.7563, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'NGP', name: 'Nagpur', code: 'NGP', lat: 21.1458, lng: 79.0882, zone: 'CR', division: 'Nagpur', type: 'Junction', isJunction: true },
  { id: 'BSL', name: 'Bhusaval', code: 'BSL', lat: 21.0434, lng: 75.7849, zone: 'CR', division: 'Bhusaval', type: 'Junction', isJunction: true },
  { id: 'JBP', name: 'Jabalpur', code: 'JBP', lat: 23.1815, lng: 79.9864, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'PUNE', name: 'Pune', code: 'PUNE', lat: 18.5204, lng: 73.8567, zone: 'CR', division: 'Pune', type: 'Junction', isJunction: true },
  { id: 'SC', name: 'Secunderabad', code: 'SC', lat: 17.4399, lng: 78.5016, zone: 'SCR', division: 'Secunderabad', type: 'Terminal', isJunction: true },
  { id: 'BZA', name: 'Vijayawada', code: 'BZA', lat: 16.5062, lng: 80.648, zone: 'SCR', division: 'Vijayawada', type: 'Junction', isJunction: true },
  { id: 'NED', name: 'Nanded', code: 'NED', lat: 19.1587, lng: 77.3178, zone: 'SCR', division: 'Nanded', type: 'Junction', isJunction: true },
  { id: 'MAS', name: 'Chennai Central', code: 'MAS', lat: 13.0827, lng: 80.2707, zone: 'SR', division: 'Chennai', type: 'Terminal', isJunction: true },
  { id: 'SBC', name: 'Bengaluru', code: 'SBC', lat: 12.9784, lng: 77.5733, zone: 'SWR', division: 'Bangalore', type: 'Terminal', isJunction: true },
  { id: 'KPD', name: 'Katpadi', code: 'KPD', lat: 12.9933, lng: 79.1422, zone: 'SR', division: 'Chennai', type: 'Junction', isJunction: true },
  { id: 'ED', name: 'Erode', code: 'ED', lat: 11.341, lng: 77.7172, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'CBE', name: 'Coimbatore', code: 'CBE', lat: 11.0054, lng: 76.9718, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'MDU', name: 'Madurai', code: 'MDU', lat: 9.9252, lng: 78.1198, zone: 'SR', division: 'Madurai', type: 'Junction', isJunction: true },
  { id: 'TVC', name: 'Trivandrum', code: 'TVC', lat: 8.5241, lng: 76.9366, zone: 'SR', division: 'Trivandrum', type: 'Terminal', isJunction: true },
  { id: 'CAPE', name: 'Kanyakumari', code: 'CAPE', lat: 8.0883, lng: 77.5385, zone: 'SR', division: 'Madurai', type: 'Terminal', isJunction: false },
  { id: 'HWH', name: 'Howrah', code: 'HWH', lat: 22.5803, lng: 88.3467, zone: 'ER', division: 'Howrah', type: 'Terminal', isJunction: true },
  { id: 'KOAA', name: 'Kolkata', code: 'KOAA', lat: 22.5726, lng: 88.3639, zone: 'ER', division: 'Howrah', type: 'Terminal', isJunction: false },
  { id: 'BBS', name: 'Bhubaneswar', code: 'BBS', lat: 20.2961, lng: 85.8245, zone: 'ECR', division: 'Khurda Road', type: 'Junction', isJunction: true },
  { id: 'VSKP', name: 'Visakhapatnam', code: 'VSKP', lat: 17.6868, lng: 83.2185, zone: 'ECR', division: 'Waltair', type: 'Junction', isJunction: true },
  { id: 'BSP', name: 'Bilaspur', code: 'BSP', lat: 21.9091, lng: 82.3166, zone: 'SECR', division: 'Bilaspur', type: 'Junction', isJunction: true },
  { id: 'R', name: 'Raipur', code: 'R', lat: 21.2514, lng: 81.6296, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'TATA', name: 'Tatanagar', code: 'TATA', lat: 22.7788, lng: 86.2029, zone: 'ECR', division: 'Chakradharpur', type: 'Junction', isJunction: true },
  { id: 'PPTA', name: 'Patna', code: 'PPTA', lat: 25.6093, lng: 85.1376, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'GAYA', name: 'Gaya', code: 'GAYA', lat: 24.7963, lng: 85.0063, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'GKP', name: 'Gorakhpur', code: 'GKP', lat: 26.7606, lng: 83.3732, zone: 'NER', division: 'Gorakhpur', type: 'Junction', isJunction: true },
  { id: 'GHY', name: 'Guwahati', code: 'GHY', lat: 26.1445, lng: 91.7362, zone: 'NFR', division: 'Guwahati', type: 'Terminal', isJunction: true },
  { id: 'NJP', name: 'New Jalpaiguri', code: 'NJP', lat: 26.7006, lng: 88.4354, zone: 'NFR', division: 'Katihar', type: 'Junction', isJunction: true },
];

// ─── CORRIDORS ───
const corridors: Corridor[] = [
  {
    id: 'gt-express', name: 'GT Express Route', type: 'Golden',
    points: [[28.6412, 77.2189], [27.4924, 77.6737], [27.1767, 78.0081], [25.4484, 78.5685], [23.2599, 77.4126], [22.6145, 77.7563], [21.1458, 79.0882], [19.1587, 77.3178], [17.4399, 78.5016], [16.5062, 80.648], [13.0827, 80.2707]],
  },
  {
    id: 'delhi-howrah', name: 'Delhi-Howrah Rajdhani', type: 'Golden',
    points: [[28.6412, 77.2189], [27.4924, 77.6737], [26.4499, 80.3319], [25.4358, 81.8463], [25.2817, 83.1161], [24.7963, 85.0063], [22.5803, 88.3467]],
  },
  {
    id: 'mumbai-delhi', name: 'Mumbai-Delhi Rajdhani', type: 'Golden',
    points: [[19.0596, 72.8295], [21.1702, 72.8311], [22.3072, 73.1812], [23.3343, 75.0373], [25.4484, 78.5685], [27.1767, 78.0081], [28.6412, 77.2189]],
  },
  {
    id: 'howrah-chennai', name: 'Howrah-Chennai Corridor', type: 'High',
    points: [[22.5803, 88.3467], [22.7788, 86.2029], [20.4625, 85.883], [20.2961, 85.8245], [17.6868, 83.2185], [16.5062, 80.648], [13.0827, 80.2707]],
  },
  {
    id: 'delhi-amritsar', name: 'Delhi-Amritsar Mail', type: 'High',
    points: [[28.6412, 77.2189], [30.3272, 76.8179], [30.7333, 76.7794], [30.901, 75.8573], [30.207, 74.9521], [31.634, 74.8723]],
  },
  {
    id: 'delhi-lucknow', name: 'Delhi-Lucknow Express', type: 'High',
    points: [[28.6412, 77.2189], [27.4924, 77.6737], [26.4499, 80.3319], [26.8467, 80.9462]],
  },
  {
    id: 'delhi-jaipur', name: 'Delhi-Jaipur', type: 'High',
    points: [[28.6412, 77.2189], [27.4924, 77.6737], [26.9124, 75.7873]],
  },
  {
    id: 'mumbai-ahmedabad', name: 'Mumbai-Ahmedabad', type: 'High',
    points: [[19.0596, 72.8295], [21.1702, 72.8311], [22.3072, 73.1812], [23.0225, 72.5714]],
  },
  {
    id: 'mumbai-bangalore', name: 'Mumbai-Bengaluru', type: 'Medium',
    points: [[18.9398, 72.8355], [18.5204, 73.8567], [17.6599, 75.9064], [17.4399, 78.5016], [12.9784, 77.5733]],
  },
  {
    id: 'chennai-bangalore', name: 'Chennai-Bengaluru', type: 'High',
    points: [[13.0827, 80.2707], [12.9933, 79.1422], [12.9784, 77.5733]],
  },
  {
    id: 'chennai-trivandrum', name: 'Chennai-Trivandrum', type: 'Medium',
    points: [[13.0827, 80.2707], [11.6643, 78.146], [11.0054, 76.9718], [8.5241, 76.9366], [8.0883, 77.5385]],
  },
  {
    id: 'kolkata-guwahati', name: 'Kolkata-Guwahati', type: 'Medium',
    points: [[22.5803, 88.3467], [25.6093, 85.1376], [26.7006, 88.4354], [26.1445, 91.7362]],
  },
  {
    id: 'nagpur-raipur', name: 'Nagpur-Raipur', type: 'Medium',
    points: [[21.1458, 79.0882], [21.1916, 81.2844], [21.2514, 81.6296], [21.9091, 82.3166]],
  },
  {
    id: 'bhopal-jabalpur', name: 'Bhopal-Jabalpur', type: 'Medium',
    points: [[23.2599, 77.4126], [22.6145, 77.7563], [23.7354, 80.7967], [23.1815, 79.9864]],
  },
];

// ─── TRAINS (real, from the 5,200+ train DB) ───
interface DbTrain {
  number: string;
  name: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  zone: string;
  type: string;
  distance: number;
  departure: string;
  arrival: string;
  durationMin: number;
  classes?: string;
  coords: number[][];
}

function interpolateCorridor(points: [number, number][], progress: number): [number, number] {
  if (points.length < 2) return points[0] ?? [0, 0];
  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][1] - points[i - 1][1];
    const dy = points[i][0] - points[i - 1][0];
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLength += len;
  }
  const targetDist = progress * totalLength;
  let accumulated = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (accumulated + segLengths[i] >= targetDist) {
      const segProgress = segLengths[i] > 0 ? (targetDist - accumulated) / segLengths[i] : 0;
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * segProgress,
        points[i][1] + (points[i + 1][1] - points[i][1]) * segProgress,
      ];
    }
    accumulated += segLengths[i];
  }
  return points[points.length - 1];
}

export default function RailwayMapView() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);
  const [trainPositions, setTrainPositions] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Real trains from the all-India DB (spread across zones, with GPS routes)
  const dbTrains = useQuery(api.allTrains.getMapTrains, { perZone: 2 });
  const dbZoneStats = useQuery(api.allTrains.getZoneStats, {});

  // Derive animated positions from real DB trains along their actual routes
  useEffect(() => {
    if (!dbTrains || dbTrains.length === 0) return;
    setTrainPositions(prev => {
      const byNumber = new Map(prev.map(p => [p.number, p]));
      return dbTrains.map((t: DbTrain) => {
        const old = byNumber.get(t.number);
        const pts = (t.coords && t.coords.length >= 2
          ? t.coords.map(c => [c[0], c[1]] as [number, number])
          : ([[
              // fallback: origin→destination straight line via rough midpoint
              (28.6 + 13.0) / 2, (77.2 + 80.2) / 2,
            ], [28.6, 77.2]] as [number, number][]));
        const progress = old ? old.progress : Math.random() * 0.7 + 0.1;
        // Deterministic per-train speed profile in a realistic band
        const baseSpeed = t.type === 'Rajdhani' || t.type === 'Shatabdi' || t.type === 'Vande Bharat' ? 120 : t.type === 'Passenger' ? 55 : 85;
        const speed = old ? old.speed : baseSpeed + Math.floor(Math.random() * 15);
        // Pseudo delay derived from train number hash (stable per train)
        const delay = old ? old.delay : (parseInt(t.number, 10) % 37) - 12;
        return {
          id: t.number,
          name: t.name,
          number: t.number,
          corridorId: `${t.fromCode}-${t.toCode}`,
          progress,
          status: 'Running',
          speed,
          delay: Math.max(0, delay),
          pos: interpolateCorridor(pts, progress),
        } as TrainData & { routePoints?: [number, number][] };
      });
    });
  }, [dbTrains]);

  // Keep route points for progress animation on refresh
  const routePointsRef = useRef<Map<string, [number, number][]>>(new Map());
  useEffect(() => {
    if (!dbTrains) return;
    const m = new Map<string, [number, number][]>() as Map<string, [number, number][]>;
    for (const t of dbTrains as DbTrain[]) {
      m.set(t.number, (t.coords && t.coords.length >= 2
        ? t.coords.map(c => [c[0], c[1]] as [number, number])
        : ([[28.6, 77.2], [19.0, 72.8]] as [number, number][])));
    }
    routePointsRef.current = m;
  }, [dbTrains]);

  const filteredStations = useMemo(() => {
    if (!activeZone) return majorStations;
    return majorStations.filter(s => s.zone === activeZone);
  }, [activeZone]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [22.5, 78.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Zoom control on bottom-left
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomright', prefix: '' })
      .addAttribution('© OpenStreetMap contributors © CARTO')
      .addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Corridors
    if (showCorridors) {
      corridors.forEach(corridor => {
        const latlngs = corridor.points.map(p => [p[0], p[1]] as [number, number]);
        const color = corridor.type === 'Golden' ? '#F59E0B' : corridor.type === 'High' ? '#3B82F6' : '#6B7280';
        const weight = corridor.type === 'Golden' ? 3 : corridor.type === 'High' ? 2 : 1;
        const opacity = corridor.type === 'Golden' ? 0.8 : corridor.type === 'High' ? 0.6 : 0.35;

        L.polyline(latlngs, {
          color,
          weight,
          opacity,
          dashArray: corridor.type === 'Medium' ? '6 4' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layer);
      });
    }

    // Stations
    if (showStations) {
      filteredStations.forEach(station => {
        const dimmed = activeZone && station.zone !== activeZone;
        const color = station.isJunction ? '#F59E0B' : station.type === 'Terminal' ? '#3B82F6' : '#10B981';
        const radius = station.isJunction ? 6 : station.type === 'Terminal' ? 5 : 3.5;
        const opacity = dimmed ? 0.2 : 1;

        const marker = L.circleMarker([station.lat, station.lng], {
          radius,
          fillColor: color,
          color: 'rgba(0,0,0,0.6)',
          weight: 1,
          fillOpacity: opacity,
        });

        marker.bindTooltip(
          `<div style="font-family:system-ui;font-size:12px;"><b>${station.name}</b><br/>${station.code} • ${station.zone}</div>`,
          { permanent: false, direction: 'top', offset: [0, -6] }
        );

        marker.on('click', () => setSelectedStation(station));
        marker.addTo(layer);
      });
    }

    // Trains
    if (showTrains) {
      trainPositions.forEach(train => {
        const color = train.delay > 20 ? '#EF4444' : train.delay > 0 ? '#F59E0B' : '#22C55E';

        // Pulse ring
        L.circleMarker([train.pos[0], train.pos[1]], {
          radius: 10,
          fillColor: color,
          color: 'transparent',
          fillOpacity: 0.15,
        }).addTo(layer);

        // Train dot
        const trainMarker = L.circleMarker([train.pos[0], train.pos[1]], {
          radius: 5,
          fillColor: color,
          color: '#000',
          weight: 1,
          fillOpacity: 1,
        });

        // Train label
        const label = L.divIcon({
          className: 'train-label',
          html: `<div style="
            background:rgba(0,0,0,0.8);
            color:${color};
            font-family:monospace;
            font-size:10px;
            font-weight:bold;
            padding:1px 4px;
            border-radius:3px;
            white-space:nowrap;
            border:1px solid ${color}33;
            text-align:center;
            pointer-events:none;
          ">${train.number}</div>`,
          iconAnchor: [-8, 4],
        });

        const labelMarker = L.marker([train.pos[0], train.pos[1]], { icon: label });
        labelMarker.addTo(layer);

        trainMarker.bindTooltip(
          `<div style="font-family:system-ui;font-size:12px;">
            <b>${train.name}</b> (${train.number})<br/>
            Speed: ${train.speed} km/h<br/>
            Delay: ${train.delay > 0 ? train.delay + ' min' : 'On Time'}
          </div>`,
          { permanent: false, direction: 'top', offset: [0, -10] }
        );

        trainMarker.on('click', () => setSelectedTrain(train));
        trainMarker.addTo(layer);
      });
    }
  }, [filteredStations, showCorridors, showStations, showTrains, trainPositions, activeZone]);

  const handleRefreshTrains = () => {
    setLoading(true);
    setTimeout(() => {
      setTrainPositions(prev =>
        prev.map(t => {
          const pts = routePointsRef.current.get(t.number) ?? ([[0, 0]] as [number, number][]);
          const newProgress = Math.min(1, Math.max(0, t.progress + (Math.random() - 0.3) * 0.05));
          return {
            ...t,
            progress: newProgress,
            speed: Math.max(50, Math.min(150, t.speed + (Math.random() - 0.5) * 10)),
            delay: Math.max(0, t.delay + Math.floor((Math.random() - 0.5) * 8)),
            pos: interpolateCorridor(pts, newProgress),
          };
        })
      );
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#ffffff] flex items-center gap-2" style={{ fontFamily: 'var(--font-figtree)' }}>
            <MapPin className="w-5 h-5 text-[#2862d7]" />
            All-India Railway Network
          </h2>
          <p className="text-sm text-[#abaebb] mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
            {majorStations.length} stations • {corridors.length} corridors • {trainPositions.length} live trains
            {dbZoneStats && dbZoneStats.total > 0 && (
              <span className="text-[#22C55E]"> • {dbZoneStats.total.toLocaleString('en-IN')} in DB</span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefreshTrains}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2862d7] text-white hover:bg-[#305fbd] transition-colors text-sm disabled:opacity-50 font-medium"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Trains'}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="w-64 flex flex-col gap-3">
          {/* Layer Toggles */}
          <div className="rounded-xl border border-[#172540] bg-[#0d172b] p-3" style={{ fontFamily: 'var(--font-inter)' }}>
            <h3 className="text-sm font-semibold text-[#ffffff] mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2862d7]" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {[
                { checked: showTrains, onChange: setShowTrains, icon: <TrainIcon className="w-3.5 h-3.5" />, label: `Trains (${trainPositions.length})` },
                { checked: showStations, onChange: setShowStations, icon: <MapPin className="w-3.5 h-3.5" />, label: `Stations (${filteredStations.length})` },
                { checked: showCorridors, onChange: setShowCorridors, icon: <Layers className="w-3.5 h-3.5" />, label: `Corridors (${corridors.length})` },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-[#abaebb] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-[#172540] bg-[#0e111b] text-[#2862d7] focus:ring-[#2862d7]"
                  />
                  {item.icon}
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Zone Filter */}
          <div className="rounded-xl border border-[#172540] bg-[#0d172b] p-3 flex-1 overflow-auto" style={{ fontFamily: 'var(--font-inter)' }}>
            <h3 className="text-sm font-semibold text-[#ffffff] mb-2">Railway Zones</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveZone(null)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${!activeZone ? 'bg-[#2862d7]/20 text-[#2862d7]' : 'text-[#abaebb] hover:bg-[#0e111b]'}`}
              >
                All Zones ({railwayZones.length})
              </button>
              {railwayZones.map(zone => (
                <button
                  key={zone.code}
                  onClick={() => setActiveZone(activeZone === zone.code ? null : zone.code)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeZone === zone.code ? 'bg-[#2862d7]/20 text-[#2862d7]' : 'text-[#abaebb] hover:bg-[#0e111b]'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                  <span className="truncate font-mono text-xs">{zone.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-[#172540] bg-[#0d172b] p-3" style={{ fontFamily: 'var(--font-inter)' }}>
            <h3 className="text-sm font-semibold text-[#ffffff] mb-2">Legend</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { color: '#F59E0B', label: 'Junction' },
                { color: '#3B82F6', label: 'Terminal' },
                { color: '#10B981', label: 'City Station' },
                { color: '#22C55E', label: 'Running Train' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#abaebb]">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[#172540]">
                <span className="w-6 h-0.5 rounded" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-[#abaebb]">Golden Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 rounded" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-[#abaebb]">High Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 rounded" style={{ backgroundColor: '#6B7280' }} />
                <span className="text-[#abaebb]">Regional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 rounded-xl border border-[#172540] overflow-hidden relative">
          <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px' }} />

          {/* Train count badge */}
          {showTrains && (
            <div className="absolute left-4 top-4 rounded-lg border border-[#172540] bg-[#0d172b]/95 backdrop-blur-md px-3 py-2 z-[1000]">
              <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[#ffffff] font-medium">{trainPositions.length} Live Trains</span>
                <Database className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[10px] text-[#abaebb] font-mono">real routes</span>
              </div>
            </div>
          )}

          {/* Station Detail Panel */}
          {selectedStation && (
            <div className="absolute right-4 top-4 w-72 rounded-xl border border-[#172540] bg-[#0d172b]/95 backdrop-blur-md p-4 shadow-2xl z-[1000]" style={{ fontFamily: 'var(--font-inter)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#ffffff]">{selectedStation.name}</h3>
                <button onClick={() => setSelectedStation(null)} className="text-[#abaebb] hover:text-[#ffffff] text-sm">✕</button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Station Code', selectedStation.code],
                  ['Zone', selectedStation.zone],
                  ['Division', selectedStation.division],
                  ['Type', selectedStation.type],
                  ['Coordinates', `${selectedStation.lat.toFixed(4)}, ${selectedStation.lng.toFixed(4)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#abaebb]">{label}</span>
                    <span className="text-[#ffffff] font-mono text-xs">{value}</span>
                  </div>
                ))}
                {selectedStation.isJunction && (
                  <div className="mt-2 px-2 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-xs text-center font-medium">Major Junction</div>
                )}
              </div>
            </div>
          )}

          {/* Train Detail Panel */}
          {selectedTrain && (
            <div className="absolute right-4 top-4 w-72 rounded-xl border border-[#22C55E]/30 bg-[#0d172b]/95 backdrop-blur-md p-4 shadow-2xl z-[1000]" style={{ fontFamily: 'var(--font-inter)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrainIcon className="w-4 h-4 text-[#22C55E]" />
                  <h3 className="font-semibold text-[#ffffff]">{selectedTrain.name}</h3>
                </div>
                <button onClick={() => setSelectedTrain(null)} className="text-[#abaebb] hover:text-[#ffffff] text-sm">✕</button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Train Number', selectedTrain.number],
                  ['Route', corridors.find(c => c.id === selectedTrain.corridorId)?.name ?? ''],
                  ['Status', selectedTrain.status],
                  ['Speed', `${selectedTrain.speed} km/h`],
                  ['Delay', selectedTrain.delay > 0 ? `${selectedTrain.delay} min` : 'On Time'],
                  ['Progress', `${Math.round(selectedTrain.progress * 100)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#abaebb]">{label}</span>
                    <span className={`font-mono text-xs ${label === 'Delay' && selectedTrain.delay > 0 ? 'text-[#EF4444]' : label === 'Delay' ? 'text-[#22C55E]' : 'text-[#ffffff]'}`}>{value}</span>
                  </div>
                ))}
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-[#0e111b] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full transition-all" style={{ width: `${selectedTrain.progress * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
