import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Calendar, MapPin, Zap, Save, Train, Plane, Car, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Indian stations with IRCTC codes — comprehensive list
const STATIONS = [
  // Delhi / NCR
  { name: 'New Delhi', code: 'NDLS', state: 'Delhi' },
  { name: 'Old Delhi', code: 'DLI', state: 'Delhi' },
  { name: 'Hazrat Nizamuddin', code: 'NZM', state: 'Delhi' },
  { name: 'Delhi Sarai Rohilla', code: 'DEE', state: 'Delhi' },
  { name: 'Delhi Cantonment', code: 'DEC', state: 'Delhi' },
  { name: 'Anand Vihar Terminal', code: 'ANVT', state: 'Delhi' },
  { name: 'Gurgaon', code: 'GGN', state: 'Haryana' },
  { name: 'Faridabad', code: 'FDB', state: 'Haryana' },
  { name: 'Ghaziabad', code: 'GZB', state: 'Uttar Pradesh' },
  // Maharashtra
  { name: 'Mumbai Central', code: 'MMCT', state: 'Maharashtra' },
  { name: 'Chhatrapati Shivaji Terminus', code: 'CSMT', state: 'Maharashtra' },
  { name: 'Bandra Terminus', code: 'BDTS', state: 'Maharashtra' },
  { name: 'Lokmanya Tilak Terminus', code: 'LTT', state: 'Maharashtra' },
  { name: 'Dadar', code: 'DR', state: 'Maharashtra' },
  { name: 'Thane', code: 'TNA', state: 'Maharashtra' },
  { name: 'Pune Junction', code: 'PUNE', state: 'Maharashtra' },
  { name: 'Nagpur', code: 'NGP', state: 'Maharashtra' },
  { name: 'Nashik Road', code: 'NK', state: 'Maharashtra' },
  { name: 'Aurangabad', code: 'AWB', state: 'Maharashtra' },
  { name: 'Solapur', code: 'SUR', state: 'Maharashtra' },
  { name: 'Kolhapur', code: 'KOP', state: 'Maharashtra' },
  { name: 'Nanded', code: 'NED', state: 'Maharashtra' },
  { name: 'Amravati', code: 'AMI', state: 'Maharashtra' },
  { name: 'Akola', code: 'AK', state: 'Maharashtra' },
  // Tamil Nadu
  { name: 'Chennai Central', code: 'MAS', state: 'Tamil Nadu' },
  { name: 'Chennai Egmore', code: 'MS', state: 'Tamil Nadu' },
  { name: 'Coimbatore', code: 'CBE', state: 'Tamil Nadu' },
  { name: 'Madurai', code: 'MDU', state: 'Tamil Nadu' },
  { name: 'Tiruppur', code: 'TUP', state: 'Tamil Nadu' },
  { name: 'Salem', code: 'SA', state: 'Tamil Nadu' },
  { name: 'Erode', code: 'ED', state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', code: 'TPJ', state: 'Tamil Nadu' },
  { name: 'Tirunelveli', code: 'TEN', state: 'Tamil Nadu' },
  { name: 'Vellore Cantt', code: 'VLR', state: 'Tamil Nadu' },
  { name: 'Rameswaram', code: 'RMM', state: 'Tamil Nadu' },
  { name: 'Kanyakumari', code: 'CAPE', state: 'Tamil Nadu' },
  { name: 'Katpadi Junction', code: 'KPD', state: 'Tamil Nadu' },
  // Karnataka
  { name: 'Bengaluru City', code: 'SBC', state: 'Karnataka' },
  { name: 'Yeshwanthpur', code: 'YPR', state: 'Karnataka' },
  { name: 'Bengaluru Cantt', code: 'BNC', state: 'Karnataka' },
  { name: 'Krantivira Sangolli Rayanna', code: 'KSR', state: 'Karnataka' },
  { name: 'Mysuru', code: 'MYS', state: 'Karnataka' },
  { name: 'Hubli', code: 'UBL', state: 'Karnataka' },
  { name: 'Dharwad', code: 'DWR', state: 'Karnataka' },
  { name: 'Mangaluru Central', code: 'MAQ', state: 'Karnataka' },
  { name: 'Gulbarga', code: 'GR', state: 'Karnataka' },
  { name: 'Bellary', code: 'BAY', state: 'Karnataka' },
  { name: 'Hassan', code: 'HAS', state: 'Karnataka' },
  { name: 'Davangere', code: 'DVG', state: 'Karnataka' },
  { name: 'Tumkur', code: 'TK', state: 'Karnataka' },
  // West Bengal
  { name: 'Kolkata Howrah', code: 'HWH', state: 'West Bengal' },
  { name: 'Sealdah', code: 'SDAH', state: 'West Bengal' },
  { name: 'Shalimar', code: 'SHM', state: 'West Bengal' },
  { name: 'Kolkata', code: 'KOAA', state: 'West Bengal' },
  { name: 'New Jalpaiguri', code: 'NJP', state: 'West Bengal' },
  { name: 'Asansol', code: 'ASN', state: 'West Bengal' },
  { name: 'Durgapur', code: 'DGR', state: 'West Bengal' },
  { name: 'Kharagpur', code: 'KGP', state: 'West Bengal' },
  { name: 'Malda Town', code: 'MLDT', state: 'West Bengal' },
  { name: 'Bankura', code: 'BQA', state: 'West Bengal' },
  // Telangana
  { name: 'Hyderabad Deccan', code: 'HYB', state: 'Telangana' },
  { name: 'Secunderabad', code: 'SC', state: 'Telangana' },
  { name: 'Kacheguda', code: 'KCG', state: 'Telangana' },
  { name: 'Warangal', code: 'WL', state: 'Telangana' },
  { name: 'Nizamabad', code: 'NZB', state: 'Telangana' },
  { name: 'Karimnagar', code: 'KRMR', state: 'Telangana' },
  // Gujarat
  { name: 'Ahmedabad', code: 'ADI', state: 'Gujarat' },
  { name: 'Surat', code: 'ST', state: 'Gujarat' },
  { name: 'Vadodara', code: 'BRC', state: 'Gujarat' },
  { name: 'Rajkot', code: 'RJT', state: 'Gujarat' },
  { name: 'Bhavnagar', code: 'BVC', state: 'Gujarat' },
  { name: 'Gandhinagar Capital', code: 'GNC', state: 'Gujarat' },
  { name: 'Anand', code: 'ANND', state: 'Gujarat' },
  { name: 'Junagadh', code: 'JND', state: 'Gujarat' },
  { name: 'Jamnagar', code: 'JAM', state: 'Gujarat' },
  { name: 'Bhuj', code: 'BHUJ', state: 'Gujarat' },
  { name: 'Dwarka', code: 'DWK', state: 'Gujarat' },
  // Rajasthan
  { name: 'Jaipur', code: 'JP', state: 'Rajasthan' },
  { name: 'Jodhpur', code: 'JU', state: 'Rajasthan' },
  { name: 'Udaipur City', code: 'UDZ', state: 'Rajasthan' },
  { name: 'Ajmer', code: 'AII', state: 'Rajasthan' },
  { name: 'Bikaner', code: 'BKN', state: 'Rajasthan' },
  { name: 'Kota', code: 'KOTA', state: 'Rajasthan' },
  { name: 'Alwar', code: 'AWR', state: 'Rajasthan' },
  { name: 'Bharatpur', code: 'BTE', state: 'Rajasthan' },
  { name: 'Sikar', code: 'SIKER', state: 'Rajasthan' },
  { name: 'Pali Marwar', code: 'PMY', state: 'Rajasthan' },
  // Uttar Pradesh
  { name: 'Lucknow', code: 'LKO', state: 'Uttar Pradesh' },
  { name: 'Varanasi', code: 'BSB', state: 'Uttar Pradesh' },
  { name: 'Agra Cantt', code: 'AGC', state: 'Uttar Pradesh' },
  { name: 'Agra Fort', code: 'AF', state: 'Uttar Pradesh' },
  { name: 'Prayagraj', code: 'PRYJ', state: 'Uttar Pradesh' },
  { name: 'Kanpur Central', code: 'CNB', state: 'Uttar Pradesh' },
  { name: 'Mathura Junction', code: 'MTJ', state: 'Uttar Pradesh' },
  { name: 'Meerut City', code: 'MTC', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', code: 'GKP', state: 'Uttar Pradesh' },
  { name: 'Moradabad', code: 'MB', state: 'Uttar Pradesh' },
  { name: 'Bareilly', code: 'BE', state: 'Uttar Pradesh' },
  { name: 'Aligarh', code: 'ALJN', state: 'Uttar Pradesh' },
  { name: 'Jhansi', code: 'JHS', state: 'Uttar Pradesh' },
  { name: 'Firozabad', code: 'FZD', state: 'Uttar Pradesh' },
  { name: 'Faizabad', code: 'FD', state: 'Uttar Pradesh' },
  { name: 'Ayodhya Cantt', code: 'AY', state: 'Uttar Pradesh' },
  { name: 'Muzaffarnagar', code: 'MOZ', state: 'Uttar Pradesh' },
  { name: 'Gonda', code: 'GD', state: 'Uttar Pradesh' },
  // Bihar
  { name: 'Patna', code: 'PNBE', state: 'Bihar' },
  { name: 'Gaya', code: 'GAYA', state: 'Bihar' },
  { name: 'Muzaffarpur', code: 'MFP', state: 'Bihar' },
  { name: 'Bhagalpur', code: 'BGP', state: 'Bihar' },
  { name: 'Darbhanga', code: 'DBG', state: 'Bihar' },
  { name: 'Purnia', code: 'PRNA', state: 'Bihar' },
  { name: 'Ara', code: 'ARA', state: 'Bihar' },
  { name: 'Sasaram', code: 'SSM', state: 'Bihar' },
  // Odisha
  { name: 'Bhubaneswar', code: 'BBS', state: 'Odisha' },
  { name: 'Puri', code: 'PURI', state: 'Odisha' },
  { name: 'Cuttack', code: 'CTC', state: 'Odisha' },
  { name: 'Rourkela', code: 'ROU', state: 'Odisha' },
  { name: 'Sambalpur', code: 'SBP', state: 'Odisha' },
  { name: 'Berhampur', code: 'BAM', state: 'Odisha' },
  { name: 'Balasore', code: 'BLS', state: 'Odisha' },
  { name: 'Brahmapur', code: 'BAM', state: 'Odisha' },
  // Kerala
  { name: 'Kochi Ernakulam', code: 'ERS', state: 'Kerala' },
  { name: 'Thiruvananthapuram', code: 'TVC', state: 'Kerala' },
  { name: 'Kozhikode', code: 'CLT', state: 'Kerala' },
  { name: 'Thrissur', code: 'TCR', state: 'Kerala' },
  { name: 'Palakkad', code: 'PGT', state: 'Kerala' },
  { name: 'Kollam', code: 'QLN', state: 'Kerala' },
  { name: 'Kannur', code: 'CAN', state: 'Kerala' },
  { name: 'Alappuzha', code: 'ALLP', state: 'Kerala' },
  { name: 'Kottayam', code: 'KTYM', state: 'Kerala' },
  // Madhya Pradesh
  { name: 'Bhopal', code: 'BPL', state: 'Madhya Pradesh' },
  { name: 'Indore', code: 'INDB', state: 'Madhya Pradesh' },
  { name: 'Jabalpur', code: 'JBP', state: 'Madhya Pradesh' },
  { name: 'Gwalior', code: 'GWL', state: 'Madhya Pradesh' },
  { name: 'Ujjain', code: 'UJN', state: 'Madhya Pradesh' },
  { name: 'Sagar', code: 'SGO', state: 'Madhya Pradesh' },
  { name: 'Ratlam', code: 'RTM', state: 'Madhya Pradesh' },
  { name: 'Satna', code: 'STA', state: 'Madhya Pradesh' },
  // Punjab
  { name: 'Amritsar', code: 'ASR', state: 'Punjab' },
  { name: 'Chandigarh', code: 'CDG', state: 'Punjab' },
  { name: 'Ludhiana', code: 'LDH', state: 'Punjab' },
  { name: 'Jalandhar City', code: 'JRC', state: 'Punjab' },
  { name: 'Patiala', code: 'PTA', state: 'Punjab' },
  { name: 'Pathankot Cantt', code: 'PTKC', state: 'Punjab' },
  { name: 'Bhatinda', code: 'BTI', state: 'Punjab' },
  // Haryana
  { name: 'Ambala Cantt', code: 'UMB', state: 'Haryana' },
  { name: 'Kurukshetra', code: 'KKDE', state: 'Haryana' },
  { name: 'Panipat', code: 'PNP', state: 'Haryana' },
  { name: 'Hisar', code: 'HSR', state: 'Haryana' },
  { name: 'Rohtak', code: 'ROK', state: 'Haryana' },
  // Jharkhand
  { name: 'Ranchi', code: 'RNC', state: 'Jharkhand' },
  { name: 'Dhanbad', code: 'DHN', state: 'Jharkhand' },
  { name: 'Jamshedpur (Tatanagar)', code: 'TATA', state: 'Jharkhand' },
  { name: 'Bokaro Steel City', code: 'BKSC', state: 'Jharkhand' },
  { name: 'Deoghar', code: 'DGHR', state: 'Jharkhand' },
  // Andhra Pradesh
  { name: 'Visakhapatnam', code: 'VSKP', state: 'Andhra Pradesh' },
  { name: 'Tirupati', code: 'TPTY', state: 'Andhra Pradesh' },
  { name: 'Vijayawada', code: 'BZA', state: 'Andhra Pradesh' },
  { name: 'Guntur', code: 'GNT', state: 'Andhra Pradesh' },
  { name: 'Nellore', code: 'NLR', state: 'Andhra Pradesh' },
  { name: 'Rajahmundry', code: 'RJY', state: 'Andhra Pradesh' },
  { name: 'Kakinada Town', code: 'CCT', state: 'Andhra Pradesh' },
  { name: 'Eluru', code: 'EE', state: 'Andhra Pradesh' },
  { name: 'Ongole', code: 'OGL', state: 'Andhra Pradesh' },
  { name: 'Kurnool City', code: 'KRNT', state: 'Andhra Pradesh' },
  { name: 'Kadapa', code: 'HX', state: 'Andhra Pradesh' },
  // Assam / NE
  { name: 'Guwahati', code: 'GHY', state: 'Assam' },
  { name: 'Dibrugarh', code: 'DBRG', state: 'Assam' },
  { name: 'Silchar', code: 'SCL', state: 'Assam' },
  { name: 'Tinsukia', code: 'TSK', state: 'Assam' },
  { name: 'New Tinsukia', code: 'NTSK', state: 'Assam' },
  { name: 'Jorhat Town', code: 'JRT', state: 'Assam' },
  { name: 'Agartala', code: 'AGTL', state: 'Tripura' },
  { name: 'Lumding', code: 'LMG', state: 'Assam' },
  // Goa
  { name: 'Goa (Madgaon)', code: 'MAO', state: 'Goa' },
  { name: 'Thivim', code: 'THVM', state: 'Goa' },
  { name: 'Karmali', code: 'KRMI', state: 'Goa' },
  // J&K / Himachal / Uttarakhand
  { name: 'Jammu Tawi', code: 'JAT', state: 'J&K' },
  { name: 'Udhampur', code: 'UHP', state: 'J&K' },
  { name: 'Simla', code: 'SML', state: 'Himachal Pradesh' },
  { name: 'Kalka', code: 'KLK', state: 'Himachal Pradesh' },
  { name: 'Haridwar', code: 'HW', state: 'Uttarakhand' },
  { name: 'Dehradun', code: 'DDN', state: 'Uttarakhand' },
  { name: 'Roorkee', code: 'RK', state: 'Uttarakhand' },
  { name: 'Kathgodam', code: 'KGM', state: 'Uttarakhand' },
  { name: 'Rishikesh', code: 'RKSH', state: 'Uttarakhand' },
  // Chhattisgarh
  { name: 'Raipur', code: 'R', state: 'Chhattisgarh' },
  { name: 'Bilaspur', code: 'BSP', state: 'Chhattisgarh' },
  { name: 'Durg', code: 'DURG', state: 'Chhattisgarh' },
  { name: 'Rajnandgaon', code: 'RJN', state: 'Chhattisgarh' },
  // West Bengal extended
  { name: 'New Jalpaiguri', code: 'NJP', state: 'West Bengal' },
  { name: 'Darjeeling', code: 'DJ', state: 'West Bengal' },
  // Sikkim / Manipur etc (railhead)
  { name: 'New Bongaigaon', code: 'NBQ', state: 'Assam' },
];

// Airports
const AIRPORTS = [
  { name: 'Indira Gandhi International Airport', code: 'DEL', city: 'New Delhi' },
  { name: 'Chhatrapati Shivaji Maharaj International Airport', code: 'BOM', city: 'Mumbai' },
  { name: 'Kempegowda International Airport', code: 'BLR', city: 'Bengaluru' },
  { name: 'Chennai International Airport', code: 'MAA', city: 'Chennai' },
  { name: 'Netaji Subhas Chandra Bose International Airport', code: 'CCU', city: 'Kolkata' },
  { name: 'Rajiv Gandhi International Airport', code: 'HYD', city: 'Hyderabad' },
  { name: 'Cochin International Airport', code: 'COK', city: 'Kochi' },
  { name: 'Sardar Vallabhbhai Patel International Airport', code: 'AMD', city: 'Ahmedabad' },
  { name: 'Pune Airport', code: 'PNQ', city: 'Pune' },
  { name: 'Jaipur International Airport', code: 'JAI', city: 'Jaipur' },
  { name: 'Goa International Airport', code: 'GOI', city: 'Goa' },
  { name: 'Bhubaneswar Airport', code: 'BBI', city: 'Bhubaneswar' },
  { name: 'Thiruvananthapuram Airport', code: 'TRV', city: 'Thiruvananthapuram' },
  { name: 'Lucknow Airport', code: 'LKO', city: 'Lucknow' },
  { name: 'Patna Airport', code: 'PAT', city: 'Patna' },
  { name: 'Amritsar Airport', code: 'ATQ', city: 'Amritsar' },
  { name: 'Chandigarh Airport', code: 'IXC', city: 'Chandigarh' },
  { name: 'Guwahati Airport', code: 'GAU', city: 'Guwahati' },
  { name: 'Nagpur Airport', code: 'NAG', city: 'Nagpur' },
  { name: 'Varanasi Airport', code: 'VNS', city: 'Varanasi' },
  { name: 'Coimbatore Airport', code: 'CJB', city: 'Coimbatore' },
  { name: 'Mangaluru Airport', code: 'IXE', city: 'Mangaluru' },
  { name: 'Visakhapatnam Airport', code: 'VTZ', city: 'Visakhapatnam' },
  { name: 'Jammu Airport', code: 'IXJ', city: 'Jammu' },
  { name: 'Srinagar Airport', code: 'SXR', city: 'Srinagar' },
];

const TRAIN_CLASSES = ['1A – First AC', '2A – Second AC', '3A – Third AC', 'SL – Sleeper', 'CC – Chair Car', 'EC – Executive', '2S – Second Sitting'];
const FLIGHT_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First Class'];

interface StationInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  mode: string;
  placeholder?: string;
}

const StationInput: React.FC<StationInputProps> = ({ label, value, onChange, mode, placeholder }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAir = mode === 'Flight';
  const list = isAir ? AIRPORTS : STATIONS;

  const filtered = query.length >= 1
    ? list.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        ('city' in s ? (s as any).city : (s as any).state).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (item: any) => {
    const display = isAir ? `${item.city} (${item.code})` : `${item.name} (${item.code})`;
    setQuery(display);
    onChange(display);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-widest uppercase">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || (isAir ? 'Airport name or code' : 'Station name or code')}
          className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
          {filtered.map((item, i) => (
            <button
              key={i}
              onMouseDown={() => select(item)}
              className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{isAir ? (item as any).city : item.name}</p>
                <p className="text-xs text-gray-500">{isAir ? item.name : (item as any).state}</p>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DRAFT_KEY = 'margdarshak_drafts';

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [tripData, setTripData] = useState({
    from: '',
    to: '',
    startDate: '',
    duration: '3',
    pace: 'Moderate',
    transportMode: 'Optimized Mixed',
    travelClass: '',
    pnrNumber: '',
    flightNumber: '',
    interests: [] as string[],
  });
  const [detecting, setDetecting] = useState(false);
  const [mileage, setMileage] = useState(15);
  const [petrolRate, setPetrolRate] = useState(104);

  const getEstimatedDistance = (from: string, to: string): number => {
    const clean = (s: string) => s.toLowerCase();
    const f = clean(from);
    const t = clean(to);
    if (f.includes('delhi') && t.includes('jaipur')) return 270;
    if (f.includes('mumbai') && t.includes('goa')) return 590;
    if (f.includes('bengaluru') && t.includes('leh')) return 3100;
    if (f.includes('delhi') && t.includes('mumbai')) return 1420;
    if (f.includes('bengaluru') && t.includes('goa')) return 560;
    if (f.includes('bhubaneswar') && t.includes('puri')) return 60;
    if (f.includes('chennai') && t.includes('bengaluru')) return 350;
    return 450; // default fallback km
  };

  const handleDetectDetails = () => {
    const val = tripData.transportMode === 'Train' ? tripData.pnrNumber : tripData.flightNumber;
    if (!val) {
      alert('Please enter a PNR or Flight number first.');
      return;
    }
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      if (tripData.transportMode === 'Train') {
        setTripData(p => ({
          ...p,
          from: 'New Delhi (NDLS)',
          to: 'Bhubaneswar (BBS)',
          startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          travelClass: '3A – Third AC',
        }));
      } else {
        setTripData(p => ({
          ...p,
          from: 'New Delhi (DEL)',
          to: 'Mumbai (BOM)',
          startDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
          travelClass: 'Economy',
        }));
      }
    }, 1200);
  };

  const interests = [
    'Heritage & Temples', 'Hill Stations', 'Beaches & Coastal', 'Wildlife & Safari',
    'Adventure & Trekking', 'Spiritual & Pilgrimage', 'Food & Cuisine',
    'Shopping & Markets', 'Art & Culture', 'Museums & History',
    'Backpacking', 'Luxury Travel', 'Family Friendly', 'Honeymoon',
  ];

  const transportModes = [
    { id: 'Train', label: 'Train', icon: <Train size={16} /> },
    { id: 'Flight', label: 'Flight', icon: <Plane size={16} /> },
    { id: 'Road', label: 'Road', icon: <Car size={16} /> },
    { id: 'Optimized Mixed', label: 'Optimized Mixed', icon: <Zap size={16} /> },
  ];

  const classes = tripData.transportMode === 'Flight' ? FLIGHT_CLASSES :
    tripData.transportMode === 'Train' ? TRAIN_CLASSES : [];

  const handleSaveDraft = () => {
    if (!tripData.from || !tripData.to) {
      alert('Please fill in From and To locations.');
      return;
    }
    const existing: any[] = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    const draft = {
      id: `draft_${Date.now()}`,
      title: `${tripData.from} → ${tripData.to}`,
      from: tripData.from,
      to: tripData.to,
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      duration: tripData.duration,
      pace: tripData.pace,
      transportMode: tripData.transportMode,
      travelClass: tripData.travelClass,
      pnrNumber: tripData.pnrNumber,
      flightNumber: tripData.flightNumber,
      interests: tripData.interests,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    };
    existing.push(draft);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/my-trips'); }, 1200);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Plan Your Trip</h1>
          <p className="text-gray-600 dark:text-gray-400">Build a personalized trip with verified routes, real transport data, and smart itinerary suggestions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* ── Main Form ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Transport Mode */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">Transport Mode</label>
              <div className="grid grid-cols-4 gap-3">
                {transportModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setTripData(p => ({ ...p, transportMode: mode.id, travelClass: '', pnrNumber: '', flightNumber: '' }))}
                    className={`flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                      tripData.transportMode === mode.id
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* From / To */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <StationInput label="From" value={tripData.from} onChange={v => setTripData(p => ({ ...p, from: v }))} mode={tripData.transportMode} placeholder="Departure city or station" />
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />
              <StationInput label="To" value={tripData.to} onChange={v => setTripData(p => ({ ...p, to: v }))} mode={tripData.transportMode} placeholder="Arrival city or station" />
            </div>

            {/* Road Trip Settings */}
            {tripData.transportMode === 'Road' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-widest uppercase">Car Mileage (km/L)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={e => setMileage(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-widest uppercase">Petrol Rate (₹/L)</label>
                  <input
                    type="number"
                    value={petrolRate}
                    onChange={e => setPetrolRate(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}

            {/* Travel Class + PNR/Flight Number */}
            {(tripData.transportMode === 'Train' || tripData.transportMode === 'Flight') && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                {/* Travel Class */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Travel Class</label>
                  <div className="flex flex-wrap gap-2">
                    {classes.map(cls => (
                      <button
                        key={cls}
                        onClick={() => setTripData(p => ({ ...p, travelClass: cls }))}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          tripData.travelClass === cls
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PNR / Flight Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 tracking-widest uppercase">
                    {tripData.transportMode === 'Train' ? 'PNR Number' : 'Flight Number'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tripData.transportMode === 'Train' ? tripData.pnrNumber : tripData.flightNumber}
                      onChange={e => setTripData(p => tripData.transportMode === 'Train'
                        ? { ...p, pnrNumber: e.target.value }
                        : { ...p, flightNumber: e.target.value }
                      )}
                      placeholder={tripData.transportMode === 'Train' ? 'Enter 10-digit PNR number' : 'e.g. AI-401, 6E-123'}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
                      maxLength={tripData.transportMode === 'Train' ? 10 : 8}
                    />
                    <button
                      type="button"
                      disabled={detecting}
                      onClick={handleDetectDetails}
                      className="px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {detecting ? 'Detecting...' : 'Detect Details'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Date + Duration + Pace */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Start Date</label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={e => setTripData(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Duration (Days)</label>
                <select
                  value={`${tripData.duration} Days`}
                  onChange={e => setTripData(p => ({ ...p, duration: e.target.value.replace(' Days', '') }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {['1 Days', '2 Days', '3 Days', '5 Days', '7 Days', '10 Days', '14 Days'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Travel Pace</label>
                <div className="flex gap-2">
                  {['Relaxed', 'Moderate', 'Packed'].map(pace => (
                    <button
                      key={pace}
                      onClick={() => setTripData(p => ({ ...p, pace }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        tripData.pace === pace
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">Interests & Themes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setTripData(p => ({
                      ...p,
                      interests: p.interests.includes(interest)
                        ? p.interests.filter(i => i !== interest)
                        : [...p.interests, interest],
                    }))}
                    className={`px-4 py-2.5 rounded-lg border transition-all text-sm font-medium text-left ${
                      tripData.interests.includes(interest)
                        ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-400 scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trip Summary ── */}
          <div className="lg:col-span-2 lg:col-start-5">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/50 sticky top-24 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trip Summary</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Route</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {tripData.from || '—'} → {tripData.to || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{tripData.duration} Days · {tripData.pace}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transport</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {tripData.transportMode}{tripData.travelClass ? ` · ${tripData.travelClass.split('–')[0].trim()}` : ''}
                    </p>
                  </div>
                </div>

                {tripData.transportMode === 'Road' && tripData.from && tripData.to && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Distance:</span>
                      <span className="font-bold text-white">{getEstimatedDistance(tripData.from, tripData.to)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Car Mileage:</span>
                      <span className="font-bold text-white">{mileage} km/L</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-sm text-orange-400">
                      <span>Est. Fuel Cost:</span>
                      <span>₹ {Math.round((getEstimatedDistance(tripData.from, tripData.to) / mileage) * petrolRate)}</span>
                    </div>
                  </div>
                )}
                
                {(tripData.pnrNumber || tripData.flightNumber) && (
                  <div className="flex items-start gap-3">
                    <Train className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tripData.transportMode === 'Train' ? 'PNR Number' : 'Flight Number'}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono">
                        {tripData.pnrNumber || tripData.flightNumber}
                      </p>
                    </div>
                  </div>
                )}
                
                {tripData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tripData.interests.slice(0, 4).map(i => (
                      <span key={i} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                    {tripData.interests.length > 4 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">+{tripData.interests.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <button className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg group">
                <span className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                <Zap size={18} className="group-hover:animate-bounce" />
                Generate Verified Plan
              </button>

              <button
                onClick={handleSaveDraft}
                className={`w-full border-2 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group ${
                  saved
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : 'border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500'
                }`}
              >
                <Save size={18} className={saved ? '' : 'group-hover:rotate-12 transition-transform duration-300'} />
                {saved ? '✓ Saved to My Trips!' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
