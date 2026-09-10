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
];

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
  { id: 'GKP', name: 'Gorakhpur', code: 'GKP', lat: 26.7606, lng: 83.3732, zone: 'NER', division: 'Gorakhpur', type: 'Junction', isJunction: true },
  { id: 'AGC', name: 'Agra Cantt', code: 'AGC', lat: 27.1767, lng: 78.0081, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'JHS', name: 'Jhansi', code: 'JHS', lat: 25.4484, lng: 78.5685, zone: 'NCR', division: 'Jhansi', type: 'Junction', isJunction: true },
  { id: 'BPL', name: 'Bhopal Junction', code: 'BPL', lat: 23.2599, lng: 77.4126, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'NGP', name: 'Nagpur', code: 'NGP', lat: 21.1458, lng: 79.0882, zone: 'CR', division: 'Nagpur', type: 'Junction', isJunction: true },
  { id: 'ADI', name: 'Ahmedabad Junction', code: 'ADI', lat: 23.0225, lng: 72.5714, zone: 'WR', division: 'Ahmedabad', type: 'Junction', isJunction: true },
  { id: 'BRC', name: 'Vadodara Junction', code: 'BRC', lat: 22.3072, lng: 73.1812, zone: 'WR', division: 'Vadodara', type: 'Junction', isJunction: true },
  { id: 'NZM', name: 'Hazrat Nizamuddin', code: 'NZM', lat: 28.5906, lng: 77.2505, zone: 'NR', division: 'Delhi', type: 'Terminal', isJunction: false },
  { id: 'ASR', name: 'Amritsar Junction', code: 'ASR', lat: 31.634, lng: 74.8723, zone: 'NR', division: 'Firozpur', type: 'Terminal', isJunction: true },
  { id: 'LDH', name: 'Ludhiana Junction', code: 'LDH', lat: 30.901, lng: 75.8573, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'CDG', name: 'Chandigarh Junction', code: 'CDG', lat: 30.7333, lng: 76.7794, zone: 'NR', division: 'Ambala', type: 'Junction', isJunction: true },
  { id: 'JU', name: 'Jodhpur Junction', code: 'JU', lat: 26.2389, lng: 73.0243, zone: 'NWR', division: 'Jodhpur', type: 'Junction', isJunction: true },
  { id: 'BKN', name: 'Bikaner Junction', code: 'BKN', lat: 28.0229, lng: 73.322, zone: 'NWR', division: 'Bikaner', type: 'Junction', isJunction: true },
  { id: 'UDR', name: 'Udaipur City', code: 'UDZ', lat: 24.5854, lng: 73.7125, zone: 'NWR', division: 'Ajmer', type: 'Terminal', isJunction: false },
  { id: 'AII', name: 'Ajmer Junction', code: 'AII', lat: 26.4499, lng: 74.6399, zone: 'NWR', division: 'Ajmer', type: 'Junction', isJunction: true },
  { id: 'MTJ', name: 'Mathura Junction', code: 'MTJ', lat: 27.4924, lng: 77.6737, zone: 'NCR', division: 'Agra', type: 'Junction', isJunction: true },
  { id: 'CSTM', name: 'Chhatrapati Shivaji Terminus', code: 'CSTM', lat: 18.9398, lng: 72.8355, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },
  { id: 'LTT', name: 'Lokmanya Tilak Terminus', code: 'LTT', lat: 19.0624, lng: 72.8893, zone: 'CR', division: 'Mumbai', type: 'Terminal', isJunction: false },
  { id: 'NGP', name: 'Nagpur Junction', code: 'NGP', lat: 21.1458, lng: 79.0882, zone: 'CR', division: 'Nagpur', type: 'Junction', isJunction: true },
  { id: 'BSP', name: 'Bilaspur Junction', code: 'BSP', lat: 21.9091, lng: 82.3166, zone: 'SECR', division: 'Bilaspur', type: 'Junction', isJunction: true },
  { id: 'R', name: 'Raipur Junction', code: 'R', lat: 21.2514, lng: 81.6296, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'JBP', name: 'Jabalpur', code: 'JBP', lat: 23.1815, lng: 79.9864, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
  { id: 'ET', name: 'Itarsi Junction', code: 'ET', lat: 22.6145, lng: 77.7563, zone: 'WCR', division: 'Bhopal', type: 'Junction', isJunction: true },
  { id: 'HJP', name: 'Hajipur Junction', code: 'HJP', lat: 25.6892, lng: 85.2097, zone: 'ECR', division: 'Hajipur', type: 'Junction', isJunction: true },
  { id: 'BJU', name: 'Barauni Junction', code: 'BJU', lat: 25.7268, lng: 85.8742, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'SPJ', name: 'Samastipur Junction', code: 'SPJ', lat: 25.8989, lng: 85.779, zone: 'ECR', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'MFP', name: 'Muzaffarpur', code: 'MFP', lat: 26.1209, lng: 85.3647, zone: 'ECR', division: 'Sonpur', type: 'Junction', isJunction: true },
  { id: 'RNC', name: 'Ranchi Junction', code: 'RNC', lat: 23.3441, lng: 85.3096, zone: 'ECR', division: 'Ranchi', type: 'Junction', isJunction: true },
  { id: 'TATA', name: 'Tatanagar Junction', code: 'TATA', lat: 22.7788, lng: 86.2029, zone: 'ECR', division: 'Chakradharpur', type: 'Junction', isJunction: true },
  { id: 'PURI', name: 'Puri', code: 'PURI', lat: 19.8135, lng: 85.8312, zone: 'ECR', division: 'Khurda Road', type: 'Terminal', isJunction: false },
  { id: 'VSKP', name: 'Visakhapatnam', code: 'VSKP', lat: 17.6868, lng: 83.2185, zone: 'ECR', division: 'Waltair', type: 'Junction', isJunction: true },
  { id: 'BZA', name: 'Vijayawada Junction', code: 'BZA', lat: 16.5062, lng: 80.648, zone: 'SCR', division: 'Vijayawada', type: 'Junction', isJunction: true },
  { id: 'TPTY', name: 'Tirupati', code: 'TPTY', lat: 13.6288, lng: 79.4192, zone: 'SCR', division: 'Guntakal', type: 'Junction', isJunction: true },
  { id: 'SA', name: 'Salem Junction', code: 'SA', lat: 11.6643, lng: 78.146, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'ED', name: 'Erode Junction', code: 'ED', lat: 11.341, lng: 77.7172, zone: 'SR', division: 'Salem', type: 'Junction', isJunction: true },
  { id: 'CBE', name: 'Coimbatore Junction', code: 'CBE', lat: 11.0054, lng: 76.9718, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'MDU', name: 'Madurai Junction', code: 'MDU', lat: 9.9252, lng: 78.1198, zone: 'SR', division: 'Madurai', type: 'Junction', isJunction: true },
  { id: 'TVC', name: 'Trivandrum Central', code: 'TVC', lat: 8.5241, lng: 76.9366, zone: 'SR', division: 'Trivandrum', type: 'Terminal', isJunction: true },
  { id: 'CAPE', name: 'Kanyakumari', code: 'CAPE', lat: 8.0883, lng: 77.5385, zone: 'SR', division: 'Madurai', type: 'Terminal', isJunction: false },
  { id: 'MAQ', name: 'Mangalore Junction', code: 'MAQ', lat: 12.9141, lng: 74.856, zone: 'SR', division: 'Palakkad', type: 'Junction', isJunction: true },
  { id: 'PPTA', name: 'Patna Junction', code: 'PPTA', lat: 25.6093, lng: 85.1376, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'DBG', name: 'Darbhanga Junction', code: 'DBG', lat: 26.1542, lng: 86.0772, zone: 'NER', division: 'Samastipur', type: 'Junction', isJunction: true },
  { id: 'DNR', name: 'Danapur', code: 'DNR', lat: 25.6276, lng: 85.0417, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'GAYA', name: 'Gaya Junction', code: 'GAYA', lat: 24.7963, lng: 85.0063, zone: 'ECR', division: 'Danapur', type: 'Junction', isJunction: true },
  { id: 'MGS', name: 'Mughal Sarai Junction', code: 'MGS', lat: 25.2817, lng: 83.1161, zone: 'NCR', division: 'Pt. Deen Dayal Upadhyaya', type: 'Junction', isJunction: true },
  { id: 'SBP', name: 'Sambalpur Junction', code: 'SBP', lat: 21.4669, lng: 83.9812, zone: 'ECR', division: 'Sambalpur', type: 'Junction', isJunction: true },
  { id: 'JSG', name: 'Jharsuguda Junction', code: 'JSG', lat: 21.8481, lng: 84.0163, zone: 'ECR', division: 'Sambalpur', type: 'Junction', isJunction: true },
  { id: 'RTM', name: 'Ratlam Junction', code: 'RTM', lat: 23.3343, lng: 75.0373, zone: 'WR', division: 'Ratlam', type: 'Junction', isJunction: true },
  { id: 'ST', name: 'Surat', code: 'ST', lat: 21.1702, lng: 72.8311, zone: 'WR', division: 'Mumbai', type: 'Junction', isJunction: true },
  { id: 'KOTA', name: 'Kota Junction', code: 'KOTA', lat: 25.2138, lng: 75.8648, zone: 'WCR', division: 'Kota', type: 'Junction', isJunction: true },
  { id: 'AWB', name: 'Aurangabad', code: 'AWB', lat: 19.8762, lng: 75.3433, zone: 'CR', division: 'Solapur', type: 'City', isJunction: false },
  { id: 'SUR', name: 'Solapur', code: 'SUR', lat: 17.6599, lng: 75.9064, zone: 'CR', division: 'Solapur', type: 'Junction', isJunction: true },
  { id: 'BSL', name: 'Bhusaval', code: 'BSL', lat: 21.0434, lng: 75.7849, zone: 'CR', division: 'Bhusaval', type: 'Junction', isJunction: true },
  { id: 'NED', name: 'Nanded', code: 'NED', lat: 19.1587, lng: 77.3178, zone: 'SCR', division: 'Nanded', type: 'Junction', isJunction: true },
  { id: 'BTI', name: 'Bathinda Junction', code: 'BTI', lat: 30.207, lng: 74.9521, zone: 'NR', division: 'Firozpur', type: 'Junction', isJunction: true },
  { id: 'DURG', name: 'Durg Junction', code: 'DURG', lat: 21.1916, lng: 81.2844, zone: 'SECR', division: 'Raipur', type: 'Junction', isJunction: true },
  { id: 'KTE', name: 'Katni Junction', code: 'KTE', lat: 23.7354, lng: 80.7967, zone: 'WCR', division: 'Jabalpur', type: 'Junction', isJunction: true },
];

const railwayCorridors: RailwayLine[] = [
  { id: 'delhi-chennai', name: 'Delhi-Chennai Grand Trunk', from: 'NDLS', to: 'MAS', fromCoords: [28.6412, 77.2189], toCoords: [13.0827, 80.2707], type: 'Golden' },
  { id: 'delhi-howrah', name: 'Delhi-Howrah Rajdhani', from: 'NDLS', to: 'HWH', fromCoords: [28.6412, 77.2189], toCoords: [22.5803, 88.3467], type: 'Golden' },
  { id: 'mumbai-delhi', name: 'Mumbai-Delhi Rajdhani', from: 'BCT', to: 'NDLS', fromCoords: [19.0596, 72.8295], toCoords: [28.6412, 77.2189], type: 'Golden' },
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
  { id: 'delhi-amritsar', name: 'Delhi-Amritsar', from: 'NDLS', to: 'ASR', fromCoords: [28.6412, 77.2189], toCoords: [31.634, 74.8723], type: 'High' },
  { id: 'kolkata-guwahati', name: 'Kolkata-Guwahati', from: 'HWH', to: 'GHY', fromCoords: [22.5803, 88.3467], toCoords: [26.1445, 91.7362], type: 'Medium' },
  { id: 'delhi-kanpur', name: 'Delhi-Kanpur', from: 'NDLS', to: 'CNB', fromCoords: [28.6412, 77.2189], toCoords: [26.4499, 80.3319], type: 'High' },
  { id: 'chennai-trivandrum', name: 'Chennai-Trivandrum', from: 'MAS', to: 'TVC', fromCoords: [13.0827, 80.2707], toCoords: [8.5241, 76.9366], type: 'Medium' },
];

const demoTrains: TrainData[] = [
  { id: '12301', name: 'Howrah Rajdhani', number: '12301', lat: 24.5, lng: 82.3, status: 'Running', speed: 110, delay: 15, zone: 'ECR' },
  { id: '12951', name: 'Mumbai Rajdhani', number: '12951', lat: 22.8, lng: 76.5, status: 'Running', speed: 120, delay: 0, zone: 'WCR' },
  { id: '12002', name: 'NDLS-Bhopal Shatabdi', number: '12002', lat: 26.2, lng: 78.8, status: 'Running', speed: 130, delay: 5, zone: 'NCR' },
  { id: '12625', name: 'Kerala Express', number: '12625', lat: 15.8, lng: 78.2, status: 'Running', speed: 95, delay: 22, zone: 'SCR' },
  { id: '12259', name: 'Sealdah Duronto', number: '12259', lat: 21.5, lng: 85.8, status: 'Running', speed: 105, delay: 8, zone: 'ECR' },
  { id: '12985', name: 'Delhi-Jaipur SF', number: '12985', lat: 27.8, lng: 76.2, status: 'Running', speed: 100, delay: 0, zone: 'NWR' },
  { id: '12621', name: 'Tamil Nadu Express', number: '12621', lat: 19.2, lng: 79.5, status: 'Running', speed: 90, delay: 35, zone: 'CR' },
  { id: '12010', name: 'Ahmedabad-Mumbai Shatabdi', number: '12010', lat: 21.2, lng: 72.8, status: 'Running', speed: 125, delay: 0, zone: 'WR' },
  { id: '12553', name: 'Vaishali Express', number: '12553', lat: 25.5, lng: 84.2, status: 'Running', speed: 85, delay: 18, zone: 'ECR' },
  { id: '12311', name: 'Kalka Mail', number: '12311', lat: 29.8, lng: 77.5, status: 'Running', speed: 80, delay: 0, zone: 'NR' },
  { id: '12615', name: 'Tamil Nadu Express', number: '12615', lat: 11.5, lng: 77.8, status: 'Running', speed: 88, delay: 10, zone: 'SR' },
  { id: '12903', name: 'Golden Temple Mail', number: '12903', lat: 24.5, lng: 74.8, status: 'Running', speed: 95, delay: 5, zone: 'WR' },
];

export default function RailwayMapView() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showTrains, setShowTrains] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [trains] = useState(demoTrains);
  const [loading, setLoading] = useState(false);

  // viewBox covers all of India: lng 68-98, lat 6-38
  const viewBox = { x: 67, y: 6, width: 32, height: 33 };

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

  const handleRefreshTrains = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const getStationColor = (station: Station) => {
    if (activeZone && station.zone !== activeZone) return '#334155';
    if (station.isJunction) return '#F59E0B';
    if (station.type === 'Terminal') return '#3B82F6';
    return '#10B981';
  };

  // Radii scaled for lat/lng coordinate space (viewBox ~32 units wide)
  const getStationRadius = (station: Station) => {
    if (station.isJunction) return 0.18;
    if (station.type === 'Terminal') return 0.15;
    return 0.10;
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
          <div className="rounded-xl border border-border/50 bg-card/80 p-3 flex-1 overflow-auto">
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
          <div className="rounded-xl border border-border/50 bg-card/80 p-3">
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
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-yellow-500 rounded" />
                <span className="text-muted-foreground">Golden Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-blue-500 rounded" />
                <span className="text-muted-foreground">High Traffic</span>
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
            {/* Grid */}
            <defs>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="oklch(0.3 0 0 / 0.08)" strokeWidth="0.02" />
              </pattern>
              {/* Glow filter for trains */}
              <filter id="trainGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.15" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#grid)" />

            {/* Corridors */}
            {showCorridors && filteredCorridors.map(corridor => {
              const color = corridor.type === 'Golden' ? '#F59E0B' : corridor.type === 'High' ? '#3B82F6' : '#6B7280';
              const strokeWidth = corridor.type === 'Golden' ? 0.08 : corridor.type === 'High' ? 0.05 : 0.03;
              const opacity = corridor.type === 'Golden' ? 0.7 : corridor.type === 'High' ? 0.5 : 0.3;
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
                  strokeDasharray={corridor.type === 'Medium' ? '0.3,0.15' : 'none'}
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
                  style={{ opacity: dimmed ? 0.25 : 1 }}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  onClick={() => setSelectedStation(station)}
                >
                  {/* Junction ring */}
                  {station.isJunction && (
                    <circle
                      cx={station.lng}
                      cy={station.lat}
                      r={r + 0.08}
                      fill="none"
                      stroke={color}
                      strokeWidth={0.03}
                      strokeOpacity={0.5}
                    />
                  )}
                  {/* Station dot */}
                  <circle
                    cx={station.lng}
                    cy={station.lat}
                    r={r}
                    fill={color}
                    stroke="rgba(0,0,0,0.6)"
                    strokeWidth={0.03}
                  />
                </g>
              );
            })}

            {/* Trains */}
            {showTrains && trains.map(train => (
              <g key={train.id} filter="url(#trainGlow)">
                {/* Pulse ring */}
                <circle
                  cx={train.lng}
                  cy={train.lat}
                  r={0.25}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={0.02}
                  strokeOpacity={0.4}
                  className="animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                {/* Train dot */}
                <circle
                  cx={train.lng}
                  cy={train.lat}
                  r={0.10}
                  fill="#22C55E"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={0.02}
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
                top: `${((hoveredStation.lat - viewBox.y) / viewBox.height) * 100 - 8}%`,
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
