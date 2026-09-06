import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Layers, Train as TrainIcon, RotateCw, AlertTriangle, ChevronRight } from 'lucide-react';

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
  headquarters: string;
  lat: number;
  lng: number;
  stationCount: number;
  color: string;
}

interface RailwayLine {
  id: string;
  name: string;
  from: string;
  to: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  type: string;
}

interface TrainData {
  id: string;
  name: string;
  number: string;
  lat: number;
  lng: number;
  status: string;
  speed: number;
  delay: number;
  zone: string;
}

// Indian Railway Zones
const railwayZones: RailwayZone[] = [
  { code: 'NR', name: 'Northern Railway', headquarters: 'New Delhi', lat: 28.6139, lng: 77.209, stationCount: 892, color: '#3B82F6' },
  { code: 'NCR', name: 'North Central Railway', headquarters: 'Prayagraj', lat: 25.4358, lng: 81.8463, stationCount: 521, color: '#10B981' },
  { code: 'NER', name: 'North Eastern Railway', headquarters: 'Gorakhpur', lat: 26.7606, lng: 83.3732, stationCount: 345, color: '#F59E0B' },
  { code: 'NFR', name: 'Northeast Frontier Railway', headquarters: 'Guwahati', lat: 26.1445, lng: 91.7362, stationCount: 287, color: '#EC4899' },
  { code: 'ER', name: 'Eastern Railway', headquarters: 'Kolkata', lat: 22.5726, lng: 88.3639, stationCount: 456, color: '#8B5CF6' },
  { code: 'ECR', name: 'East Central Railway', headquarters: 'Hajipur', lat: 25.6892, lng: 85.2097, stationCount: 312, color: '#06B6D4' },
  { code: 'SCR', name: 'South Central Railway', headquarters: 'Hyderabad', lat: 17.385, lng: 78.4867, stationCount: 623, color: '#EF4444' },
  { code: 'SR', name: 'Southern Railway', headquarters: 'Chennai', lat: 13.0827, lng: 80.2707, stationCount: 509, color: '#F97316' },
  { code: 'SWR', name: 'South Western Railway', headquarters: 'Hubballi', lat: 15.3647, lng: 75.124, stationCount: 445, color: '#84CC16' },
  { code: 'SECR', name: 'South East Central Railway', headquarters: 'Bilaspur', lat: 21.9091, lng: 82.3166, stationCount: 378, color: '#14B8A6' },
  { code: 'WCR', name: 'West Central Railway', headquarters: 'Jabalpur', lat: 23.1815, lng: 79.9864, stationCount: 334, color: '#A855F7' },
  { code: 'CR', name: 'Central Railway', headquarters: 'Mumbai', lat: 19.076, lng: 72.8777, stationCount: 543, color: '#2563EB' },
  { code: 'WR', name: 'Western Railway', headquarters: 'Mumbai', lat: 19.0596, lng: 72.8295, stationCount: 487, color: '#059669' },
  { code: 'NWR', name: 'North Western Railway', headquarters: 'Jaipur', lat: 26.9124, lng: 75.7873, stationCount: 412, color: '#DC2626' },
  { code: 'WCR2', name: 'West Central Railway 2', headquarters: 'Kota', lat: 25.2138, lng: 75.8648, stationCount: 289, color: '#7C3AED' },
  { code: 'SCR2', name: 'South Central Railway 2', headquarters: 'Vijayawada', lat: 16.5062, lng: 80.648, stationCount: 356, color: '#2563EB' },
  { code: 'DMR', name: 'Dimapur Division', headquarters: 'Dimapur', lat: 25.9058, lng: 93.7263, stationCount: 123, color: '#F59E0B' },
];

// Major stations across India with real coordinates
const majorStations: Station[] = [
  { id: 'NDLS', name: 'New Delhi', code: 'NDLS', lat: 28.6412, lng: 77.2189, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: true },
  { id: 'MAS', name: 'Chennai Central', code: 'MAS', lat: 13.0827, lng: 80.2707, zone: 'SR', division: 'Chennai', type: 'Terminal', isJunction: true },
  { id: 'HWH', name: 'Howrah Junction', code: 'HWH', lat: 22.5803, lng: 88.3467, zone: 'ER', division: 'Howrah', type: 'Terminal', isJunction: true },
  { id: 'BCT', name: 'Mumbai Central', code: 'BCT', lat: 19.0596, lng: 72.8295, zone: 'WR', division: 'Mumbai', type: 'Terminal', isJunction: true },
  { id: 'SBC', name: 'KSR Bengaluru', code: 'SBC', lat: 12.9784, lng: 77.5733, zone: 'SWR', division: 'Bangalore', type: 'Terminal', isJunction: true },
  { id: 'SC', name: 'Secunderabad', code: 'SC', lat: 17.4399, lng: 78.5016, zone: 'SCR', division: 'Secunderabad', type: 'Terminal', isJunction: true },
  { id: 'BBS', name: 'Bhubaneswar', code: 'BBS', lat: 20.2961, lng: 85.8245, zone: 'ECR', division: 'Khurda Road', type: 'City', isJunction: true },
  { id: 'GHY', name: 'Guwahati', code: 'GHY', lat: 26.1445, lng: 91.7362, zone: 'NFR', division: 'Guwahati', type: 'Terminal', isJunction: true },
  { id: 'PUNE', name: 'Pune Junction', code: 'PUNE', lat: 18.5204, lng: 73.8567, zone: 'CR', division: 'Pune', type: 'Junction', isJunction: true },
  { id: 'JP', name: 'Jaipur Junction', code: 'JP', lat: 26.9124, lng: 75.7873, zone: 'NWR', division: 'Jaipur', type: 'Junction', isJunction: true },
  { id: 'LKO', name: 'Lucknow', code: 'LKO', lat: 26.8467, lng: 80.9462, zone: 'NR', division: 'Lucknow', type: 'Terminal', isJunction: true },
  { id: 'CNB', name: 'Kanpur Central', code: 'CNB', lat: 26.4499, lng: 80.3319, zone: 'NER', division: 'Kanpur', type: 'Junction', isJunction: true },
  { id: 'ALY', name: 'Prayagraj', code: 'ALY', lat: 25.4358, lng: 81.8463, zone: 'NCR', division: 'Prayagraj', type: 'Junction', isJunction: true },
  { id: 'MFP', name: 'Muzaffarpur', code: 'MFP', lat: 26.1209, lng: 85.3647, zone: 'ECR', division: 'Sonpur', type: 'Junction', isJunction: true },
  { id: 'GKP', name: 'Gorakhpur', code: 'GKP', lat: 26.7606, lng: 83.3732, zone: 'NER', division: 'Gorakhpur', type: 'Junction', isJunction: true },
  { id: 'NDLS2', name: 'Delhi Sarai Rohilla', code: 'DEE', lat: 28.6507, lng: 77.2334, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'AGC', name: 'Agra Cantt', code: 'AGC', lat: 27.1767, lng: 78.0081, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'JHS', name: 'Jhansi', code: 'JHS', lat: 25.4484, lng: 78.5685, zone: 'NCR', division: 'Jhansi', type: 'Junction', isJunction: true },
  { id: 'BPL', name: 'Bhopal Junction', code: 'BPL', lat: 23.2599, lng: 77.4126, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'NGP', name: 'Nagpur', code: 'NGP', lat: 21.1458, lng: 79.0882, zone: 'CR', division: 'Nagpur', type: 'Junction', isJunction: true },
  { id: 'BSL', name: 'Bhusaval', code: 'BSL', lat: 21.0434, lng: 75.7849, zone: 'CR', division: 'Bhusaval', type: 'Junction', isJunction: true },
  { id: 'SUR', name: 'Solapur', code: 'SUR', lat: 17.6599, lng: 75.9064, zone: 'CR', division: 'Solapur', type: 'Junction', isJunction: true },
  { id: 'NZM', name: 'Hazrat Nizamuddin', code: 'NZM', lat: 28.5906, lng: 77.2505, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'ANVT', name: 'Anand Vihar Terminal', code: 'ANVT', lat: 28.6262, lng: 77.2983, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'ADI', name: 'Ahmedabad Junction', code: 'ADI', lat: 23.0225, lng: 72.5714, zone: 'WR', division: 'Ahmedabad', type: 'Junction', isJunction: true },
  { id: 'RTM', name: 'Ratlam Junction', code: 'RTM', lat: 23.3343, lng: 75.0373, zone: 'WR', division: 'Ratlam', type: 'Junction', isJunction: true },
  { id: 'BRC', name: 'Vadodara Junction', code: 'BRC', lat: 22.3072, lng: 73.1812, zone: 'WR', division: 'Vadodara', type: 'Junction', isJunction: true },
  { id: 'ST', name: 'Surat', code: 'ST', lat: 21.1702, lng: 72.8311, zone: 'WR', division: 'Mumbai', type: 'Junction', isJunction: true },
  { id: 'NAN', name: 'Nanded', code: 'NED', lat: 19.1587, lng: 77.3178, zone: 'SCR', division: 'Nanded', type: 'Junction', isJunction: true },
  { id: 'KZJ', name: 'Karimnagar', code: 'KZJ', lat: 18.4386, lng: 79.1288, zone: 'SCR', division: 'Secunderabad', type: 'City', isJunction: false },
  { id: 'VSKP', name: 'Visakhapatnam', code: 'VSKP', lat: 17.6868, lng: 83.2185, zone: 'ECR', division: 'Waltair', type: 'Junction', isJunction: true },
  { id: 'Vijayawada', name: 'Vijayawada Junction', code: 'BZA', lat: 16.5062, lng: 80.648, zone: 'SCR2', division: 'Vijayawada', type: 'Junction', isJunction: true },
  { id: 'TPTY', name: 'Tirupati', code: 'TPTY', lat: 13.6288, lng: 79.4192, zone: 'SCR', division: 'Guntakal', type: 'Junction', isJunction: true },
  { id: 'GNT', name: 'Guntur Junction', code: 'GNT', lat: 16.3097, lng: 80.4373, zone: 'SCR2', division: 'Guntur', type: 'Junction', isJunction: true },
  { id: 'QLN', name: 'Kollam Junction', code: 'QLN', lat: 8.8932, lng: 76.6141, zone: 'SR', division: 'Trivandrum', type: 'Junction', isJunction: true },
  { id: 'TVC', name: 'Trivandrum Central', code: 'TVC', lat: 8.5241, lng: 76.9366, zone: 'SR', division: 'Trivandrum', type: 'Terminal', isJunction: true },
  { id: 'TCR', name: 'Thrissur', code: 'TCR', lat: 10.527, lng: 76.2144, zone: 'SR', division: 'Trivandrum', type: 'Junction', isJunction: true },
  { id: 'MAQ', name: 'Mangalore Junction', code: 'MAQ', lat: 12.9141, lng: 74.856, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'CGL', name: 'Chengalpattu', code: 'CGL', lat: 12.6914, lng: 79.9774, zone: 'SR', division: 'Chennai', type: 'Junction', isJunction: true },
  { id: 'MS', name: 'Chennai Egmore', code: 'MS', lat: 13.08, lng: 80.2586, zone: 'SR', division: 'Chennai', type: 'Terminal', isJunction: false },
  { id: 'KPD', name: 'Katpadi Junction', code: 'KPD', lat: 12.9933, lng: 79.1422, zone: 'SR', division: 'Chennai', type: 'Junction', isJunction: true },
  { id: 'SA', name: 'Salem Junction', code: 'SA', lat: 11.6643, lng: 78.146, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'ED', name: 'Erode Junction', code: 'ED', lat: 11.341, lng: 77.7172, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'CBE', name: 'Coimbatore Junction', code: 'CBE', lat: 11.0054, lng: 76.9718, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'MDU', name: 'Madurai Junction', code: 'MDU', lat: 9.9252, lng: 78.1198, zone: 'SR', division: 'Madurai', type: 'Junction', isJunction: true },
  { id: 'TN', name: 'Tuticorin', code: 'TN', lat: 8.7642, lng: 78.1348, zone: 'SR', division: 'Madurai', type: 'Terminal', isJunction: false },
  { id: 'Kanya', name: 'Kanyakumari', code: 'CAPE', lat: 8.0883, lng: 77.5385, zone: 'SR', division: 'Madurai', type: 'Terminal', isJunction: false },
  { id: 'JRC', name: 'Jalandhar City', code: 'JUC', lat: 31.326, lng: 75.5762, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'LDH', name: 'Ludhiana Junction', code: 'LDH', lat: 30.901, lng: 75.8573, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'ASR', name: 'Amritsar Junction', code: 'ASR', lat: 31.634, lng: 74.8723, zone: 'NR', division: 'Firozpur', type: 'Terminal', isJunction: true },
  { id: 'CDG', name: 'Chandigarh Junction', code: 'CDG', lat: 30.7333, lng: 76.7794, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'UMB', name: 'Ambala Cantt Junction', code: 'UMB', lat: 30.3272, lng: 76.8179, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'KLK', name: 'Kalka', code: 'KLK', lat: 30.8354, lng: 76.9386, zone: 'NR', division: 'Ambala', type: 'Terminal', isJunction: false },
  { id: 'MCTM', name: 'Muzzafarpur Junction', code: 'MCTM', lat: 26.1209, lng: 85.3647, zone: 'ECR', division: 'Sonpur', type: 'Junction', isJunction: true },
  { id: 'HJP', name: 'Hajipur Junction', code: 'HJP', lat: 25.6892, lng: 85.2097, zone: 'ECR', division: 'Hajipur', type: 'Junction', isJunction: true },
  { id: 'BJU', name: 'Barauni Junction', code: 'BJU', lat: 25.7268, lng: 85.8742, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'SPJ', name: 'Samastipur Junction', code: 'SPJ', lat: 25.8989, lng: 85.779, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'DBG', name: 'Darbhanga Junction', code: 'DBG', lat: 26.1542, lng: 86.0772, zone: 'NER', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'JYG', name: 'Jaynagar', code: 'JYG', lat: 26.5863, lng: 86.1467, zone: 'NER', division: 'Samastipur', type: 'Terminal', isJunction: false },
  { id: 'RNC', name: 'Ranchi Junction', code: 'RNC', lat: 23.3441, lng: 85.3096, zone: 'ECR', division: 'Ranchi', type: 'Junction', isJunction: true },
  { id: 'BKSC', name: 'Bokaro Steel City', code: 'BKSC', lat: 23.6693, lng: 86.1512, zone: 'ECR', division: 'Adra', type: 'City', isJunction: false },
  { id: 'ADRA', name: 'Adra Junction', code: 'ADRA', lat: 23.4956, lng: 86.7014, zone: 'ECR', division: 'Adra', type: 'Junction', isJunction: true },
  { id: 'TATA', name: 'Tatanagar Junction', code: 'TATA', lat: 22.7788, lng: 86.2029, zone: 'ECR', division: 'Chakradharpur', type: 'Junction', isJunction: true },
  { id: 'CKP', name: 'Chakradharpur', code: 'CKP', lat: 22.7003, lng: 86.4736, zone: 'ECR', division: 'Chakradharpur', type: 'Junction', isJunction: true },
  { id: 'PURI', name: 'Puri', code: 'PURI', lat: 19.8135, lng: 85.8312, zone: 'ECR', division: 'Khurda Road', type: 'Terminal', isJunction: false },
  { id: 'BBS2', name: 'Bhubaneswar', code: 'BBS', lat: 20.2961, lng: 85.8245, zone: 'ECR', division: 'Khurda Road', type: 'Junction', isJunction: true },
  { id: 'CTC', name: 'Cuttack', code: 'CTC', lat: 20.4625, lng: 85.883, zone: 'ECR', division: 'Khurda Road', type: 'Junction', isJunction: true },
  { id: 'SBP', name: 'Sambalpur Junction', code: 'SBP', lat: 21.4669, lng: 83.9812, zone: 'ECR', division: 'Sambalpur', type: 'Junction', isJunction: true },
  { id: 'ROU', name: 'Rourkela', code: 'ROU', lat: 22.2604, lng: 84.8636, zone: 'ECR', division: 'Chakradharpur', type: 'City', isJunction: false },
  { id: 'JSG', name: 'Jharsuguda Junction', code: 'JSG', lat: 21.8481, lng: 84.0163, zone: 'ECR', division: 'Sambalpur', type: 'Junction', isJunction: true },
  { id: 'BSP', name: 'Bilaspur Junction', code: 'BSP', lat: 21.9091, lng: 82.3166, zone: 'SECR', division: 'Bilaspur', type: 'Junction', isJunction: true },
  { id: 'R', name: 'Raipur Junction', code: 'R', lat: 21.2514, lng: 81.6296, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'DURG', name: 'Durg Junction', code: 'DURG', lat: 21.1916, lng: 81.2844, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'JBP', name: 'Jabalpur', code: 'JBP', lat: 23.1815, lng: 79.9864, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'BRC2', name: 'Katni Junction', code: 'KTE', lat: 23.7354, lng: 80.7967, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'KMZ', name: 'Katni Murwara', code: 'KMZ', lat: 23.7354, lng: 80.7967, zone: 'WCR', division: 'Jabalpur', type: 'City', isJunction: false },
  { id: 'ET', name: 'Itarsi Junction', code: 'ET', lat: 22.6145, lng: 77.7563, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'HBJ', name: 'Habibganj', code: 'HBJ', lat: 23.2317, lng: 77.4013, zone: 'WCR', division: 'Bhopal', type: 'Terminal', isJunction: false },
  { id: 'KOTA', name: 'Kota Junction', code: 'KOTA', lat: 25.2138, lng: 75.8648, zone: 'WCR2', division: 'Kota', type: 'Junction', isJunction: true },
  { id: 'SWM', name: 'Sawai Madhopur', code: 'SWM', lat: 26.0218, lng: 76.3466, zone: 'WCR2', division: 'Kota', type: 'Junction', isJunction: true },
  { id: 'BTI', name: 'Bathinda Junction', code: 'BTI', lat: 30.207, lng: 74.9521, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'HSR', name: 'Hisar Junction', code: 'HSR', lat: 29.1492, lng: 75.7217, zone: 'NR', division: 'Bhatinda', type: 'Junction', isJunction: true },
  { id: 'RE', name: 'Rewari Junction', code: 'RE', lat: 28.3027, lng: 76.6189, zone: 'NR', division: 'Delhi', type: 'Junction', isJunction: true },
  { id: 'BNW', name: 'Bhiwani', code: 'BNW', lat: 28.793, lng: 76.1389, zone: 'NR', division: 'Bhatinda', type: 'City', isJunction: false },
  { id: 'RSG', name: 'Ramagundam', code: 'RDM', lat: 18.8, lng: 79.47, zone: 'SCR', division: 'Nizamabad', type: 'City', isJunction: false },
  { id: 'KZJ2', name: 'Karimnagar', code: 'KRMR', lat: 18.4386, lng: 79.1288, zone: 'SCR', division: 'Nizamabad', type: 'City', isJunction: false },
  { id: 'AWB', name: 'Aurangabad', code: 'AWB', lat: 19.8762, lng: 75.3433, zone: 'CR', division: 'Solapur', type: 'City', isJunction: false },
  { id: 'LTT', name: 'Lokmanya Tilak Terminus', code: 'LTT', lat: 19.0624, lng: 72.8893, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },
  { id: 'CSTM', name: 'Chhatrapati Shivaji Terminus', code: 'CSTM', lat: 18.9398, lng: 72.8355, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },
  { id: 'PNVL', name: 'Panvel', code: 'PNVL', lat: 18.9897, lng: 73.1103, zone: 'CR', division: 'Mumbai', type: 'Junction', isJunction: true },
  { id: 'KOP', name: 'Kolhapur', code: 'KOP', lat: 16.705, lng: 74.2433, zone: 'CR', division: 'Pune', type: 'Terminal', isJunction: false },
  { id: 'MRJ', name: 'Miraj Junction', code: 'MRJ', lat: 16.8294, lng: 74.6366, zone: 'CR', division: 'Pune', type: 'Junction', isJunction: true },
  { id: 'UDR', name: 'Udaipur City', code: 'UDZ', lat: 24.5854, lng: 73.7125, zone: 'NWR', division: 'Ajmer', type: 'Terminal', isJunction: false },
  { id: 'AII', name: 'Ajmer Junction', code: 'AII', lat: 26.4499, lng: 74.6399, zone: 'NWR', division: 'Ajmer', type: 'Junction', isJunction: true },
  { id: 'BKN', name: 'Bikaner Junction', code: 'BKN', lat: 28.0229, lng: 73.322, zone: 'NWR', division: 'Bikaner', type: 'Junction', isJunction: true },
  { id: 'JU', name: 'Jodhpur Junction', code: 'JU', lat: 26.2389, lng: 73.0243, zone: 'NWR', division: 'Jodhpur', type: 'Junction', isJunction: true },
  { id: 'MTJ', name: 'Mathura Junction', code: 'MTJ', lat: 27.4924, lng: 77.6737, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'ETW', name: 'Etawah Junction', code: 'ETW', lat: 26.7822, lng: 79.0232, zone: 'NCR', division: 'Prayagraj', type: 'Junction', isJunction: true },
  { id: 'FBD', name: 'Firozabad', code: 'FZD', lat: 27.1594, lng: 78.3957, zone: 'NCR', division: 'Agra', type: 'City', isJunction: false },
  { id: 'BVRM', name: 'Bhubaramukam', code: 'BVRM', lat: 16.5401, lng: 80.5957, zone: 'SCR2', division: 'Guntur', type: 'City', isJunction: false },
  { id: 'TPTY2', name: 'Tirupati', code: 'TPTY', lat: 13.6288, lng: 79.4192, zone: 'SCR', division: 'Guntakal', type: 'Terminal', isJunction: false },
];

// Railway corridors connecting major stations
const railwayCorridors: RailwayLine[] = [
  { id: 'delhi-chennai', name: 'Delhi-Chennai Grand Trunk', from: 'NDLS', to: 'MAS', fromCoords: [28.6412, 77.2189], toCoords: [13.0827, 80.2707], type: 'Golden' },
  { id: 'delhi-howrah', name: 'Delhi-Howrah Rajdhani', from: 'NDLS', to: 'HWH', fromCoords: [28.6412, 77.2189], toCoords: [22.5803, 88.3467], type: 'Golden' },
  { id: 'mumbai-delhi', name: 'Mumbai-Delhi Rajdhani', from: 'BCT', to: 'NDLS', fromCoords: [19.0596, 72.8295], toCoords: [28.6412, 77.2189], type: 'Golden' },
  { id: 'delhi-kolkata', name: 'Delhi-Kolkata Corridor', from: 'NDLS', to: 'HWH', fromCoords: [28.6412, 77.2189], toCoords: [22.5803, 88.3467], type: 'High' },
  { id: 'mumbai-chennai', name: 'Mumbai-Chennai', from: 'CSTM', to: 'MAS', fromCoords: [18.9398, 72.8355], toCoords: [13.0827, 80.2707], type: 'High' },
  { id: 'howrah-chennai', name: 'Howrah-Chennai', from: 'HWH', to: 'MAS', fromCoords: [22.5803, 88.3467], toCoords: [13.0827, 80.2707], type: 'High' },
  { id: 'mumbai-bangalore', name: 'Mumbai-Bangalore', from: 'CSTM', to: 'SBC', fromCoords: [18.9398, 72.8355], toCoords: [12.9784, 77.5733], type: 'Medium' },
  { id: 'delhi-jaipur', name: 'Delhi-Jaipur', from: 'NDLS', to: 'JP', fromCoords: [28.6412, 77.2189], toCoords: [26.9124, 75.7873], type: 'Medium' },
  { id: 'delhi-lucknow', name: 'Delhi-Lucknow', from: 'NDLS', to: 'LKO', fromCoords: [28.6412, 77.2189], toCoords: [26.8467, 80.9462], type: 'High' },
  { id: 'mumbai-ahmedabad', name: 'Mumbai-Ahmedabad', from: 'CSTM', to: 'ADI', fromCoords: [18.9398, 72.8355], toCoords: [23.0225, 72.5714], type: 'High' },
  { id: 'chennai-bangalore', name: 'Chennai-Bangalore', from: 'MAS', to: 'SBC', fromCoords: [13.0827, 80.2707], toCoords: [12.9784, 77.5733], type: 'High' },
  { id: 'kolkata-bhubaneswar', name: 'Kolkata-Bhubaneswar', from: 'HWH', to: 'BBS', fromCoords: [22.5803, 88.3467], toCoords: [20.2961, 85.8245], type: 'Medium' },
  { id: 'nagpur-raipur', name: 'Nagpur-Raipur', from: 'NGP', to: 'R', fromCoords: [21.1458, 79.0882], toCoords: [21.2514, 81.6296], type: 'Medium' },
  { id: 'pune-hyderabad', name: 'Pune-Hyderabad', from: 'PUNE', to: 'SC', fromCoords: [18.5204, 73.8567], toCoords: [17.4399, 78.5016], type: 'Medium' },
  { id: 'bhopal-jabalpur', name: 'Bhopal-Jabalpur', from: 'BPL', to: 'JBP', fromCoords: [23.2599, 77.4126], toCoords: [23.1815, 79.9864], type: 'Medium' },
];

// Simulated train positions along corridors
const demoTrains: TrainData[] = [
  { id: '12301', name: 'Howrah Rajdhani', number: '12301', lat: 24.5, lng: 82.3, status: 'Running', speed: 110, delay: 15, zone: 'ECR' },
  { id: '12951', name: 'Mumbai Rajdhani', number: '12951', lat: 22.8, lng: 76.5, status: 'Running', speed: 120, delay: 0, zone: 'WCR' },
  { id: '12002', name: 'New Delhi - Bhopal Shatabdi', number: '12002', lat: 26.2, lng: 78.8, status: 'Running', speed: 130, delay: 5, zone: 'NCR' },
  { id: '12625', name: 'Kerala Express', number: '12625', lat: 15.8, lng: 78.2, status: 'Running', speed: 95, delay: 22, zone: 'SCR' },
  { id: '12259', name: 'Sealdah Duronto', number: '12259', lat: 21.5, lng: 85.8, status: 'Running', speed: 105, delay: 8, zone: 'ECR' },
  { id: '12985', name: 'Delhi - Jaipur Superfast', number: '12985', lat: 27.8, lng: 76.2, status: 'Running', speed: 100, delay: 0, zone: 'NWR' },
  { id: '12621', name: 'Tamil Nadu Express', number: '12621', lat: 19.2, lng: 79.5, status: 'Running', speed: 90, delay: 35, zone: 'CR' },
  { id: '12010', name: 'Ahmedabad - Mumbai Shatabdi', number: '12010', lat: 21.2, lng: 72.8, status: 'Running', speed: 125, delay: 0, zone: 'WR' },
  { id: '12553', name: 'Vaishali Express', number: '12553', lat: 25.5, lng: 84.2, status: 'Running', speed: 85, delay: 18, zone: 'ECR' },
  { id: '12311', name: 'Kalka Mail', number: '12311', lat: 29.8, lng: 77.5, status: 'Running', speed: 80, delay: 0, zone: 'NR' },
];

export default function RailwayMapView() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [trains, setTrains] = useState(demoTrains);
  const [loading, setLoading] = useState(false);
  const [viewBox, setViewBox] = useState({ x: 68, y: 6, width: 24, height: 28 });

  const filteredStations = useMemo(() => {
    if (!activeZone) return majorStations;
    return majorStations.filter(s => s.zone === activeZone);
  }, [activeZone]);

  const filteredCorridors = useMemo(() => {
    if (!activeZone) return railwayCorridors;
    return railwayCorridors.filter(c => {
      const fromStation = majorStations.find(s => s.code === c.from);
      const toStation = majorStations.find(s => s.code === c.to);
      return fromStation?.zone === activeZone || toStation?.zone === activeZone;
    });
  }, [activeZone]);

  const handleRefreshTrains = async () => {
    setLoading(true);
    // Simulate refreshing train positions
    setTimeout(() => {
      setTrains(prev => prev.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.5,
        lng: t.lng + (Math.random() - 0.5) * 0.5,
        speed: Math.max(60, Math.min(140, t.speed + (Math.random() - 0.5) * 20)),
        delay: Math.max(0, t.delay + Math.floor((Math.random() - 0.5) * 10)),
      })));
      setLoading(false);
    }, 1500);
  };

  const getStationColor = (station: Station) => {
    if (activeZone && station.zone !== activeZone) return '#475569';
    if (station.isJunction) return '#F59E0B';
    if (station.type === 'Terminal') return '#3B82F6';
    return '#10B981';
  };

  const getStationRadius = (station: Station) => {
    if (station.isJunction) return 4;
    if (station.type === 'Terminal') return 3.5;
    return 2.5;
  };

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
            {majorStations.length} stations • {railwayCorridors.length} corridors • {railwayZones.length} zones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshTrains}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Trains'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Panel - Zones & Controls */}
        <div className="w-64 flex flex-col gap-3">
          {/* Layer Toggles */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrains}
                  onChange={(e) => setShowTrains(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <TrainIcon className="w-3.5 h-3.5" />
                Live Trains ({trains.length})
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStations}
                  onChange={(e) => setShowStations(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <MapPin className="w-3.5 h-3.5" />
                Stations ({filteredStations.length})
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCorridors}
                  onChange={(e) => setShowCorridors(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <Layers className="w-3.5 h-3.5" />
                Corridors ({filteredCorridors.length})
              </label>
            </div>
          </div>

          {/* Zone Filter */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-3 flex-1 overflow-auto">
            <h3 className="text-sm font-semibold text-foreground mb-2">Railway Zones</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveZone(null)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  !activeZone ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                All Zones ({railwayZones.length})
              </button>
              {railwayZones.map(zone => (
                <button
                  key={zone.code}
                  onClick={() => setActiveZone(activeZone === zone.code ? null : zone.code)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeZone === zone.code ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="truncate">{zone.code}</span>
                  <span className="ml-auto text-xs opacity-60">{zone.stationCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Legend</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Junction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Terminal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">City Station</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground">Running Train</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 rounded-xl border border-border/50 bg-card/30 overflow-hidden relative">
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-full"
            style={{ background: 'linear-gradient(180deg, oklch(0.15 0.02 250) 0%, oklch(0.12 0.02 250) 100%)' }}
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="oklch(0.3 0 0 / 0.1)" strokeWidth="0.02" />
              </pattern>
            </defs>
            <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#grid)" />

            {/* Railway Corridors */}
            {showCorridors && filteredCorridors.map(corridor => {
              const opacity = corridor.type === 'Golden' ? 0.8 : corridor.type === 'High' ? 0.6 : 0.4;
              const strokeWidth = corridor.type === 'Golden' ? 0.15 : corridor.type === 'High' ? 0.1 : 0.08;
              const color = corridor.type === 'Golden' ? '#F59E0B' : corridor.type === 'High' ? '#3B82F6' : '#6B7280';
              return (
                <line
                  key={corridor.id}
                  x1={corridor.fromCoords[1]}
                  y1={corridor.fromCoords[0]}
                  x2={corridor.toCoords[1]}
                  y2={corridor.toCoords[0]}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeDasharray={corridor.type === 'Medium' ? '0.2,0.1' : 'none'}
                />
              );
            })}

            {/* Stations */}
            {showStations && filteredStations.map(station => (
              <g key={station.id}>
                <circle
                  cx={station.lng}
                  cy={station.lat}
                  r={getStationRadius(station)}
                  fill={getStationColor(station)}
                  stroke="oklch(0.1 0 0)"
                  strokeWidth={0.08}
                  className="cursor-pointer transition-all hover:opacity-100"
                  style={{ opacity: activeZone && station.zone !== activeZone ? 0.3 : 1 }}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onClick={() => setSelectedStation(station)}
                />
                {station.isJunction && (
                  <circle
                    cx={station.lng}
                    cy={station.lat}
                    r={getStationRadius(station) + 1.5}
                    fill="none"
                    stroke={getStationColor(station)}
                    strokeWidth={0.05}
                    strokeOpacity={0.4}
                  />
                )}
              </g>
            ))}

            {/* Trains */}
            {showTrains && trains.map(train => (
              <g key={train.id}>
                <circle
                  cx={train.lng}
                  cy={train.lat}
                  r={2}
                  fill="#22C55E"
                  stroke="oklch(0.1 0 0)"
                  strokeWidth={0.1}
                  className="animate-pulse"
                />
                <circle
                  cx={train.lng}
                  cy={train.lat}
                  r={3.5}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={0.05}
                  strokeOpacity={0.3}
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredStation && (
            <div
              className="absolute pointer-events-none z-10 rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl"
              style={{
                left: `${((hoveredStation.lng - viewBox.x) / viewBox.width) * 100}%`,
                top: `${((hoveredStation.lat - viewBox.y) / viewBox.height) * 100 - 12}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="text-sm font-semibold text-foreground">{hoveredStation.name}</p>
              <p className="text-xs text-muted-foreground">
                {hoveredStation.code} • {hoveredStation.zone} • {hoveredStation.division}
              </p>
            </div>
          )}

          {/* Station Detail Panel */}
          {selectedStation && (
            <div className="absolute right-4 top-4 w-72 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{selectedStation.name}</h3>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Station Code</span>
                  <span className="text-foreground font-mono">{selectedStation.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="text-foreground">{selectedStation.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Division</span>
                  <span className="text-foreground">{selectedStation.division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground">{selectedStation.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates</span>
                  <span className="text-foreground font-mono text-xs">
                    {selectedStation.lat.toFixed(4)}, {selectedStation.lng.toFixed(4)}
                  </span>
                </div>
                {selectedStation.isJunction && (
                  <div className="mt-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs text-center font-medium">
                    Major Junction
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Train Count Badge */}
          {showTrains && (
            <div className="absolute left-4 top-4 rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-foreground font-medium">{trains.length} Live Trains</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
