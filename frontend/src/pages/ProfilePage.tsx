import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../lib/AuthContext';
import { apiClient } from '../api/client';
import { User, Settings, Heart, AlertCircle, Save } from 'lucide-react';

interface Preferences {
  budgetBand: string;
  pace: string;
  groupType: string;
  transportPreference: string;
  accessibilityMobility: boolean;
  accessibilityVision: boolean;
  accessibilityHearing: boolean;
  accessibilityCognitive: boolean;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [profile, setProfile] = useState<{ emergencyContactName?: string; emergencyContactPhone?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefRes, profRes] = await Promise.all([
          apiClient.get('/users/me/preferences'),
          apiClient.get('/users/me')
        ]);
        setPreferences(prefRes.data.data);
        setProfile({
          emergencyContactName: profRes.data.data.emergencyContactName || '',
          emergencyContactPhone: profRes.data.data.emergencyContactPhone || '',
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!preferences) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const promises = [];
      if (preferences) {
        promises.push(apiClient.put('/users/me/preferences', preferences));
      }
      if (profile) {
        promises.push(apiClient.patch('/users/me', {
          emergencyContactName: profile.emergencyContactName,
          emergencyContactPhone: profile.emergencyContactPhone
        }));
      }
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.error?.message || err?.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center text-slate-400">
          Loading profile...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation Sidebar */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10">
              <User size={18} /> Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 font-medium transition-colors">
              <Heart size={18} /> Travel Preferences
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 font-medium transition-colors">
              <AlertCircle size={18} /> Accessibility
            </button>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            
            {message && (
              <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Personal Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-slate-300 opacity-70"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email is managed by your authentication provider.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
                  <input 
                    type="text" 
                    value={user?.name || ''} 
                    disabled
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-slate-300 opacity-70"
                  />
                </div>
              </div>
            </div>

            {profile && (
              <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      value={profile.emergencyContactName || ''} 
                      onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={profile.emergencyContactPhone || ''} 
                      onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {preferences && (
              <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Travel Preferences</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Budget Band</label>
                    <select 
                      value={preferences.budgetBand || 'MODERATE'} 
                      onChange={(e) => setPreferences({ ...preferences, budgetBand: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="BUDGET">Budget Friendly</option>
                      <option value="MODERATE">Moderate / Balanced</option>
                      <option value="PREMIUM">Premium / Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Travel Pace</label>
                    <select 
                      value={preferences.pace || 'MODERATE'} 
                      onChange={(e) => setPreferences({ ...preferences, pace: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="RELAXED">Relaxed (Slow travel)</option>
                      <option value="MODERATE">Moderate (Standard)</option>
                      <option value="PACKED">Packed (See it all)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Group Type</label>
                    <select 
                      value={preferences.groupType || 'SOLO'} 
                      onChange={(e) => setPreferences({ ...preferences, groupType: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="SOLO">Solo Traveler</option>
                      <option value="COUPLE">Couple</option>
                      <option value="FAMILY">Family (with kids)</option>
                      <option value="GROUP">Friends Group</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Transport Mode</label>
                    <select 
                      value={preferences.transportPreference || 'MIXED'} 
                      onChange={(e) => setPreferences({ ...preferences, transportPreference: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="WALKING">Walking primary</option>
                      <option value="PUBLIC_TRANSIT">Public Transit</option>
                      <option value="CAB">Cab / Taxi</option>
                      <option value="OWN_VEHICLE">Own Vehicle</option>
                      <option value="MIXED">Mixed / Optimized</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {preferences && (
              <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Accessibility Requirements</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.accessibilityMobility || false}
                      onChange={(e) => setPreferences({ ...preferences, accessibilityMobility: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500" 
                    />
                    Mobility Support (Wheelchair accessible routes, ramps)
                  </label>
                  <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.accessibilityVision || false}
                      onChange={(e) => setPreferences({ ...preferences, accessibilityVision: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500" 
                    />
                    Vision Support (Audio guides, braille, high contrast)
                  </label>
                  <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.accessibilityHearing || false}
                      onChange={(e) => setPreferences({ ...preferences, accessibilityHearing: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500" 
                    />
                    Hearing Support (Visual cues, sign language options)
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                {isSaving ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
