import React, { useState, useMemo } from 'react';
import { MapPin, Layers, Train as TrainIcon, RotateCw } from 'lucide-react';

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

// Corridor with real intermediate waypoints (not straight lines)
interface Corridor {
  id: string;
  name: string;
  type: string;
  points: [number, number][]; // [lat, lng] pairs along real route
}

interface TrainData {
  id: string;
  name: string;
  number: string;
  corridorId: string;
  progress: number; // 0.0 = start, 1.0 = end
  status: string;
  speed: number;
  delay: number;
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
  // North
  { id: 'NDLS', name: 'New Delhi', code: 'NDLS', lat: 28.6412, lng: 77.2189, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: true },
  { id: 'ASR', name: 'Amritsar', code: 'ASR', lat: 31.634, lng: 74.8723, zone: 'NR', division: 'Firozpur', type: 'Terminal', isJunction: true },
  { id: 'LDH', name: 'Ludhiana', code: 'LDH', lat: 30.901, lng: 75.8573, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'CDG', name: 'Chandigarh', code: 'CDG', lat: 30.7333, lng: 76.7794, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'UMB', name: 'Ambala Cantt', code: 'UMB', lat: 30.3272, lng: 76.8179, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'BTI', name: 'Bathinda', code: 'BTI', lat: 30.207, lng: 74.9521, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'NZM', name: 'Nizamuddin', code: 'NZM', lat: 28.5906, lng: 77.2505, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'DEE', name: 'Delhi Sarai Rohilla', code: 'DEE', lat: 28.6507, lng: 77.2334, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'ANVT', name: 'Anand Vihar', code: 'ANVT', lat: 28.6262, lng: 77.2983, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'LKO', name: 'Lucknow', code: 'LKO', lat: 26.8467, lng: 80.9462, zone: 'NR', division: 'Lucknow', type: 'Terminal', isJunction: true },
  { id: 'CNB', name: 'Kanpur Central', code: 'CNB', lat: 26.4499, lng: 80.3319, zone: 'NER', division: 'Kanpur', type: 'Junction', isJunction: true },

  // West
  { id: 'JP', name: 'Jaipur', code: 'JP', lat: 26.9124, lng: 75.7873, zone: 'NWR', division: 'Jaipur', type: 'Junction', isJunction: true },
  { id: 'JU', name: 'Jodhpur', code: 'JU', lat: 26.2389, lng: 73.0243, zone: 'NWR', division: 'Jodhpur', type: 'Junction', isJunction: true },
  { id: 'BKN', name: 'Bikaner', code: 'BKN', lat: 28.0229, lng: 73.322, zone: 'NWR', division: 'Bikaner', type: 'Junction', isJunction: true },
  { id: 'AII', name: 'Ajmer', code: 'AII', lat: 26.4499, lng: 74.6399, zone: 'NWR', division: 'Ajmer', type: 'Junction', isJunction: true },
  { id: 'UDZ', name: 'Udaipur', code: 'UDZ', lat: 24.5854, lng: 73.7125, zone: 'NWR', division: 'Ajmer', type: 'Terminal', isJunction: false },
  { id: 'ADI', name: 'Ahmedabad', code: 'ADI', lat: 23.0225, lng: 72.5714, zone: 'WR', division: 'Ahmedabad', type: 'Junction', isJunction: true },
  { id: 'BRC', name: 'Vadodara', code: 'BRC', lat: 22.3072, lng: 73.1812, zone: 'WR', division: 'Vadodara', type: 'Junction', isJunction: true },
  { id: 'ST', name: 'Surat', code: 'ST', lat: 21.1702, lng: 72.8311, zone: 'WR', division: 'Mumbai', type: 'Junction', isJunction: true },
  { id: 'RTM', name: 'Ratlam', code: 'RTM', lat: 23.3343, lng: 75.0373, zone: 'WR', division: 'Ratlam', type: 'Junction', isJunction: true },
  { id: 'BCT', name: 'Mumbai Central', code: 'BCT', lat: 19.0596, lng: 72.8295, zone: 'WR', division: 'Mumbai', type: 'Terminal', isJunction: true },
  { id: 'CSTM', name: 'CST Mumbai', code: 'CSTM', lat: 18.9398, lng: 72.8355, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },

  // Central
  { id: 'MTJ', name: 'Mathura', code: 'MTJ', lat: 27.4924, lng: 77.6737, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'AGC', name: 'Agra Cantt', code: 'AGC', lat: 27.1767, lng: 78.0081, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'ETW', name: 'Etawah', code: 'ETW', lat: 26.7822, lng: 79.0232, zone: 'NCR', division: 'Prayagraj', type: 'Junction', isJunction: true },
  { id: 'JHS', name: 'Jhansi', code: 'JHS', lat: 25.4484, lng: 78.5685, zone: 'NCR', division: 'Jhansi', type: 'Junction', isJunction: true },
  { id: 'ALY', name: 'Prayagraj', code: 'ALY', lat: 25.4358, lng: 81.8463, zone: 'NCR', division: 'Prayagraj', type: 'Junction', isJunction: true },
  { id: 'MGS', name: 'Pt. DD Upadhyaya', code: 'MGS', lat: 25.2817, lng: 83.1161, zone: 'NCR', division: 'Pt. DD Upadhyaya', type: 'Junction', isJunction: true },
  { id: 'BPL', name: 'Bhopal', code: 'BPL', lat: 23.2599, lng: 77.4126, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'ET', name: 'Itarsi', code: 'ET', lat: 22.6145, lng: 77.7563, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'NGP', name: 'Nagpur', code: 'NGP', lat: 21.1458, lng: 79.0882, zone: 'CR', division: 'Nagpur', type: 'Junction', isJunction: true },
  { id: 'BSL', name: 'Bhusaval', code: 'BSL', lat: 21.0434, lng: 75.7849, zone: 'CR', division: 'Bhusaval', type: 'Junction', isJunction: true },
  { id: 'JBP', name: 'Jabalpur', code: 'JBP', lat: 23.1815, lng: 79.9864, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'KTE', name: 'Katni', code: 'KTE', lat: 23.7354, lng: 80.7967, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'PUNE', name: 'Pune', code: 'PUNE', lat: 18.5204, lng: 73.8567, zone: 'CR', division: 'Pune', type: 'Junction', isJunction: true },
  { id: 'LTT', name: 'LTT Mumbai', code: 'LTT', lat: 19.0624, lng: 72.8893, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },

  // South Central
  { id: 'SC', name: 'Secunderabad', code: 'SC', lat: 17.4399, lng: 78.5016, zone: 'SCR', division: 'Secunderabad', type: 'Terminal', isJunction: true },
  { id: 'BZA', name: 'Vijayawada', code: 'BZA', lat: 16.5062, lng: 80.648, zone: 'SCR', division: 'Vijayawada', type: 'Junction', isJunction: true },
  { id: 'GNT', name: 'Guntur', code: 'GNT', lat: 16.3097, lng: 80.4373, zone: 'SCR', division: 'Guntur', type: 'Junction', isJunction: true },
  { id: 'NED', name: 'Nanded', code: 'NED', lat: 19.1587, lng: 77.3178, zone: 'SCR', division: 'Nanded', type: 'Junction', isJunction: true },
  { id: 'SUR', name: 'Solapur', code: 'SUR', lat: 17.6599, lng: 75.9064, zone: 'CR', division: 'Solapur', type: 'Junction', isJunction: true },
  { id: 'AWB', name: 'Aurangabad', code: 'AWB', lat: 19.8762, lng: 75.3433, zone: 'CR', division: 'Solapur', type: 'City', isJunction: false },

  // South
  { id: 'MAS', name: 'Chennai Central', code: 'MAS', lat: 13.0827, lng: 80.2707, zone: 'SR', division: 'Chennai', type: 'Terminal', isJunction: true },
  { id: 'SBC', name: 'Bengaluru', code: 'SBC', lat: 12.9784, lng: 77.5733, zone: 'SWR', division: 'Bangalore', type: 'Terminal', isJunction: true },
  { id: 'KPD', name: 'Katpadi', code: 'KPD', lat: 12.9933, lng: 79.1422, zone: 'SR', division: 'Chennai', type: 'Junction', isJunction: true },
  { id: 'SA', name: 'Salem', code: 'SA', lat: 11.6643, lng: 78.146, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'ED', name: 'Erode', code: 'ED', lat: 11.341, lng: 77.7172, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'CBE', name: 'Coimbatore', code: 'CBE', lat: 11.0054, lng: 76.9718, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'MDU', name: 'Madurai', code: 'MDU', lat: 9.9252, lng: 78.1198, zone: 'SR', division: 'Madurai', type: 'Junction', isJunction: true },
  { id: 'TVC', name: 'Trivandrum', code: 'TVC', lat: 8.5241, lng: 76.9366, zone: 'SR', division: 'Trivandrum', type: 'Terminal', isJunction: true },
  { id: 'CAPE', name: 'Kanyakumari', code: 'CAPE', lat: 8.0883, lng: 77.5385, zone: 'SR', division: 'Madurai', type: 'Terminal', isJunction: false },
  { id: 'TPTY', name: 'Tirupati', code: 'TPTY', lat: 13.6288, lng: 79.4192, zone: 'SCR', division: 'Guntakal', type: 'Junction', isJunction: true },
  { id: 'MAQ', name: 'Mangalore', code: 'MAQ', lat: 12.9141, lng: 74.856, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'CLT', name: 'Calicut', code: 'CLT', lat: 11.2587, lng: 75.7804, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },

  // East
  { id: 'HWH', name: 'Howrah', code: 'HWH', lat: 22.5803, lng: 88.3467, zone: 'ER', division: 'Howrah', type: 'Terminal', isJunction: true },
  { id: 'KOAA', name: 'Kolkata', code: 'KOAA', lat: 22.5726, lng: 88.3639, zone: 'ER', division: 'Howrah', type: 'Terminal', isJunction: false },
  { id: 'BBS', name: 'Bhubaneswar', code: 'BBS', lat: 20.2961, lng: 85.8245, zone: 'ECR', division: 'Khurda Road', type: 'Junction', isJunction: true },
  { id: 'CTC', name: 'Cuttack', code: 'CTC', lat: 20.4625, lng: 85.883, zone: 'ECR', division: 'Khurda Road', type: 'Junction', isJunction: true },
  { id: 'PURI', name: 'Puri', code: 'PURI', lat: 19.8135, lng: 85.8312, zone: 'ECR', division: 'Khurda Road', type: 'Terminal', isJunction: false },
  { id: 'VSKP', name: 'Visakhapatnam', code: 'VSKP', lat: 17.6868, lng: 83.2185, zone: 'ECR', division: 'Waltair', type: 'Junction', isJunction: true },
  { id: 'BSP', name: 'Bilaspur', code: 'BSP', lat: 21.9091, lng: 82.3166, zone: 'SECR', division: 'Bilaspur', type: 'Junction', isJunction: true },
  { id: 'R', name: 'Raipur', code: 'R', lat: 21.2514, lng: 81.6296, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'DURG', name: 'Durg', code: 'DURG', lat: 21.1916, lng: 81.2844, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'TATA', name: 'Tatanagar', code: 'TATA', lat: 22.7788, lng: 86.2029, zone: 'ECR', division: 'Chakradharpur', type: 'Junction', isJunction: true },
  { id: 'SBP', name: 'Sambalpur', code: 'SBP', lat: 21.4669, lng: 83.9812, zone: 'ECR', division: 'Sambalpur', type: 'Junction', isJunction: true },
  { id: 'RNC', name: 'Ranchi', code: 'RNC', lat: 23.3441, lng: 85.3096, zone: 'ECR', division: 'Ranchi', type: 'Junction', isJunction: true },

  // Bihar / East Central
  { id: 'PPTA', name: 'Patna', code: 'PPTA', lat: 25.6093, lng: 85.1376, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'DNR', name: 'Danapur', code: 'DNR', lat: 25.6276, lng: 85.0417, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'HJP', name: 'Hajipur', code: 'HJP', lat: 25.6892, lng: 85.2097, zone: 'ECR', division: 'Hajipur', type: 'Junction', isJunction: true },
  { id: 'MFP', name: 'Muzaffarpur', code: 'MFP', lat: 26.1209, lng: 85.3647, zone: 'ECR', division: 'Sonpur', type: 'Junction', isJunction: true },
  { id: 'SPJ', name: 'Samastipur', code: 'SPJ', lat: 25.8989, lng: 85.779, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'BJU', name: 'Barauni', code: 'BJU', lat: 25.7268, lng: 85.8742, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'GAYA', name: 'Gaya', code: 'GAYA', lat: 24.7963, lng: 85.0063, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'DBG', name: 'Darbhanga', code: 'DBG', lat: 26.1542, lng: 86.0772, zone: 'NER', division: 'Samastipur', type: 'Junction', isJunction: true },

  // North East
  { id: 'GKP', name: 'Gorakhpur', code: 'GKP', lat: 26.7606, lng: 83.3732, zone: 'NER', division: 'Gorakhpur', type: 'Junction', isJunction: true },
  { id: 'GHY', name: 'Guwahati', code: 'GHY', lat: 26.1445, lng: 91.7362, zone: 'NFR', division: 'Guwahati', type: 'Terminal', isJunction: true },
  { id: 'NJP', name: 'New Jalpaiguri', code: 'NJP', lat: 26.7006, lng: 88.4354, zone: 'NFR', division: 'Katihar', type: 'Junction', isJunction: true },
];

// ─── CORRIDORS (real multi-point routes) ───
const corridors: Corridor[] = [
  // Grand Trunk Express: Delhi → Agra → Jhansi → Bhopal → Nagpur → Balharshah → Warangal → Vijayawada → Chennai
  {
    id: 'gt-express', name: 'GT Express Route', type: 'Golden',
    points: [
      [28.6412, 77.2189], // NDLS
      [27.4924, 77.6737], // Mathura
      [27.1767, 78.0081], // Agra
      [25.4484, 78.5685], // Jhansi
      [23.2599, 77.4126], // Bhopal
      [22.6145, 77.7563], // Itarsi
      [21.1458, 79.0882], // Nagpur
      [19.1587, 77.3178], // Nanded (via Balharshah)
      [17.4399, 78.5016], // Secunderabad
      [16.5062, 80.648],  // Vijayawada
      [13.0827, 80.2707], // Chennai
    ],
  },
  // Delhi → Howrah (via Kanpur, Allahabad, Mughal Sarai)
  {
    id: 'delhi-howrah', name: 'Delhi-Howrah Rajdhani', type: 'Golden',
    points: [
      [28.6412, 77.2189], // NDLS
      [27.4924, 77.6737], // Mathura
      [26.4499, 80.3319], // Kanpur
      [25.4358, 81.8463], // Prayagraj
      [25.2817, 83.1161], // Pt. DD Upadhyaya (Mughal Sarai)
      [24.7963, 85.0063], // Gaya
      [22.5803, 88.3467], // Howrah
    ],
  },
  // Mumbai → Delhi (via Vadodara, Ratlam, Jhansi, Agra)
  {
    id: 'mumbai-delhi', name: 'Mumbai-Delhi Rajdhani', type: 'Golden',
    points: [
      [19.0596, 72.8295], // Mumbai Central
      [21.1702, 72.8311], // Surat
      [22.3072, 73.1812], // Vadodara
      [23.3343, 75.0373], // Ratlam
      [25.4484, 78.5685], // Jhansi
      [27.1767, 78.0081], // Agra
      [28.6412, 77.2189], // NDLS
    ],
  },
  // Howrah → Chennai (via Kharagpur, Cuttack, Vizag, Vijayawada)
  {
    id: 'howrah-chennai', name: 'Howrah-Chennai Corridor', type: 'High',
    points: [
      [22.5803, 88.3467], // Howrah
      [22.7788, 86.2029], // Tatanagar
      [20.4625, 85.883],  // Cuttack
      [20.2961, 85.8245], // Bhubaneswar
      [17.6868, 83.2185], // Visakhapatnam
      [16.5062, 80.648],  // Vijayawada
      [13.0827, 80.2707], // Chennai
    ],
  },
  // Delhi → Amritsar (via Ambala, Ludhiana)
  {
    id: 'delhi-amritsar', name: 'Delhi-Amritsar Mail', type: 'High',
    points: [
      [28.6412, 77.2189], // NDLS
      [28.6507, 77.2334], // Delhi Rohilla
      [30.3272, 76.8179], // Ambala
      [30.7333, 76.7794], // Chandigarh
      [30.901, 75.8573],  // Ludhiana
      [30.207, 74.9521],  // Bathinda
      [31.634, 74.8723],  // Amritsar
    ],
  },
  // Delhi → Lucknow (via Kanpur)
  {
    id: 'delhi-lucknow', name: 'Delhi-Lucknow Express', type: 'High',
    points: [
      [28.6412, 77.2189], // NDLS
      [27.4924, 77.6737], // Mathura
      [26.4499, 80.3319], // Kanpur
      [26.8467, 80.9462], // Lucknow
    ],
  },
  // Delhi → Jaipur
  {
    id: 'delhi-jaipur', name: 'Delhi-Jaipur', type: 'High',
    points: [
      [28.6412, 77.2189], // NDLS
      [27.4924, 77.6737], // Mathura
      [26.9124, 75.7873], // Jaipur
    ],
  },
  // Mumbai → Ahmedabad (via Surat, Vadodara)
  {
    id: 'mumbai-ahmedabad', name: 'Mumbai-Ahmedabad', type: 'High',
    points: [
      [19.0596, 72.8295], // Mumbai
      [19.0624, 72.8893], // LTT
      [21.1702, 72.8311], // Surat
      [22.3072, 73.1812], // Vadodara
      [23.0225, 72.5714], // Ahmedabad
    ],
  },
  // Mumbai → Bengaluru (via Pune, Solapur, Gulbarga)
  {
    id: 'mumbai-bangalore', name: 'Mumbai-Bengaluru', type: 'Medium',
    points: [
      [18.9398, 72.8355], // CST Mumbai
      [18.5204, 73.8567], // Pune
      [17.6599, 75.9064], // Solapur
      [17.4399, 78.5016], // Secunderabad
      [12.9784, 77.5733], // Bengaluru
    ],
  },
  // Chennai → Bengaluru
  {
    id: 'chennai-bangalore', name: 'Chennai-Bengaluru', type: 'High',
    points: [
      [13.0827, 80.2707], // Chennai
      [12.9933, 79.1422], // Katpadi
      [12.9784, 77.5733], // Bengaluru
    ],
  },
  // Chennai → Trivandrum (via Salem, Coimbatore, Palakkad)
  {
    id: 'chennai-trivandrum', name: 'Chennai-Trivandrum', type: 'Medium',
    points: [
      [13.0827, 80.2707], // Chennai
      [12.9933, 79.1422], // Katpadi
      [11.6643, 78.146],  // Salem
      [11.341, 77.7172],  // Erode
      [11.0054, 76.9718], // Coimbatore
      [10.527, 76.2144],  // Thrissur
      [8.5241, 76.9366],  // Trivandrum
      [8.0883, 77.5385],  // Kanyakumari
    ],
  },
  // Kolkata → Bhubaneswar → Vijayawada (same as howrah-chennai northern half, skip)
  // Kolkata → Guwahati (via NJP)
  {
    id: 'kolkata-guwahati', name: 'Kolkata-Guwahati', type: 'Medium',
    points: [
      [22.5803, 88.3467], // Howrah
      [24.7963, 85.0063], // Gaya
      [25.6093, 85.1376], // Patna
      [26.1209, 85.3647], // Muzaffarpur
      [26.7006, 88.4354], // NJP (New Jalpaiguri)
      [26.1445, 91.7362], // Guwahati
    ],
  },
  // Delhi → Kanpur direct
  {
    id: 'delhi-kanpur', name: 'Delhi-Kanpur Express', type: 'High',
    points: [
      [28.6412, 77.2189], // NDLS
      [26.4499, 80.3319], // Kanpur
    ],
  },
  // Nagpur → Raipur
  {
    id: 'nagpur-raipur', name: 'Nagpur-Raipur', type: 'Medium',
    points: [
      [21.1458, 79.0882], // Nagpur
      [21.1916, 81.2844], // Durg
      [21.2514, 81.6296], // Raipur
      [21.9091, 82.3166], // Bilaspur
    ],
  },
  // Bhopal → Jabalpur
  {
    id: 'bhopal-jabalpur', name: 'Bhopal-Jabalpur', type: 'Medium',
    points: [
      [23.2599, 77.4126], // Bhopal
      [22.6145, 77.7563], // Itarsi
      [23.7354, 80.7967], // Katni
      [23.1815, 79.9864], // Jabalpur
    ],
  },
  // Pune → Hyderabad direct
  {
    id: 'pune-hyderabad', name: 'Pune-Hyderabad', type: 'Medium',
    points: [
      [18.5204, 73.8567], // Pune
      [17.6599, 75.9064], // Solapur
      [17.4399, 78.5016], // Secunderabad
    ],
  },
  // Howrah → Bhubaneswar (Kalinga)
  {
    id: 'howrah-bbs', name: 'Howrah-Bhubaneswar', type: 'Medium',
    points: [
      [22.5803, 88.3467], // Howrah
      [22.7788, 86.2029], // Tatanagar
      [20.4625, 85.883],  // Cuttack
      [20.2961, 85.8245], // Bhubaneswar
    ],
  },
  // Secunderabad → Vijayawada
  {
    id: 'sc-bza', name: 'Secunderabad-Vijayawada', type: 'Medium',
    points: [
      [17.4399, 78.5016], // Secunderabad
      [16.5062, 80.648],  // Vijayawada
    ],
  },
];

// ─── TRAINS placed on corridors ───
const demoTrains: TrainData[] = [
  // Grand Trunk Express — between Jhansi and Bhopal
  { id: '12625', name: 'GT Express', number: '12625', corridorId: 'gt-express', progress: 0.40, status: 'Running', speed: 110, delay: 15 },
  // Howrah Rajdhani — between Prayagraj and Pt DD Upadhyaya
  { id: '12301', name: 'Howrah Rajdhani', number: '12301', corridorId: 'delhi-howrah', progress: 0.55, status: 'Running', speed: 120, delay: 8 },
  // Mumbai Rajdhani — between Ratlam and Jhansi
  { id: '12951', name: 'Mumbai Rajdhani', number: '12951', corridorId: 'mumbai-delhi', progress: 0.45, status: 'Running', speed: 115, delay: 0 },
  // Tamil Nadu Express — between Katpadi and Salem
  { id: '12621', name: 'Tamil Nadu Exp', number: '12621', corridorId: 'chennai-trivandrum', progress: 0.20, status: 'Running', speed: 95, delay: 35 },
  // Kerala Express — between Secunderabad and Vijayawada
  { id: '12626', name: 'Kerala Express', number: '12626', corridorId: 'gt-express', progress: 0.78, status: 'Running', speed: 100, delay: 22 },
  // Delhi-Jaipur Shatabdi — between Mathura and Jaipur
  { id: '12015', name: 'Delhi-Jaipur Shatabdi', number: '12015', corridorId: 'delhi-jaipur', progress: 0.55, status: 'Running', speed: 130, delay: 5 },
  // Mumbai-Ahmedabad Shatabdi — between Vadodara and Ahmedabad
  { id: '12009', name: 'Mumbai-Ahd Shatabdi', number: '12009', corridorId: 'mumbai-ahmedabad', progress: 0.75, status: 'Running', speed: 125, delay: 0 },
  // Howrah-Chennai Mail — between Bhubaneswar and Vizag
  { id: '12839', name: 'Howrah-Chennai Mail', number: '12839', corridorId: 'howrah-chennai', progress: 0.55, status: 'Running', speed: 90, delay: 18 },
  // Delhi-Amritsar — between Ludhiana and Amritsar
  { id: '12461', name: 'Delhi-Amritsar Exp', number: '12461', corridorId: 'delhi-amritsar', progress: 0.80, status: 'Running', speed: 100, delay: 0 },
  // Delhi-Lucknow — between Kanpur and Lucknow
  { id: '12230', name: 'Lucknow Mail', number: '12230', corridorId: 'delhi-lucknow', progress: 0.80, status: 'Running', speed: 105, delay: 10 },
  // Kolkata-Guwahati — between NJP and Guwahati
  { id: '15955', name: 'Kolkata-Guwahati Exp', number: '15955', corridorId: 'kolkata-guwahati', progress: 0.80, status: 'Running', speed: 85, delay: 25 },
  // Mumbai-Bangalore — between Solapur and Secunderabad
  { id: '11301', name: 'Udyan Express', number: '11301', corridorId: 'mumbai-bangalore', progress: 0.55, status: 'Running', speed: 95, delay: 12 },
  // Chennai-Bengaluru — near Katpadi
  { id: '12609', name: 'Shatabdi Express', number: '12609', corridorId: 'chennai-bangalore', progress: 0.50, status: 'Running', speed: 130, delay: 0 },
  // Nagpur-Raipur — between Durg and Raipur
  { id: '18237', name: 'Chattisgarh Exp', number: '18237', corridorId: 'nagpur-raipur', progress: 0.70, status: 'Running', speed: 80, delay: 5 },
  // Bhopal-Jabalpur — near Katni
  { id: '12193', name: 'Jabalpur Exp', number: '12193', corridorId: 'bhopal-jabalpur', progress: 0.70, status: 'Running', speed: 90, delay: 0 },
];

// ─── HELPER: interpolate position along a multi-point corridor ───
function interpolateCorridor(points: [number, number][], progress: number): [number, number] {
  if (points.length < 2) return points[0] ?? [0, 0];

  // Calculate total path length
  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][1] - points[i - 1][1]; // lng
    const dy = points[i][0] - points[i - 1][0]; // lat
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

// ─── COMPONENT ───
export default function RailwayMapView() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);
  const [trainPositions, setTrainPositions] = useState(() =>
    demoTrains.map(t => ({
      ...t,
      pos: interpolateCorridor(
        corridors.find(c => c.id === t.corridorId)?.points ?? [[0, 0]],
        t.progress
      ),
    }))
  );
  const [loading, setLoading] = useState(false);

  const viewBox = { x: 67, y: 6, width: 32, height: 33 };

  const filteredStations = useMemo(() => {
    if (!activeZone) return majorStations;
    return majorStations.filter(s => s.zone === activeZone);
  }, [activeZone]);

  const filteredCorridors = useMemo(() => {
    return corridors;
  }, []);

  const handleRefreshTrains = () => {
    setLoading(true);
    setTimeout(() => {
      setTrainPositions(prev =>
        prev.map(t => ({
          ...t,
          progress: Math.min(1, Math.max(0, t.progress + (Math.random() - 0.3) * 0.05)),
          speed: Math.max(60, Math.min(140, t.speed + (Math.random() - 0.5) * 10)),
          delay: Math.max(0, t.delay + Math.floor((Math.random() - 0.5) * 8)),
          pos: interpolateCorridor(
            corridors.find(c => c.id === t.corridorId)?.points ?? [[0, 0]],
            t.progress + (Math.random() - 0.3) * 0.05,
          ),
        }))
      );
      setLoading(false);
    }, 1200);
  };

  const getStationColor = (station: Station) => {
    if (activeZone && station.zone !== activeZone) return '#334155';
    if (station.isJunction) return '#F59E0B';
    if (station.type === 'Terminal') return '#3B82F6';
    return '#10B981';
  };

  const getStationRadius = (station: Station) => {
    if (station.isJunction) return 0.18;
    if (station.type === 'Terminal') return 0.15;
    return 0.10;
  };

  const getCorridorColor = (type: string) =>
    type === 'Golden' ? '#F59E0B' : type === 'High' ? '#3B82F6' : '#6B7280';
  const getCorridorWidth = (type: string) =>
    type === 'Golden' ? 0.07 : type === 'High' ? 0.045 : 0.025;

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            All-India Railway Network
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {majorStations.length} stations • {corridors.length} corridors • {trainPositions.length} live trains
          </p>
        </div>
        <button
          onClick={handleRefreshTrains}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Trains'}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Panel */}
        <div className="w-64 flex flex-col gap-3">
          {/* Layer Toggles */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {[
                { checked: showTrains, onChange: setShowTrains, icon: <TrainIcon className="w-3.5 h-3.5" />, label: `Trains (${trainPositions.length})` },
                { checked: showStations, onChange: setShowStations, icon: <MapPin className="w-3.5 h-3.5" />, label: `Stations (${filteredStations.length})` },
                { checked: showCorridors, onChange: setShowCorridors, icon: <Layers className="w-3.5 h-3.5" />, label: `Corridors (${filteredCorridors.length})` },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary" />
                  {item.icon}
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Zone Filter */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-3 flex-1 overflow-auto">
            <h3 className="text-sm font-semibold text-foreground mb-2">Railway Zones</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveZone(null)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${!activeZone ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                All Zones ({railwayZones.length})
              </button>
              {railwayZones.map(zone => (
                <button
                  key={zone.code}
                  onClick={() => setActiveZone(activeZone === zone.code ? null : zone.code)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeZone === zone.code ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                  <span className="truncate">{zone.code}</span>
                  <span className="ml-auto text-xs opacity-60">{zone.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-border/50 bg-card/80 p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Legend</h3>
            <div className="space-y-1.5 text-xs">
              {[
                { color: 'bg-yellow-500', label: 'Junction' },
                { color: 'bg-blue-500', label: 'Terminal' },
                { color: 'bg-emerald-500', label: 'City Station' },
                { color: 'bg-green-500 animate-pulse', label: 'Running Train' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-border/30">
                <span className="w-6 h-0.5 bg-yellow-500 rounded" />
                <span className="text-muted-foreground">Golden Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-blue-500 rounded" />
                <span className="text-muted-foreground">High Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gray-500 rounded border-dashed" style={{ borderTop: '1px dashed #6B7280', height: 0 }} />
                <span className="text-muted-foreground">Regional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map */}
        <div className="flex-1 rounded-xl border border-border/50 bg-card/30 overflow-hidden relative">
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ background: 'linear-gradient(180deg, oklch(0.13 0.02 250) 0%, oklch(0.10 0.02 250) 100%)' }}
          >
            <defs>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="oklch(0.3 0 0 / 0.06)" strokeWidth="0.015" />
              </pattern>
              <filter id="trainGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="0.12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#grid)" />

            {/* Corridors as polylines */}
            {showCorridors && filteredCorridors.map(corridor => {
              const pathD = corridor.points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[1]} ${p[0]}`)
                .join(' ');
              return (
                <path
                  key={corridor.id}
                  d={pathD}
                  fill="none"
                  stroke={getCorridorColor(corridor.type)}
                  strokeWidth={getCorridorWidth(corridor.type)}
                  strokeOpacity={corridor.type === 'Golden' ? 0.75 : corridor.type === 'High' ? 0.55 : 0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={corridor.type === 'Medium' ? '0.25,0.12' : 'none'}
                />
              );
            })}

            {/* Stations */}
            {showStations && filteredStations.map(station => {
              const r = getStationRadius(station);
              const color = getStationColor(station);
              const dimmed = activeZone && station.zone !== activeZone;
              return (
                <g
                  key={station.id}
                  className="cursor-pointer"
                  style={{ opacity: dimmed ? 0.2 : 1 }}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onClick={() => setSelectedStation(station)}
                >
                  {station.isJunction && (
                    <circle cx={station.lng} cy={station.lat} r={r + 0.07} fill="none" stroke={color} strokeWidth={0.025} strokeOpacity={0.45} />
                  )}
                  <circle cx={station.lng} cy={station.lat} r={r} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.025} />
                </g>
              );
            })}

            {/* Trains on corridors */}
            {showTrains && trainPositions.map(train => (
              <g
                key={train.id}
                filter="url(#trainGlow)"
                className="cursor-pointer"
                onClick={() => setSelectedTrain(train)}
              >
                <circle cx={train.pos[1]} cy={train.pos[0]} r={0.22} fill="none" stroke="#22C55E" strokeWidth={0.018} strokeOpacity={0.35} className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx={train.pos[1]} cy={train.pos[0]} r={0.09} fill="#22C55E" stroke="rgba(0,0,0,0.4)" strokeWidth={0.02} />
                <text x={train.pos[1]} y={train.pos[0] - 0.22} textAnchor="middle" fill="#22C55E" fontSize="0.28" fontWeight="bold" fontFamily="monospace">
                  {train.number}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredStation && (
            <div
              className="absolute pointer-events-none z-10 rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl"
              style={{
                left: `${((hoveredStation.lng - viewBox.x) / viewBox.width) * 100}%`,
                top: `${((hoveredStation.lat - viewBox.y) / viewBox.height) * 100 - 8}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-sm font-semibold text-foreground">{hoveredStation.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredStation.code} • {hoveredStation.zone} • {hoveredStation.division}</p>
            </div>
          )}

          {/* Station Detail Panel */}
          {selectedStation && (
            <div className="absolute right-4 top-4 w-72 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{selectedStation.name}</h3>
                <button onClick={() => setSelectedStation(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
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
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-mono text-xs">{value}</span>
                  </div>
                ))}
                {selectedStation.isJunction && (
                  <div className="mt-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs text-center font-medium">Major Junction</div>
                )}
              </div>
            </div>
          )}

          {/* Train Detail Panel */}
          {selectedTrain && (
            <div className="absolute right-4 top-4 w-72 rounded-xl border border-green-500/30 bg-card/95 backdrop-blur-md p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrainIcon className="w-4 h-4 text-green-500" />
                  <h3 className="font-semibold text-foreground">{selectedTrain.name}</h3>
                </div>
                <button onClick={() => setSelectedTrain(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
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
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-mono text-xs ${label === 'Delay' && selectedTrain.delay > 0 ? 'text-red-400' : label === 'Delay' ? 'text-green-400' : 'text-foreground'}`}>{value}</span>
                  </div>
                ))}
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${selectedTrain.progress * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Train Count Badge */}
          {showTrains && (
            <div className="absolute left-4 top-4 rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-foreground font-medium">{trainPositions.length} Live Trains</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
