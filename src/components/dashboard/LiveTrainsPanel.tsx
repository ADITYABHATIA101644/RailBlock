import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Train,
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Radio,
  RefreshCw,
} from "lucide-react";

const popularStations = [
  { code: "NDLS", name: "New Delhi" },
  { code: "MAS", name: "Chennai" },
  { code: "HWH", name: "Howrah" },
  { code: "BCT", name: "Mumbai" },
  { code: "SBC", name: "Bangalore" },
  { code: "SC", name: "Secunderabad" },
  { code: "BPL", name: "Bhopal" },
  { code: "PNBE", name: "Patna" },
  { code: "LKO", name: "Lucknow" },
  { code: "ADI", name: "Ahmedabad" },
  { code: "JP", name: "Jaipur" },
  { code: "NGP", name: "Nagpur" },
  { code: "GKP", name: "Gorakhpur" },
  { code: "CNB", name: "Kanpur" },
  { code: "JAT", name: "Jammu" },
  { code: "GHY", name: "Guwahati" },
  { code: "PURI", name: "Puri" },
  { code: "TVC", name: "Trivandrum" },
  { code: "MFP", name: "Muzaffarpur" },
  { code: "KRBA", name: "Raipur" },
];

const DEMO_TRAINS = [
  { number: "12951", name: "Mumbai Rajdhani", source: "NDLS", destination: "BCT", delay: "RT", status: "running", currentStation: "Vadodara", speed: "130 km/h", route: [
    { station: "New Delhi", code: "NDLS", schedArr: "04:55 PM", actArr: "04:55 PM", delay: "RT", schedDep: "05:00 PM", actDep: "05:00 PM" },
    { station: "Mathura Jn", code: "MTJ", schedArr: "06:28 PM", actArr: "06:28 PM", delay: "RT", schedDep: "06:30 PM", actDep: "06:30 PM" },
    { station: "Agra Cantt", code: "AGC", schedArr: "07:10 PM", actArr: "07:10 PM", delay: "RT", schedDep: "07:15 PM", actDep: "07:15 PM" },
    { station: "Gwalior", code: "GWL", schedArr: "08:30 PM", actArr: "08:35 PM", delay: "5 M", schedDep: "08:35 PM", actDep: "08:40 PM" },
    { station: "Jhansi", code: "JHS", schedArr: "09:45 PM", actArr: "09:50 PM", delay: "5 M", schedDep: "09:50 PM", actDep: "09:55 PM" },
    { station: "Bhopal Jn", code: "BPL", schedArr: "01:40 AM", actArr: "01:45 AM", delay: "5 M", schedDep: "01:45 AM", actDep: "01:50 AM" },
    { station: "Vadodara Jn", code: "BRC", schedArr: "05:30 AM", actArr: "05:30 AM", delay: "RT", schedDep: "05:35 AM", actDep: "05:35 AM" },
    { station: "Mumbai Central", code: "BCT", schedArr: "08:15 AM", actArr: "08:15 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12002", name: "Bhopal Shatabdi", source: "NDLS", destination: "BPL", delay: "15 M", status: "delayed", currentStation: "Agra Cantt", speed: "145 km/h", route: [
    { station: "New Delhi", code: "NDLS", schedArr: "06:00 AM", actArr: "06:00 AM", delay: "RT", schedDep: "06:05 AM", actDep: "06:05 AM" },
    { station: "Mathura Jn", code: "MTJ", schedArr: "07:28 AM", actArr: "07:30 AM", delay: "2 M", schedDep: "07:30 AM", actDep: "07:32 AM" },
    { station: "Agra Cantt", code: "AGC", schedArr: "08:10 AM", actArr: "08:15 AM", delay: "5 M", schedDep: "08:15 AM", actDep: "08:20 AM" },
    { station: "Gwalior", code: "GWL", schedArr: "09:20 AM", actArr: "09:35 AM", delay: "15 M", schedDep: "09:35 AM", actDep: "09:50 AM" },
    { station: "Bhopal Jn", code: "BPL", schedArr: "12:45 PM", actArr: "01:00 PM", delay: "15 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12301", name: "Howrah Rajdhani", source: "HWH", destination: "NDLS", delay: "42 M", status: "delayed", currentStation: "Prayagraj", speed: "120 km/h", route: [
    { station: "Howrah Jn", code: "HWH", schedArr: "04:55 PM", actArr: "04:55 PM", delay: "RT", schedDep: "05:00 PM", actDep: "05:00 PM" },
    { station: "Dhanbad Jn", code: "DHN", schedArr: "07:45 PM", actArr: "08:10 PM", delay: "25 M", schedDep: "07:50 PM", actDep: "08:15 PM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "10:30 PM", actArr: "11:10 PM", delay: "40 M", schedDep: "10:35 PM", actDep: "11:15 PM" },
    { station: "Prayagraj", code: "ALY", schedArr: "12:15 AM", actArr: "12:57 AM", delay: "42 M", schedDep: "12:20 AM", actDep: "01:02 AM" },
    { station: "Kanpur Central", code: "CNB", schedArr: "03:00 AM", actArr: "03:42 AM", delay: "42 M", schedDep: "03:05 AM", actDep: "03:47 AM" },
    { station: "New Delhi", code: "NDLS", schedArr: "07:00 AM", actArr: "07:42 AM", delay: "42 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12050", name: "Gatimaan Express", source: "NDLS", destination: "AGC", delay: "RT", status: "running", currentStation: "Mathura Jn", speed: "160 km/h", route: [
    { station: "New Delhi", code: "NDLS", schedArr: "08:10 AM", actArr: "08:10 AM", delay: "RT", schedDep: "08:15 AM", actDep: "08:15 AM" },
    { station: "Mathura Jn", code: "MTJ", schedArr: "09:30 AM", actArr: "09:30 AM", delay: "RT", schedDep: "09:32 AM", actDep: "09:32 AM" },
    { station: "Agra Cantt", code: "AGC", schedArr: "09:55 AM", actArr: "09:55 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12625", name: "Kerala Express", source: "NDLS", destination: "TVC", delay: "RT", status: "running", currentStation: "Nagpur", speed: "115 km/h", route: [
    { station: "New Delhi", code: "NDLS", schedArr: "10:00 PM", actArr: "10:00 PM", delay: "RT", schedDep: "10:05 PM", actDep: "10:05 PM" },
    { station: "Jhansi", code: "JHS", schedArr: "02:30 AM", actArr: "02:30 AM", delay: "RT", schedDep: "02:35 AM", actDep: "02:35 AM" },
    { station: "Bhopal Jn", code: "BPL", schedArr: "06:15 AM", actArr: "06:15 AM", delay: "RT", schedDep: "06:20 AM", actDep: "06:20 AM" },
    { station: "Nagpur", code: "NGP", schedArr: "11:00 AM", actArr: "11:00 AM", delay: "RT", schedDep: "11:05 AM", actDep: "11:05 AM" },
    { station: "Balharshah", code: "BPQ", schedArr: "01:45 PM", actArr: "01:45 PM", delay: "RT", schedDep: "01:50 PM", actDep: "01:50 PM" },
    { station: "Vijayawada", code: "BZA", schedArr: "06:30 PM", actArr: "06:30 PM", delay: "RT", schedDep: "06:35 PM", actDep: "06:35 PM" },
    { station: "Chennai Central", code: "MAS", schedArr: "04:00 AM", actArr: "04:00 AM", delay: "RT", schedDep: "04:05 AM", actDep: "04:05 AM" },
    { station: "Trivandrum Central", code: "TVC", schedArr: "10:30 AM", actArr: "10:30 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12952", name: "Mumbai Rajdhani", source: "BCT", destination: "NDLS", delay: "10 M", status: "running", currentStation: "Vadodara", speed: "125 km/h", route: [
    { station: "Mumbai Central", code: "BCT", schedArr: "04:40 PM", actArr: "04:40 PM", delay: "RT", schedDep: "04:45 PM", actDep: "04:45 PM" },
    { station: "Vadodara Jn", code: "BRC", schedArr: "09:00 PM", actArr: "09:10 PM", delay: "10 M", schedDep: "09:05 PM", actDep: "09:15 PM" },
    { station: "Ratlam Jn", code: "RTM", schedArr: "12:00 AM", actArr: "12:10 AM", delay: "10 M", schedDep: "12:05 AM", actDep: "12:15 AM" },
    { station: "Kota Jn", code: "KOTA", schedArr: "04:00 AM", actArr: "04:10 AM", delay: "10 M", schedDep: "04:05 AM", actDep: "04:15 AM" },
    { station: "New Delhi", code: "NDLS", schedArr: "08:10 AM", actArr: "08:20 AM", delay: "10 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12565", name: "Darbhanga Rajdhani", source: "DBG", destination: "NDLS", delay: "14 M", status: "delayed", currentStation: "Gorakhpur", speed: "110 km/h", route: [
    { station: "Darbhanga", code: "DBG", schedArr: "08:25 AM", actArr: "08:25 AM", delay: "RT", schedDep: "08:30 AM", actDep: "08:30 AM" },
    { station: "Samastipur", code: "SPJ", schedArr: "09:15 AM", actArr: "09:15 AM", delay: "RT", schedDep: "09:20 AM", actDep: "09:20 AM" },
    { station: "Muzaffarpur", code: "MFP", schedArr: "10:25 AM", actArr: "10:50 AM", delay: "25 M", schedDep: "10:30 AM", actDep: "10:55 AM" },
    { station: "Chhapra", code: "CPR", schedArr: "12:45 PM", actArr: "01:25 PM", delay: "40 M", schedDep: "12:50 PM", actDep: "01:30 PM" },
    { station: "Gorakhpur", code: "GKP", schedArr: "03:50 PM", actArr: "04:15 PM", delay: "25 M", schedDep: "04:05 PM", actDep: "04:24 PM" },
    { station: "Lucknow", code: "LKO", schedArr: "09:00 PM", actArr: "09:00 PM", delay: "RT", schedDep: "09:10 PM", actDep: "09:10 PM" },
    { station: "Kanpur Central", code: "CNB", schedArr: "10:48 PM", actArr: "10:48 PM", delay: "RT", schedDep: "10:58 PM", actDep: "10:58 PM" },
    { station: "New Delhi", code: "NDLS", schedArr: "05:30 AM", actArr: "05:30 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12434", name: "Chennai Rajdhani", source: "MAS", destination: "NDLS", delay: "RT", status: "running", currentStation: "Nagpur", speed: "128 km/h", route: [
    { station: "Chennai Central", code: "MAS", schedArr: "08:00 PM", actArr: "08:00 PM", delay: "RT", schedDep: "08:05 PM", actDep: "08:05 PM" },
    { station: "Vijayawada", code: "BZA", schedArr: "01:00 AM", actArr: "01:00 AM", delay: "RT", schedDep: "01:05 AM", actDep: "01:05 AM" },
    { station: "Balharshah", code: "BPQ", schedArr: "05:30 AM", actArr: "05:30 AM", delay: "RT", schedDep: "05:35 AM", actDep: "05:35 AM" },
    { station: "Nagpur", code: "NGP", schedArr: "08:15 AM", actArr: "08:15 AM", delay: "RT", schedDep: "08:20 AM", actDep: "08:20 AM" },
    { station: "Bhopal Jn", code: "BPL", schedArr: "01:00 PM", actArr: "01:00 PM", delay: "RT", schedDep: "01:05 PM", actDep: "01:05 PM" },
    { station: "Jhansi", code: "JHS", schedArr: "04:30 PM", actArr: "04:30 PM", delay: "RT", schedDep: "04:35 PM", actDep: "04:35 PM" },
    { station: "New Delhi", code: "NDLS", schedArr: "09:30 AM", actArr: "09:30 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12313", name: "Sealdah Rajdhani", source: "SDAH", destination: "NDLS", delay: "RT", status: "running", currentStation: "Patna Jn", speed: "135 km/h", route: [
    { station: "Sealdah", code: "SDAH", schedArr: "04:55 PM", actArr: "04:55 PM", delay: "RT", schedDep: "05:00 PM", actDep: "05:00 PM" },
    { station: "Barddhaman", code: "BWN", schedArr: "06:15 PM", actArr: "06:15 PM", delay: "RT", schedDep: "06:20 PM", actDep: "06:20 PM" },
    { station: "Durgapur", code: "DGR", schedArr: "07:10 PM", actArr: "07:10 PM", delay: "RT", schedDep: "07:15 PM", actDep: "07:15 PM" },
    { station: "Patna Jn", code: "PNBE", schedArr: "11:00 PM", actArr: "11:00 PM", delay: "RT", schedDep: "11:05 PM", actDep: "11:05 PM" },
    { station: "Pt. Deen Dayal Upadhyaya Jn", code: "DDU", schedArr: "02:30 AM", actArr: "02:30 AM", delay: "RT", schedDep: "02:35 AM", actDep: "02:35 AM" },
    { station: "Kanpur Central", code: "CNB", schedArr: "05:45 AM", actArr: "05:45 AM", delay: "RT", schedDep: "05:50 AM", actDep: "05:50 AM" },
    { station: "New Delhi", code: "NDLS", schedArr: "08:35 AM", actArr: "08:35 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12802", name: "Puri Rajdhani", source: "PURI", destination: "NDLS", delay: "35 M", status: "delayed", currentStation: "Rourkela", speed: "105 km/h", route: [
    { station: "Puri", code: "PURI", schedArr: "06:25 PM", actArr: "06:25 PM", delay: "RT", schedDep: "06:30 PM", actDep: "06:30 PM" },
    { station: "Bhubaneswar", code: "BBS", schedArr: "07:20 PM", actArr: "07:25 PM", delay: "5 M", schedDep: "07:25 PM", actDep: "07:30 PM" },
    { station: "Sambalpur", code: "SBP", schedArr: "10:30 PM", actArr: "10:45 PM", delay: "15 M", schedDep: "10:35 PM", actDep: "10:50 PM" },
    { station: "Rourkela", code: "ROU", schedArr: "12:30 AM", actArr: "01:05 AM", delay: "35 M", schedDep: "12:35 AM", actDep: "01:10 AM" },
    { station: "Ranchi", code: "RNC", schedArr: "04:00 AM", actArr: "04:35 AM", delay: "35 M", schedDep: "04:05 AM", actDep: "04:40 AM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "10:00 AM", actArr: "10:35 AM", delay: "35 M", schedDep: "10:05 AM", actDep: "10:40 AM" },
    { station: "New Delhi", code: "NDLS", schedArr: "04:30 PM", actArr: "05:05 PM", delay: "35 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "15909", name: "Avadh Assam Express", source: "DBRG", destination: "LGH", delay: "17 M", status: "running", currentStation: "New Jalpaiguri", speed: "95 km/h", route: [
    { station: "Dibrugarh", code: "DBRG", schedArr: "05:30 AM", actArr: "05:30 AM", delay: "RT", schedDep: "05:35 AM", actDep: "05:35 AM" },
    { station: "Guwahati", code: "GHY", schedArr: "10:00 AM", actArr: "10:17 AM", delay: "17 M", schedDep: "10:05 AM", actDep: "10:22 AM" },
    { station: "New Jalpaiguri", code: "NJP", schedArr: "04:00 PM", actArr: "04:17 PM", delay: "17 M", schedDep: "04:05 PM", actDep: "04:22 PM" },
    { station: "Katihar Jn", code: "KIR", schedArr: "07:00 PM", actArr: "07:17 PM", delay: "17 M", schedDep: "07:05 PM", actDep: "07:22 PM" },
    { station: "Barauni Jn", code: "BJU", schedArr: "10:00 PM", actArr: "10:17 PM", delay: "17 M", schedDep: "10:05 PM", actDep: "10:22 PM" },
    { station: "Lucknow", code: "LKO", schedArr: "06:00 AM", actArr: "06:17 AM", delay: "17 M", schedDep: "06:05 AM", actDep: "06:22 AM" },
    { station: "Delhi", code: "DLI", schedArr: "02:00 PM", actArr: "02:17 PM", delay: "17 M", schedDep: "02:05 PM", actDep: "02:22 PM" },
    { station: "Ludhiana", code: "LDH", schedArr: "05:00 PM", actArr: "05:17 PM", delay: "17 M", schedDep: "05:05 PM", actDep: "05:22 PM" },
    { station: "Lohian Khas", code: "LNK", schedArr: "08:00 PM", actArr: "08:17 PM", delay: "17 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12561", name: "Swatantrta Senani", source: "JYG", destination: "NDLS", delay: "RT", status: "running", currentStation: "Sonpur", speed: "110 km/h", route: [
    { station: "Jaynagar", code: "JYG", schedArr: "06:00 AM", actArr: "06:00 AM", delay: "RT", schedDep: "06:05 AM", actDep: "06:05 AM" },
    { station: "Darbhanga", code: "DBG", schedArr: "07:00 AM", actArr: "07:00 AM", delay: "RT", schedDep: "07:05 AM", actDep: "07:05 AM" },
    { station: "Muzaffarpur", code: "MFP", schedArr: "08:30 AM", actArr: "08:30 AM", delay: "RT", schedDep: "08:35 AM", actDep: "08:35 AM" },
    { station: "Hajipur", code: "HJP", schedArr: "09:15 AM", actArr: "09:15 AM", delay: "RT", schedDep: "09:20 AM", actDep: "09:20 AM" },
    { station: "Sonpur", code: "SEE", schedArr: "09:30 AM", actArr: "09:30 AM", delay: "RT", schedDep: "09:35 AM", actDep: "09:35 AM" },
    { station: "Patna Jn", code: "PNBE", schedArr: "10:30 AM", actArr: "10:30 AM", delay: "RT", schedDep: "10:35 AM", actDep: "10:35 AM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "01:15 PM", actArr: "01:15 PM", delay: "RT", schedDep: "01:20 PM", actDep: "01:20 PM" },
    { station: "Allahabad", code: "ALY", schedArr: "03:30 PM", actArr: "03:30 PM", delay: "RT", schedDep: "03:35 PM", actDep: "03:35 PM" },
    { station: "Kanpur Central", code: "CNB", schedArr: "05:45 PM", actArr: "05:45 PM", delay: "RT", schedDep: "05:50 PM", actDep: "05:50 PM" },
    { station: "New Delhi", code: "NDLS", schedArr: "10:00 AM", actArr: "10:00 AM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12311", name: "Kalka Mail", source: "HWH", destination: "KLK", delay: "28 M", status: "delayed", currentStation: "Dhanbad", speed: "90 km/h", route: [
    { station: "Howrah Jn", code: "HWH", schedArr: "07:40 AM", actArr: "07:40 AM", delay: "RT", schedDep: "07:45 AM", actDep: "07:45 AM" },
    { station: "Dhanbad Jn", code: "DHN", schedArr: "01:15 PM", actArr: "01:43 PM", delay: "28 M", schedDep: "01:20 PM", actDep: "01:48 PM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "04:15 PM", actArr: "04:43 PM", delay: "28 M", schedDep: "04:20 PM", actDep: "04:48 PM" },
    { station: "Allahabad", code: "ALY", schedArr: "06:30 PM", actArr: "06:58 PM", delay: "28 M", schedDep: "06:35 PM", actDep: "07:03 PM" },
    { station: "Cawnpore Road", code: "CNB", schedArr: "09:00 PM", actArr: "09:28 PM", delay: "28 M", schedDep: "09:05 PM", actDep: "09:33 PM" },
    { station: "New Delhi", code: "NDLS", schedArr: "06:00 AM", actArr: "06:28 AM", delay: "28 M", schedDep: "06:05 AM", actDep: "06:33 AM" },
    { station: "Ambala Cantt", code: "UMB", schedArr: "09:00 AM", actArr: "09:28 AM", delay: "28 M", schedDep: "09:05 AM", actDep: "09:33 AM" },
    { station: "Kalka", code: "KLK", schedArr: "12:00 PM", actArr: "12:28 PM", delay: "28 M", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "12259", name: "Sealdah Rajdhani (Exp)", source: "SDAH", destination: "NDLS", delay: "RT", status: "running", currentStation: "Gaya", speed: "125 km/h", route: [
    { station: "Sealdah", code: "SDAH", schedArr: "10:00 PM", actArr: "10:00 PM", delay: "RT", schedDep: "10:05 PM", actDep: "10:05 PM" },
    { station: "Gaya Jn", code: "GAYA", schedArr: "03:30 AM", actArr: "03:30 AM", delay: "RT", schedDep: "03:35 AM", actDep: "03:35 AM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "05:45 AM", actArr: "05:45 AM", delay: "RT", schedDep: "05:50 AM", actDep: "05:50 AM" },
    { station: "Prayagraj", code: "ALY", schedArr: "08:00 AM", actArr: "08:00 AM", delay: "RT", schedDep: "08:05 AM", actDep: "08:05 AM" },
    { station: "Kanpur Central", code: "CNB", schedArr: "10:30 AM", actArr: "10:30 AM", delay: "RT", schedDep: "10:35 AM", actDep: "10:35 AM" },
    { station: "New Delhi", code: "NDLS", schedArr: "02:30 PM", actArr: "02:30 PM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
  { number: "13020", name: "Bagh Express", source: "KGM", destination: "HWH", delay: "RT", status: "running", currentStation: "Lucknow", speed: "85 km/h", route: [
    { station: "Kathgodam", code: "KGM", schedArr: "08:00 PM", actArr: "08:00 PM", delay: "RT", schedDep: "08:05 PM", actDep: "08:05 PM" },
    { station: "Haldwani", code: "HWH", schedArr: "08:15 PM", actArr: "08:15 PM", delay: "RT", schedDep: "08:20 PM", actDep: "08:20 PM" },
    { station: "Lucknow", code: "LKO", schedArr: "06:00 AM", actArr: "06:00 AM", delay: "RT", schedDep: "06:05 AM", actDep: "06:05 AM" },
    { station: "Varanasi", code: "BSB", schedArr: "01:00 PM", actArr: "01:00 PM", delay: "RT", schedDep: "01:05 PM", actDep: "01:05 PM" },
    { station: "Mughal Sarai", code: "MGS", schedArr: "02:00 PM", actArr: "02:00 PM", delay: "RT", schedDep: "02:05 PM", actDep: "02:05 PM" },
    { station: "Gaya Jn", code: "GAYA", schedArr: "05:00 PM", actArr: "05:00 PM", delay: "RT", schedDep: "05:05 PM", actDep: "05:05 PM" },
    { station: "Dhanbad Jn", code: "DHN", schedArr: "08:00 PM", actArr: "08:00 PM", delay: "RT", schedDep: "08:05 PM", actDep: "08:05 PM" },
    { station: "Howrah Jn", code: "HWH", schedArr: "01:00 PM", actArr: "01:00 PM", delay: "RT", schedDep: "Destination", actDep: "Destination" },
  ]},
];

function parseDelay(delayStr: string): number {
  if (!delayStr || delayStr === "RT" || delayStr === "-") return 0;
  const match = delayStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

interface LiveTrainRoute {
  station: string;
  code: string;
  scheduledArrival: string;
  actualArrival: string;
  delay: string;
  scheduledDeparture: string;
  actualDeparture: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LiveTrainsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"train" | "station">("train");
  const [liveData, setLiveData] = useState<any[] | null>(null);
  const [trainDetail, setTrainDetail] = useState<{
    number: string;
    name?: string;
    route: LiveTrainRoute[];
    isLive?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<"demo" | "live">("demo");

  const fetchLiveTrain = useAction(api.trainData.getLiveTrain);
  const fetchLiveStation = useAction(api.trainData.getLiveStation);

  const showDemoTrain = (trainNumber: string) => {
    const demo = DEMO_TRAINS.find((t) => t.number === trainNumber);
    if (!demo) {
      toast.info(`Train ${trainNumber} not in demo data`, {
        description: "Try: 12951, 12301, 12050, 12625, or click any train below.",
      });
      return;
    }
    setTrainDetail({
      number: demo.number,
      name: demo.name,
      isLive: false,
      route: demo.route.map((s) => ({
        station: s.station,
        code: s.code,
        scheduledArrival: s.schedArr,
        actualArrival: s.actArr,
        delay: s.delay,
        scheduledDeparture: s.schedDep,
        actualDeparture: s.actDep,
      })),
    });
    setLiveData(null);
    setDataSource("demo");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);

    // Always show demo data first as instant feedback
    if (searchMode === "train") {
      showDemoTrain(searchQuery.trim());
    }

    // Then try to get live data
    try {
      if (searchMode === "train") {
        const data = (await fetchLiveTrain({
          trainNumber: searchQuery.trim(),
        })) as any;

        const route: LiveTrainRoute[] = Array.isArray(data.route)
          ? data.route.map((stop: any) => ({
              station: stop.station || "",
              code: stop.code || "",
              scheduledArrival: stop.scheduledArrival || "-",
              actualArrival: stop.actualArrival || "-",
              delay: stop.delay || "-",
              scheduledDeparture: stop.scheduledDeparture || "-",
              actualDeparture: stop.actualDeparture || "-",
            }))
          : [];

        if (route.length > 0) {
          setTrainDetail({
            number: data.trainNumber || searchQuery.trim(),
            name: data.name,
            isLive: true,
            route,
          });
          setDataSource("live");
          toast.success("Live data loaded!", {
            description: `Train ${data.trainNumber || searchQuery.trim()} — ${route.length} real stops`,
          });
        }
      } else {
        const data = (await fetchLiveStation({
          stationCode: searchQuery.trim().toUpperCase(),
        })) as any;

        const trains = Array.isArray(data) ? data : [];
        if (trains.length > 0) {
          setLiveData(
            trains.map((t: any) => ({
              name: t.name || "",
              number: t.number || "",
              source: t.source || "",
              destination: t.destination || "",
              expectedArrival: t.expectedArrival || "-",
              delay: t.delay || "-",
              expectedDeparture: t.expectedDeparture || "-",
              scheduledArrival: t.scheduledArrival || "-",
              scheduledDeparture: t.scheduledDeparture || "-",
            }))
          );
          setTrainDetail(null);
          setDataSource("live");
          toast.success("Live station data loaded!", {
            description: `${trains.length} trains at ${searchQuery.toUpperCase()}`,
          });
        }
      }
    } catch (error) {
      console.log("[LiveTrains] API unavailable, using demo data:", error instanceof Error ? error.message : error);
      // Don't show error panel — just use the demo data that's already displayed
      if (searchMode === "station") {
        // Show demo trains at a station as fallback
        setLiveData(
          DEMO_TRAINS.slice(0, 5).map((t) => ({
            name: t.name,
            number: t.number,
            source: t.source,
            destination: t.destination,
            expectedArrival: "Demo",
            delay: t.delay,
            expectedDeparture: "Demo",
            scheduledArrival: "-",
            scheduledDeparture: "-",
          }))
        );
        toast.info("Showing demo station data", {
          description: "Indian Rail API rate limited. Showing demo trains.",
        });
      } else {
        toast.info("Using demo route data", {
          description: "Live API temporarily unavailable. Showing detailed demo route.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayTrains = liveData && liveData.length > 0 ? liveData : DEMO_TRAINS;
  const hasLiveData = dataSource === "live" && liveData && liveData.length > 0;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="rounded-2xl p-5 border border-border/50 bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex bg-primary/10 rounded-xl p-0.5">
            <button
              onClick={() => setSearchMode("train")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "train" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              Train Number
            </button>
            <button
              onClick={() => setSearchMode("station")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${searchMode === "station" ? "bg-primary text-primary-foreground" : "text-primary"}`}
            >
              Station Code
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchMode === "train"
                    ? "Enter train number (e.g. 12951, 12301, 12050)"
                    : "Enter station code (e.g. NDLS)"
                }
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/50 border border-border/50 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="flex items-center gap-2 text-xs">
          {dataSource === "live" ? (
            <>
              <Radio className="w-3 h-3 text-chart-3 animate-pulse" />
              <span className="text-chart-3 font-medium">
                Live data from Indian Railways API
              </span>
              <button
                onClick={() => {
                  setDataSource("demo");
                  setLiveData(null);
                  setTrainDetail(null);
                }}
                className="ml-auto text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Switch to demo
              </button>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-primary font-medium">
                Demo data — search any train number for live data
              </span>
            </>
          )}
        </div>
      </div>

      {/* Train detail view */}
      {trainDetail && (
        <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Train className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">
                Train #{trainDetail.number}
                {trainDetail.name ? ` — ${trainDetail.name}` : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                {trainDetail.isLive
                  ? "Live route with real delays"
                  : "Detailed demo route"}
                {` • `}
                {trainDetail.route.length} stops
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {trainDetail.isLive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live
                </span>
              )}
              <button
                onClick={() => setTrainDetail(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">#</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Code</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Station</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Sched. Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Actual Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Sched. Dep</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Actual Dep</th>
                </tr>
              </thead>
              <tbody>
                {trainDetail.route.map((stop: LiveTrainRoute, i: number) => {
                  const delay = parseDelay(stop.delay);
                  return (
                    <tr
                      key={i}
                      className="border-b border-border/20 hover:bg-primary/5"
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground font-mono">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs font-bold">
                        {stop.code}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {stop.station}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {stop.scheduledArrival}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {stop.actualArrival}
                      </td>
                      <td className="px-3 py-2">
                        {delay > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {stop.delay}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            RT
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {stop.scheduledDeparture}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {stop.actualDeparture}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popular stations */}
      {!trainDetail && !hasLiveData && (
        <div className="rounded-2xl p-5 border border-border/50 bg-card">
          <h3 className="font-semibold mb-3">Quick Access — Major Stations</h3>
          <div className="flex flex-wrap gap-2">
            {popularStations.map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  setSearchQuery(s.code);
                  setSearchMode("station");
                  handleSearch();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <span className="font-mono font-bold">{s.code}</span>
                <span className="text-muted-foreground ml-1">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live station data */}
      {hasLiveData && !trainDetail && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center gap-2">
            <Radio className="w-4 h-4 text-chart-3 animate-pulse" />
            <h3 className="font-semibold">
              Live Station — {searchQuery.toUpperCase()}
            </h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {liveData!.length} trains
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Train</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Expected Arr</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Expected Dep</th>
                </tr>
              </thead>
              <tbody>
                {liveData!.map((train: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-primary/5 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(train.number);
                      setSearchMode("train");
                      handleSearch();
                    }}
                  >
                    <td className="px-5 py-3">
                      <div className="font-mono font-semibold">{train.number}</div>
                      <div className="text-xs text-muted-foreground">{train.name}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {train.source} → {train.destination}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{train.expectedArrival}</td>
                    <td className="px-5 py-3">
                      {parseDelay(train.delay) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          {train.delay}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          RT
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{train.expectedDeparture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo trains table */}
      {!hasLiveData && !trainDetail && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Trains Across India</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {DEMO_TRAINS.length} trains — click for detailed route
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Train</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Route</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Current Location</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Speed</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Delay</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_TRAINS.map((train, i) => {
                  const delay = parseDelay(train.delay);
                  return (
                    <tr
                      key={i}
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer"
                      onClick={() => showDemoTrain(train.number)}
                    >
                      <td className="px-5 py-3">
                        <div className="font-mono font-semibold">{train.number}</div>
                        <div className="text-xs text-muted-foreground">{train.name}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {train.source} → {train.destination}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span className="text-sm">{train.currentStation}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-medium">{train.speed}</td>
                      <td className="px-5 py-3">
                        {delay > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {train.delay}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            RT
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            train.status === "running"
                              ? "bg-chart-3/15 text-chart-3"
                              : "bg-chart-4/15 text-chart-4"
                          }`}
                        >
                          {train.status === "running" ? "Running" : "Delayed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
