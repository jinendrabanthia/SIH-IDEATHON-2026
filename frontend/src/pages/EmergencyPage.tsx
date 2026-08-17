import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Phone, ShieldAlert, HeartPulse, Flame, Info, Search, MapPin, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { apiClient } from '../api/client';

interface Contact {
  name: string;
  number: string;
  description: string;
}

interface StateEmergencyInfo {
  state: string;
  touristPolice?: string;
  disasterMgmt?: string;
  medicalHelpline?: string;
  bloodBankInfo?: string;
}

const NATIONAL_HELPLINES: Contact[] = [
  { name: 'National Emergency Number', number: '112', description: 'All-in-one emergency helpline across India.' },
  { name: 'Police', number: '100', description: 'Direct contact to local law enforcement.' },
  { name: 'Ambulance & Medical', number: '102', description: 'Emergency medical services and ambulances.' },
  { name: 'Fire Services', number: '101', description: 'Direct contact to the fire department.' },
  { name: 'Women Helpline', number: '1091', description: 'Safety & distress support for women.' },
  { name: 'Tourist Helpline (Govt of India)', number: '1363 / 1800-11-1363', description: '24/7 Multi-lingual helper for tourists (English, Hindi, international languages).' },
  { name: 'Disaster Management (NDMA)', number: '1078', description: 'National disaster response and warning updates.' },
];

const STATE_DATA: StateEmergencyInfo[] = [
  { state: 'Delhi', touristPolice: '011-23378890', disasterMgmt: '1077', medicalHelpline: '104' },
  { state: 'Odisha', touristPolice: '0674-2530100', disasterMgmt: '1070', medicalHelpline: '104' },
  { state: 'Maharashtra', touristPolice: '022-22621855', disasterMgmt: '022-22027990', medicalHelpline: '104' },
  { state: 'Karnataka', touristPolice: '080-22200123', disasterMgmt: '1070', medicalHelpline: '104' },
  { state: 'Goa', touristPolice: '0832-2428224', disasterMgmt: '1070', medicalHelpline: '104' },
  { state: 'Kerala', touristPolice: '0471-2561500', disasterMgmt: '1070', medicalHelpline: '104' },
  { state: 'Rajasthan', touristPolice: '0141-2824300', disasterMgmt: '1070', medicalHelpline: '104' },
  { state: 'Tamil Nadu', touristPolice: '044-23452500', disasterMgmt: '1070', medicalHelpline: '104' },
];

export const EmergencyPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('Delhi');
  const currentStateData = STATE_DATA.find(s => s.state === selectedState) || STATE_DATA[0];
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ emergencyContactName?: string; emergencyContactPhone?: string } | null>(null);

  useEffect(() => {
    if (user) {
      apiClient.get('/users/me').then(res => {
        if (res.data?.data) {
          setProfile({
            emergencyContactName: res.data.data.emergencyContactName,
            emergencyContactPhone: res.data.data.emergencyContactPhone,
          });
        }
      }).catch(err => console.error('Failed to load emergency contact', err));
    }
  }, [user]);

  const handleWhatsApp = () => {
    if (!profile?.emergencyContactPhone) return;
    const cleanNumber = profile.emergencyContactPhone.replace(/\D/g, '');
    const message = encodeURIComponent("🚨 URGENT: I need help! Please contact me immediately. I am using the SIH Travel Assistant.");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
            🚨 Emergency Services Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            24/7 direct dial hotlines and essential state-level tourist support numbers in India.
          </p>
        </div>

        {/* SOS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-red-500/5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center mb-4">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">National Emergency</h3>
              <p className="text-xs text-slate-400">All-in-one helpline for Police, Medical or Fire emergencies.</p>
            </div>
            <a 
              href="tel:112"
              className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-center text-lg shadow-md transition-colors block"
            >
              📞 Dial 112
            </a>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-amber-500/5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4">
                <Info size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Tourist Helpline</h3>
              <p className="text-xs text-slate-400">24/7 Multi-lingual assistance provided by Ministry of Tourism.</p>
            </div>
            <a 
              href="tel:1363"
              className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-center text-lg shadow-md transition-colors block"
            >
              📞 Dial 1363
            </a>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-orange-500/5">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4">
                <HeartPulse size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Medical Helpline</h3>
              <p className="text-xs text-slate-400">Instant connection for ambulance services across regions.</p>
            </div>
            <a 
              href="tel:102"
              className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-center text-lg shadow-md transition-colors block"
            >
              📞 Dial 102
            </a>
          </div>

        </div>

        {/* My Emergency Contact (if exists) */}
        {profile?.emergencyContactPhone && (
          <div className="mb-10 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-green-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">My Emergency Contact</h3>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-green-400">{profile.emergencyContactName || 'Contact'}</span> — {profile.emergencyContactPhone}
                </p>
              </div>
            </div>
            <button 
              onClick={handleWhatsApp}
              className="w-full md:w-auto px-8 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-xl text-center text-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              WhatsApp Alert
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* National Directories */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">National Helplines</h2>
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl divide-y divide-white/5">
              {NATIONAL_HELPLINES.map((helpline, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{helpline.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{helpline.description}</p>
                  </div>
                  <a
                    href={`tel:${helpline.number.replace(/\s+/g, '')}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-orange-400 hover:text-orange-300 font-bold text-xs rounded-xl border border-white/5 transition-all shrink-0"
                  >
                    {helpline.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* State Level Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">State Specific Contacts</h2>
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Select State / UT</label>
              <div className="relative mb-6">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-colors text-sm font-semibold"
                >
                  {STATE_DATA.map(s => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Tourist Police</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentStateData.touristPolice || 'N/A'}</p>
                  </div>
                  {currentStateData.touristPolice && (
                    <a href={`tel:${currentStateData.touristPolice}`} className="p-2 bg-white/5 rounded-lg text-orange-400 hover:bg-white/10">
                      📞
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Disaster Control Room</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentStateData.disasterMgmt || 'N/A'}</p>
                  </div>
                  {currentStateData.disasterMgmt && (
                    <a href={`tel:${currentStateData.disasterMgmt}`} className="p-2 bg-white/5 rounded-lg text-orange-400 hover:bg-white/10">
                      📞
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Medical Helpline</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentStateData.medicalHelpline || 'N/A'}</p>
                  </div>
                  {currentStateData.medicalHelpline && (
                    <a href={`tel:${currentStateData.medicalHelpline}`} className="p-2 bg-white/5 rounded-lg text-orange-400 hover:bg-white/10">
                      📞
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};
