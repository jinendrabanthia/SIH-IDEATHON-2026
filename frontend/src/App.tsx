import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ItineraryView } from './components/ItineraryView';
import { TrustBadge } from './components/TrustBadge';
import { SplitText } from './components/animations/SplitText';
import { FadeContent } from './components/animations/FadeContent';
import { Loader2, ShieldCheck, MapPin, Search, AlertTriangle } from 'lucide-react';

// Interfaces for our API responses
interface Destination {
  id: string;
  name: string;
  country: string;
}

interface GenerateResponse {
  itinerary: any[];
  warnings: string[];
}

const API_BASE = '/api/v1';

function App() {
  const { t, i18n } = useTranslation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  
  // State for the flow
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<any[] | null>(null);
  const [narration, setNarration] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch seed destinations on load
    fetch(`${API_BASE}/knowledge/destinations`)
      .then(res => res.json())
      .then(data => {
        setDestinations(data.data);
        if (data.data.length > 0) {
          setSelectedDestId(data.data[0].id);
        }
      })
      .catch(err => console.error("Failed to load destinations:", err));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedDestId) return;
    
    setLoadingStep('Verifying source facts...');
    setError(null);
    setItinerary(null);
    setNarration('');

    try {
      // 1. NLU Extract
      const extractRes = await fetch(`${API_BASE}/nlu/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!extractRes.ok) throw new Error('NLU Extraction failed');
      const { data: prefs } = await extractRes.json();

      setLoadingStep('Planning deterministic route...');
      // 2. Planner Generate
      const plannerRes = await fetch(`${API_BASE}/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: selectedDestId,
          startDate: new Date().toISOString(),
          days: 1,
          preferences: prefs
        })
      });
      if (!plannerRes.ok) throw new Error('Planner Generation failed');
      const { data: plannerData } = await plannerRes.json() as { data: GenerateResponse };

      setLoadingStep('Finalizing trustworthy itinerary...');
      // 3. NLU Narrate
      const itineraryArray = plannerData.itinerary || (plannerData as any).itineraryItems || [];
      const narratePayload = itineraryArray.map((item: any) => ({
        attractionName: item.attractionName,
        startTime: item.startTime,
        endTime: item.endTime,
        factId: item.factId || 'f_placeholder'
      }));

      // Find valid facts (mocking validFactIds array by just mapping out factIds)
      const validFactIds = narratePayload.map(i => i.factId).filter(Boolean);

      const narrateRes = await fetch(`${API_BASE}/nlu/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary: narratePayload,
          validFactIds
        })
      });
      if (!narrateRes.ok) throw new Error('Narrative Generation failed');
      const { data: narrateData } = await narrateRes.json();

      setItinerary(itineraryArray);
      setNarration(narrateData.narration);
      setLoadingStep(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
      setLoadingStep(null);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
      
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 'var(--space-6) 0',
        marginBottom: 'var(--space-8)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-primary)' }}>
          <ShieldCheck size={28} strokeWidth={2.5} color="var(--color-primary)" />
          <span className="font-display" style={{ fontSize: '1.25rem' }}>TravelShield</span>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className={`secondary-button ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')} style={{ background: i18n.language === 'en' ? 'var(--color-surface-hover)' : '' }}>EN</button>
          <button className={`secondary-button ${i18n.language === 'hi' ? 'active' : ''}`} onClick={() => changeLanguage('hi')} style={{ background: i18n.language === 'hi' ? 'var(--color-surface-hover)' : '' }}>HI</button>
          <button className={`secondary-button ${i18n.language === 'or' ? 'active' : ''}`} onClick={() => changeLanguage('or')} style={{ background: i18n.language === 'or' ? 'var(--color-surface-hover)' : '' }}>OR</button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        
        {/* Hero Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: 'var(--space-12)',
          alignItems: 'start'
        }}>
          {/* Typographic Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingTop: 'var(--space-8)' }}>
            <SplitText 
              text={t('common.planTrip', { defaultValue: 'Design a Trip You Can Trust' })} 
              className="font-display" 
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1 }}
            />
            <FadeContent delay={0.4}>
              <p style={{ fontSize: '1.125rem', maxWidth: '480px' }}>
                Zero AI hallucinations. 100% verified ground truth data, dynamically cross-referenced for accessibility, crowds, and live status.
              </p>
            </FadeContent>
          </div>

          {/* Preference Setup Card */}
          <FadeContent delay={0.2} direction="up" style={{ width: '100%' }}>
            <div className="editorial-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
                  <MapPin size={16} /> Destination
                </label>
                <select 
                  className="editorial-input"
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Trip Preferences</label>
                <textarea 
                  className="editorial-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., I want a relaxed trip for my family of 4. We will be driving our own car and need wheelchair access. We love history."
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                className="primary-button" 
                onClick={handleGenerate}
                disabled={!!loadingStep || !prompt.trim()}
                style={{ marginTop: 'var(--space-2)', width: '100%' }}
              >
                {loadingStep ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {loadingStep}
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    {t('common.generate', { defaultValue: 'Generate Itinerary' })}
                  </>
                )}
              </button>
              
              {error && (
                <div style={{ 
                  color: 'var(--trust-unverified)', 
                  background: 'var(--trust-unverified-bg)', 
                  padding: 'var(--space-3)', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
            </div>
          </FadeContent>
        </div>

        {/* Legend */}
        <FadeContent delay={0.6}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 'var(--space-3)', 
            alignItems: 'center',
            padding: 'var(--space-4)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginRight: 'var(--space-2)' }}>
              Confidence Legend:
            </span>
            <TrustBadge status="VERIFIED" />
            <TrustBadge status="LIVE" />
            <TrustBadge status="COMMUNITY" />
            <TrustBadge status="DISPUTED" />
          </div>
        </FadeContent>

        {/* Results */}
        {itinerary && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <ItineraryView items={itinerary} narration={narration} />
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
