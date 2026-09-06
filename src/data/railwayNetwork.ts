/* Real Indian Railways network data — all 17 zones, 70+ divisions, major stations */

export interface RailwayZone {
  id: string;
  name: string;
  code: string;
  headquarters: string;
  divisions: string[];
}

export interface RailwayStation {
  code: string;
  name: string;
  zone: string;
  division: string;
  lat: number;
  lng: number;
  state: string;
}

export const ZONES: RailwayZone[] = [
  { id: "NR", name: "Northern Railway", code: "NR", headquarters: "New Delhi", divisions: ["Delhi", "Ambala", "Firozpur", "Lucknow NR", "Moradabad", "Northern Railway (HQ)"] },
  { id: "NCR", name: "North Central Railway", code: "NCR", headquarters: "Prayagraj", divisions: ["Prayagraj", "Jhansi", "Agra"] },
  { id: "NER", name: "North Eastern Railway", code: "NER", headquarters: "Gorakhpur", divisions: ["Gorakhpur", "Lucknow NER", "Varanasi"] },
  { id: "NFR", name: "Northeast Frontier Railway", code: "NFR", headquarters: "Guwahati", divisions: ["Guwahati", "Tinsukia", "Lumding", "Rangiya", "Alipurduar", "Katihar"] },
  { id: "ER", name: "Eastern Railway", code: "ER", headquarters: "Kolkata", divisions: ["Howrah", "Sealdah", "Asansol", "Malda Town"] },
  { id: "SECR", name: "South East Central Railway", code: "SECR", headquarters: "Bilaspur", divisions: ["Bilaspur", "Nagpur", "Raipur"] },
  { id: "SCR", name: "South Central Railway", code: "SCR", headquarters: "Secunderabad", divisions: ["Secunderabad", "Hyderabad", "Nanded", "Guntur", "Vijayawada", "Bangalore"] },
  { id: "SWR", name: "South Western Railway", code: "SWR", headquarters: "Hubballi", divisions: ["Hubballi", "Mysuru", "Bengaluru"] },
  { id: "SR", name: "Southern Railway", code: "SR", headquarters: "Chennai", divisions: ["Chennai", "Madurai", "Trichy", "Palakkad", "Thiruvananthapuram"] },
  { id: "CR", name: "Central Railway", code: "CR", headquarters: "Mumbai", divisions: ["Mumbai CST", "Bhusawal", "Pune", "Solapur", "Nagpur"] },
  { id: "WCR", name: "West Central Railway", code: "WCR", headquarters: "Jabalpur", divisions: ["Jabalpur", "Bhopal", "Kota"] },
  { id: "WR", name: "Western Railway", code: "WR", headquarters: "Mumbai", divisions: ["Mumbai Central", "Rajkot", "Ahmedabad", "Ratlam", "Bhopal WR", "Vadodara"] },
  { id: "NWR", name: "North Western Railway", code: "NWR", headquarters: "Jaipur", divisions: ["Jaipur", "Ajmer", "Bikaner", "Jodhpur"] },
  { id: "SER", name: "South Eastern Railway", code: "SER", headquarters: "Kolkata", divisions: ["Adra", "Chakradharpur", "Ranchi", "Tatanagar"] },
  { id: "ECR", name: "East Central Railway", code: "ECR", headquarters: "Hajipur", divisions: ["Danapur", "Dhanbad", "Muzaffarpur", "Samastipur", "Sonpur"] },
  { id: "ECoR", name: "East Coast Railway", code: "ECoR", headquarters: "Bhubaneswar", divisions: ["Khurda Road", "Sambalpur", "Waltair"] },
  { id: "MER", name: "Metro Railway Kolkata", code: "MER", headquarters: "Kolkata", divisions: ["Kolkata Metro"] },
];

export const MAJOR_STATIONS: RailwayStation[] = [
  // Northern Railway
  { code: "NDLS", name: "New Delhi", zone: "NR", division: "Delhi", lat: 28.6420, lng: 77.2260, state: "Delhi" },
  { code: "DLI", name: "Old Delhi", zone: "NR", division: "Delhi", lat: 28.6507, lng: 77.2334, state: "Delhi" },
  { code: "ANVT", name: "Anand Vihar Terminal", zone: "NR", division: "Delhi", lat: 28.6380, lng: 77.3100, state: "Delhi" },
  { code: "DEC", name: "Delhi Cantt", zone: "NR", division: "Delhi", lat: 28.5950, lng: 77.1590, state: "Delhi" },
  { code: "SZM", name: "Sabzi Mandi", zone: "NR", division: "Delhi", lat: 28.6700, lng: 77.2100, state: "Delhi" },
  { code: "GZB", name: "Ghaziabad", zone: "NR", division: "Delhi", lat: 28.6692, lng: 77.4538, state: "Uttar Pradesh" },
  { code: "MB", name: "Moradabad", zone: "NR", division: "Moradabad", lat: 28.8425, lng: 78.7733, state: "Uttar Pradesh" },
  { code: "BE", name: "Bareilly", zone: "NR", division: "Moradabad", lat: 28.3670, lng: 79.4304, state: "Uttar Pradesh" },
  { code: "LKO", name: "Lucknow NR", zone: "NR", division: "Lucknow NR", lat: 26.8500, lng: 80.9200, state: "Uttar Pradesh" },
  { code: "CNB", name: "Kanpur Central", zone: "NR", division: "Lucknow NR", lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
  { code: "AGC", name: "Agra Cantt", zone: "NCR", division: "Agra", lat: 27.1833, lng: 78.0228, state: "Uttar Pradesh" },
  { code: "AF", name: "Agra Fort", zone: "NCR", division: "Agra", lat: 27.1800, lng: 78.0180, state: "Uttar Pradesh" },
  { code: "MTJ", name: "Mathura Junction", zone: "NCR", division: "Agra", lat: 27.4924, lng: 77.6737, state: "Uttar Pradesh" },
  { code: "FZD", name: "Firozabad", zone: "NCR", division: "Agra", lat: 27.1520, lng: 78.3950, state: "Uttar Pradesh" },
  { code: "BPL", name: "Bhopal Junction", zone: "WCR", division: "Bhopal", lat: 23.2354, lng: 77.4020, state: "Madhya Pradesh" },
  { code: "HBJ", name: "Habibganj", zone: "WCR", division: "Bhopal", lat: 23.2270, lng: 77.4380, state: "Madhya Pradesh" },
  { code: "JHS", name: "Jhansi Junction", zone: "NCR", division: "Jhansi", lat: 25.4524, lng: 78.5685, state: "Madhya Pradesh" },
  { code: "GWL", name: "Gwalior", zone: "NCR", division: "Jhansi", lat: 26.2200, lng: 78.1800, state: "Madhya Pradesh" },
  { code: "PRYJ", name: "Prayagraj", zone: "NCR", division: "Prayagraj", lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
  { code: "ALY", name: "Allahabad", zone: "NCR", division: "Prayagraj", lat: 25.4524, lng: 81.8463, state: "Uttar Pradesh" },
  { code: "NZM", name: "Nizamuddin", zone: "NR", division: "Delhi", lat: 28.5890, lng: 77.2490, state: "Delhi" },
  { code: "FDB", name: "Faridabad", zone: "NR", division: "Delhi", lat: 28.4100, lng: 77.3100, state: "Haryana" },
  { code: "KKDE", name: "Kurukshetra", zone: "NR", division: "Ambala", lat: 29.9695, lng: 76.8574, state: "Haryana" },
  { code: "UMB", name: "Ambala Cantt", zone: "NR", division: "Ambala", lat: 30.3165, lng: 76.7800, state: "Haryana" },
  { code: "JAT", name: "Jammu Tawi", zone: "NR", division: "Firozpur", lat: 32.7000, lng: 74.8700, state: "Jammu & Kashmir" },
  { code: "FZR", name: "Firozpur Cantt", zone: "NR", division: "Firozpur", lat: 30.9300, lng: 74.6100, state: "Punjab" },

  // North Eastern Railway
  { code: "GKP", name: "Gorakhpur", zone: "NER", division: "Gorakhpur", lat: 26.7600, lng: 83.3700, state: "Uttar Pradesh" },
  { code: "MFP", name: "Muzaffarpur", zone: "ECR", division: "Muzaffarpur", lat: 26.1200, lng: 85.3600, state: "Bihar" },
  { code: "HJP", name: "Hajipur", zone: "ECR", division: "Hajipur", lat: 25.6900, lng: 85.2200, state: "Bihar" },
  { code: "SEE", name: "Sonpur", zone: "ECR", division: "Sonpur", lat: 25.7200, lng: 85.1800, state: "Bihar" },
  { code: "SPJ", name: "Samastipur", zone: "ECR", division: "Samastipur", lat: 25.8600, lng: 85.7800, state: "Bihar" },
  { code: "CPR", name: "Chhapra", zone: "ECR", division: "Sonpur", lat: 25.7800, lng: 84.7300, state: "Bihar" },
  { code: "SV", name: "Siwan", zone: "NER", division: "Gorakhpur", lat: 26.2200, lng: 84.3600, state: "Bihar" },
  { code: "BJU", name: "Barauni", zone: "ECR", division: "Samastipur", lat: 25.7300, lng: 86.0100, state: "Bihar" },
  { code: "PNBE", name: "Patna Junction", zone: "ECR", division: "Danapur", lat: 25.6000, lng: 85.1400, state: "Bihar" },
  { code: "DNR", name: "Danapur", zone: "ECR", division: "Danapur", lat: 25.6300, lng: 85.0700, state: "Bihar" },
  { code: "PPTA", name: "Patliputra", zone: "ECR", division: "Danapur", lat: 25.5800, lng: 85.1900, state: "Bihar" },
  { code: "DBG", name: "Darbhanga", zone: "ECR", division: "Samastipur", lat: 26.1700, lng: 85.9000, state: "Bihar" },
  { code: "JYG", name: "Jaynagar", zone: "ECR", division: "Samastipur", lat: 26.3000, lng: 86.1300, state: "Bihar" },

  // East Central Railway
  { code: "DHN", name: "Dhanbad", zone: "ECR", division: "Dhanbad", lat: 23.7900, lng: 86.4300, state: "Jharkhand" },
  { code: "KRR", name: "Koderma", zone: "ECR", division: "Dhanbad", lat: 24.0400, lng: 85.5800, state: "Jharkhand" },

  // South Eastern Railway
  { code: "TATA", name: "Tatanagar", zone: "SER", division: "Tatanagar", lat: 22.7800, lng: 86.2000, state: "Jharkhand" },
  { code: "CKP", name: "Chakradharpur", zone: "SER", division: "Chakradharpur", lat: 22.7100, lng: 85.6300, state: "Jharkhand" },
  { code: "ROU", name: "Rourkela", zone: "SER", division: "Chakradharpur", lat: 22.2600, lng: 84.8800, state: "Odisha" },
  { code: "HWH", name: "Howrah Junction", zone: "ER", division: "Howrah", lat: 22.5800, lng: 88.3500, state: "West Bengal" },
  { code: "SDAH", name: "Sealdah", zone: "ER", division: "Sealdah", lat: 22.5700, lng: 88.3700, state: "West Bengal" },
  { code: "KOAA", name: "Kolkata", zone: "ER", division: "Howrah", lat: 22.5600, lng: 88.3600, state: "West Bengal" },
  { code: "ASJ", name: "Asansol", zone: "ER", division: "Asansol", lat: 23.6800, lng: 86.9900, state: "West Bengal" },
  { code: "MLDT", name: "Malda Town", zone: "ER", division: "Malda Town", lat: 25.0000, lng: 88.1300, state: "West Bengal" },
  { code: "BHP", name: "Bhubaneswar", zone: "ECoR", division: "Khurda Road", lat: 20.2700, lng: 85.8300, state: "Odisha" },
  { code: "PURI", name: "Puri", zone: "ECoR", division: "Khurda Road", lat: 19.8100, lng: 85.8300, state: "Odisha" },
  { code: "SBC", name: "KSR Bengaluru", zone: "SWR", division: "Bengaluru", lat: 12.9760, lng: 77.5720, state: "Karnataka" },
  { code: "BNC", name: "Bangalore Cantonment", zone: "SWR", division: "Bengaluru", lat: 12.9780, lng: 77.5680, state: "Karnataka" },
  { code: "MYS", name: "Mysuru Junction", zone: "SWR", division: "Mysuru", lat: 12.3100, lng: 76.6500, state: "Karnataka" },
  { code: "UBL", name: "Hubballi Junction", zone: "SWR", division: "Hubballi", lat: 15.3600, lng: 75.1200, state: "Karnataka" },
  { code: "SC", name: "Secunderabad Junction", zone: "SCR", division: "Secunderabad", lat: 17.4400, lng: 78.4800, state: "Telangana" },
  { code: "HYB", name: "Hyderabad", zone: "SCR", division: "Hyderabad", lat: 17.3900, lng: 78.4900, state: "Telangana" },
  { code: "VSKP", name: "Visakhapatnam", zone: "ECoR", division: "Waltair", lat: 17.7300, lng: 83.3000, state: "Andhra Pradesh" },
  { code: "VJW", name: "Vijayawada Junction", zone: "SCR", division: "Vijayawada", lat: 16.5200, lng: 80.6200, state: "Andhra Pradesh" },
  { code: "GNT", name: "Guntur Junction", zone: "SCR", division: "Guntur", lat: 16.3100, lng: 80.4400, state: "Andhra Pradesh" },
  { code: "BCT", name: "Mumbai Central", zone: "WR", division: "Mumbai Central", lat: 18.9690, lng: 72.8190, state: "Maharashtra" },
  { code: "CSTM", name: "Mumbai CST", zone: "CR", division: "Mumbai CST", lat: 18.9390, lng: 72.8350, state: "Maharashtra" },
  { code: "LTT", name: "Lokmanya Tilak Terminus", zone: "CR", division: "Mumbai CST", lat: 19.0620, lng: 72.8890, state: "Maharashtra" },
  { code: "BKI", name: "Bandra Kurla Complex", zone: "CR", division: "Mumbai CST", lat: 19.0600, lng: 72.8640, state: "Maharashtra" },
  { code: "PUNE", name: "Pune Junction", zone: "CR", division: "Pune", lat: 18.5300, lng: 73.8800, state: "Maharashtra" },
  { code: "NGP", name: "Nagpur", zone: "SECR", division: "Nagpur", lat: 21.1500, lng: 79.0900, state: "Maharashtra" },
  { code: "BSL", name: "Bhusawal Junction", zone: "CR", division: "Bhusawal", lat: 21.0400, lng: 75.7800, state: "Maharashtra" },
  { code: "ADI", name: "Ahmedabad Junction", zone: "WR", division: "Ahmedabad", lat: 23.0300, lng: 72.5800, state: "Gujarat" },
  { code: "ST", name: "Surat", zone: "WR", division: "Vadodara", lat: 21.1900, lng: 72.8400, state: "Gujarat" },
  { code: "BRC", name: "Vadodara Junction", zone: "WR", division: "Vadodara", lat: 22.3100, lng: 73.1800, state: "Gujarat" },
  { code: "RTM", name: "Ratlam Junction", zone: "WR", division: "Ratlam", lat: 23.3200, lng: 75.0400, state: "Madhya Pradesh" },
  { code: "JP", name: "Jaipur Junction", zone: "NWR", division: "Jaipur", lat: 26.9200, lng: 75.7900, state: "Rajasthan" },
  { code: "AII", name: "Ajmer Junction", zone: "NWR", division: "Ajmer", lat: 26.4500, lng: 74.6400, state: "Rajasthan" },
  { code: "BKN", name: "Bikaner Junction", zone: "NWR", division: "Bikaner", lat: 28.0200, lng: 73.3200, state: "Rajasthan" },
  { code: "JU", name: "Jodhpur Junction", zone: "NWR", division: "Jodhpur", lat: 26.2800, lng: 73.0200, state: "Rajasthan" },
  { code: "MAS", name: "Chennai Central", zone: "SR", division: "Chennai", lat: 13.0800, lng: 80.2700, state: "Tamil Nadu" },
  { code: "MS", name: "Chennai Egmore", zone: "SR", division: "Chennai", lat: 13.0700, lng: 80.2600, state: "Tamil Nadu" },
  { code: "MDU", name: "Madurai Junction", zone: "SR", division: "Madurai", lat: 9.9200, lng: 78.1200, state: "Tamil Nadu" },
  { code: "TPJ", name: "Tiruchirappalli", zone: "SR", division: "Trichy", lat: 10.8100, lng: 78.6900, state: "Tamil Nadu" },
  { code: "ED", name: "Erode Junction", zone: "SR", division: "Salem", lat: 11.3400, lng: 77.7300, state: "Tamil Nadu" },
  { code: "CBE", name: "Coimbatore Junction", zone: "SR", division: "Palakkad", lat: 11.0000, lng: 76.9600, state: "Tamil Nadu" },
  { code: "CLT", name: "Calicut", zone: "SR", division: "Palakkad", lat: 11.2500, lng: 75.7800, state: "Kerala" },
  { code: "TVC", name: "Trivandrum Central", zone: "SR", division: "Thiruvananthapuram", lat: 8.4900, lng: 76.9500, state: "Kerala" },
  { code: "KTYM", name: "Kottayam", zone: "SR", division: "Trichy", lat: 9.5900, lng: 76.5200, state: "Kerala" },
  { code: "ALLP", name: "Alappuzha", zone: "SR", division: "Trichy", lat: 9.5000, lng: 76.3400, state: "Kerala" },

  // West Central Railway
  { code: "JBP", name: "Jabalpur", zone: "WCR", division: "Jabalpur", lat: 23.1800, lng: 79.9500, state: "Madhya Pradesh" },
  { code: "KOTA", name: "Kota Junction", zone: "WCR", division: "Kota", lat: 25.2100, lng: 75.8600, state: "Rajasthan" },

  // South East Central Railway
  { code: "BSP", name: "Bilaspur Junction", zone: "SECR", division: "Bilaspur", lat: 21.9200, lng: 82.3300, state: "Chhattisgarh" },
  { code: "R", name: "Raipur Junction", zone: "SECR", division: "Raipur", lat: 21.2500, lng: 81.6300, state: "Chhattisgarh" },

  // Northeast Frontier Railway
  { code: "GHY", name: "Guwahati", zone: "NFR", division: "Guwahati", lat: 26.1400, lng: 91.7400, state: "Assam" },
  { code: "NTSK", name: "New Tinsukia", zone: "NFR", division: "Tinsukia", lat: 27.4900, lng: 95.3600, state: "Assam" },
  { code: "DBRG", name: "Dibrugarh", zone: "NFR", division: "Tinsukia", lat: 27.4700, lng: 94.9100, state: "Assam" },
  { code: "NJP", name: "New Jalpaiguri", zone: "NFR", division: "Katihar", lat: 26.6900, lng: 88.4400, state: "West Bengal" },
  { code: "KIR", name: "Katihar Junction", zone: "NFR", division: "Katihar", lat: 25.5400, lng: 87.5800, state: "Bihar" },

  // South Central Railway - additional
  { code: "NED", name: "Nanded", zone: "SCR", division: "Nanded", lat: 19.1600, lng: 77.3200, state: "Maharashtra" },
  { code: "KZJ", name: "Karimnagar", zone: "SCR", division: "Secunderabad", lat: 18.4400, lng: 79.1300, state: "Telangana" },

  // South Western Railway additional
  { code: "KJM", name: "Krishnarajapuram", zone: "SWR", division: "Bengaluru", lat: 12.9900, lng: 77.7500, state: "Karnataka" },
  { code: "YPR", name: "Yesvantpur", zone: "SWR", division: "Bengaluru", lat: 13.0300, lng: 77.5400, state: "Karnataka" },
];

/* Zone colors for map visualization */
export const ZONE_COLORS: Record<string, string> = {
  NR: "#3b82f6",
  NCR: "#8b5cf6",
  NER: "#ec4899",
  NFR: "#f97316",
  ER: "#ef4444",
  SECR: "#14b8a6",
  SCR: "#22c55e",
  SWR: "#06b6d4",
  SR: "#eab308",
  CR: "#f43f5e",
  WCR: "#a855f7",
  WR: "#6366f1",
  NWR: "#0ea5e9",
  SER: "#10b981",
  ECR: "#f59e0b",
  ECoR: "#84cc16",
  MER: "#64748b",
};

/* Zone boundaries for map (simplified convex hulls) */
export const ZONE_BOUNDARIES: Record<string, [number, number][]> = {
  NR: [[28.6, 76.5], [32.8, 74.8], [30.3, 76.8], [28.5, 77.3]],
  NCR: [[25.0, 77.5], [27.5, 81.9], [26.0, 78.0], [25.4, 78.2]],
  NER: [[25.7, 83.0], [27.0, 83.4], [26.5, 81.0], [25.5, 80.5]],
  NFR: [[25.5, 88.0], [27.5, 95.5], [26.0, 92.0], [25.3, 89.0]],
  ER: [[21.5, 86.5], [25.5, 88.5], [23.0, 89.5], [21.8, 87.0]],
  SECR: [[19.5, 79.5], [23.0, 82.5], [21.5, 83.0], [19.8, 79.8]],
  SCR: [[15.0, 75.0], [19.5, 80.5], [17.0, 81.0], [15.5, 77.0]],
  SWR: [[12.0, 75.0], [16.5, 77.0], [14.0, 76.5], [12.5, 75.5]],
  SR: [[8.0, 76.0], [13.5, 80.5], [11.0, 78.0], [8.5, 76.5]],
  CR: [[16.0, 73.0], [21.5, 80.5], [18.5, 77.5], [16.5, 73.5]],
  WCR: [[21.0, 75.0], [25.5, 80.0], [23.5, 78.5], [21.5, 75.5]],
  WR: [[19.0, 68.5], [25.5, 75.5], [23.0, 73.0], [19.5, 69.0]],
  NWR: [[24.0, 69.0], [29.5, 76.0], [26.5, 73.5], [24.5, 69.5]],
  SER: [[21.0, 84.5], [23.5, 87.0], [22.0, 87.5], [21.5, 85.0]],
  ECR: [[23.0, 83.5], [27.0, 88.0], [25.5, 87.0], [23.5, 84.0]],
  ECoR: [[17.0, 80.0], [22.0, 86.5], [20.0, 85.5], [17.5, 80.5]],
  MER: [[22.5, 88.3], [22.6, 88.4], [22.5, 88.4], [22.6, 88.3]],
};

/* Get station by code */
export function getStation(code: string): RailwayStation | undefined {
  return MAJOR_STATIONS.find((s) => s.code === code);
}

/* Get all stations in a zone */
export function getStationsByZone(zoneCode: string): RailwayStation[] {
  return MAJOR_STATIONS.filter((s) => s.zone === zoneCode);
}

/* Get zone by code */
export function getZone(code: string): RailwayZone | undefined {
  return ZONES.find((z) => z.code === code);
}
