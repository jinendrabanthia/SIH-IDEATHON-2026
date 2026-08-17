import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { apiClient } from '../api/client';
import { BookOpen, DollarSign, Calendar, Heart, ShieldAlert, Award } from 'lucide-react';

interface ExchangeRates {
  inr: Record<string, number>;
}

interface Holiday {
  date: string;
  localName: string;
  name: string;
}

export const TravelGuidePage: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [inrAmount, setInrAmount] = useState<number>(100);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');
  const [conversionResult, setConversionResult] = useState<string>('');

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const rateRes = await apiClient.get('/services/exchange-rates');
        setExchangeRates(rateRes.data.data);
        
        const holidayRes = await apiClient.get('/services/holidays?countryCode=IN');
        setHolidays((holidayRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load travel services data:', err);
      }
    };
    fetchGuideData();
  }, []);

  // Update conversion
  useEffect(() => {
    if (!exchangeRates || !exchangeRates.inr) return;
    const rate = exchangeRates.inr[selectedCurrency.toLowerCase()];
    if (rate) {
      const converted = (inrAmount * rate).toFixed(2);
      setConversionResult(`${inrAmount} INR = ${converted} ${selectedCurrency.toUpperCase()}`);
    }
  }, [inrAmount, selectedCurrency, exchangeRates]);

  const currencyList = exchangeRates?.inr ? Object.keys(exchangeRates.inr).slice(0, 20) : ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad'];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            📚 India Travel Companion
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Essential facts, currency calculators, public holiday schedules, and general safety guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Guides */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cultural Tips */}
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Award size={18} className="text-orange-400" /> Cultural Etiquette & Tips
              </h2>
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <div>
                  <h4 className="font-bold text-white mb-1">👟 Footwear Policy</h4>
                  <p>Always remove shoes before entering temples, mosques, or local homes. Look for shoe-keeping counters at tourist sites.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">🙏 Greeting</h4>
                  <p>A polite "Namaste" with folded hands is the traditional greeting and highly appreciated by locals.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">👗 Dress Modestly</h4>
                  <p>When visiting religious places, ensure shoulders and knees are covered. Carry a light scarf to cover your head if required.</p>
                </div>
              </div>
            </div>

            {/* Health & Safety */}
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <ShieldAlert size={18} className="text-red-400" /> Health & Safety Advisories
              </h2>
              <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex gap-2">
                  <span className="text-orange-400">💧</span> 
                  <span><strong>Drinking Water:</strong> Only drink sealed bottled water or verified purified water. Avoid ice in street stalls.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">🌶️</span>
                  <span><strong>Street Food:</strong> Try street food only at busy stalls with high customer turnover to ensure freshness. Make sure it's piping hot.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">☀️</span>
                  <span><strong>Weather Prep:</strong> Carry sunscreen, a hat, and stay hydrated, especially during the summer months (April–July).</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Widgets Sidebar */}
          <div className="space-y-6">
            
            {/* Currency Converter */}
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-slate-400">
                <DollarSign size={16} className="text-emerald-400" /> Currency Calculator
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    value={inrAmount}
                    onChange={(e) => setInrAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Convert to</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors text-sm font-semibold capitalize"
                  >
                    {currencyList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {conversionResult && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-center text-sm font-bold text-white">
                    {conversionResult}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-slate-400">
                <Calendar size={16} className="text-sky-400" /> Upcoming Holidays (India)
              </h3>
              {holidays.length === 0 ? (
                <p className="text-xs text-slate-400">Loading holidays...</p>
              ) : (
                <div className="space-y-3">
                  {holidays.map((h, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-white">{h.localName}</p>
                        <p className="text-slate-400 mt-0.5">{h.name}</p>
                      </div>
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-lg shrink-0 font-semibold">{h.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </MainLayout>
  );
};
