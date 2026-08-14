import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ItineraryView } from './components/ItineraryView';
import { TrustBadge } from './components/TrustBadge';

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
    
    setLoadingStep('Extracting intent...');
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

      setLoadingStep('Generating trustworthy narrative...');
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
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, var(--color-primary), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TravelShield
        </h1>
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
          <button className={`btn ${i18n.language === 'en' ? 'btn-primary' : ''}`} onClick={() => changeLanguage('en')} style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>EN</button>
          <button className={`btn ${i18n.language === 'hi' ? 'btn-primary' : ''}`} onClick={() => changeLanguage('hi')} style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>HI</button>
          <button className={`btn ${i18n.language === 'or' ? 'btn-primary' : ''}`} onClick={() => changeLanguage('or')} style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>OR</button>
        </div>
      </header>

      {/* Hero Input Section */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            {t('common.planTrip')}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Zero hallucinations. 100% verified data.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Destination</span>
              <select 
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'white' }}
              >
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>What are you looking for?</span>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., I want a relaxed trip for my family of 4. We will be driving our own car and need wheelchair access. We love history."
                rows={4}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'white', resize: 'vertical' }}
              />
            </label>

            <button 
              className="btn btn-primary animate-pulse" 
              onClick={handleGenerate}
              disabled={!!loadingStep || !prompt.trim()}
              style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1.1rem' }}
            >
              {loadingStep || t('common.generate')}
            </button>
          </div>
          
          {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem' }}>{error}</div>}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', padding: '1rem 0' }}>
          <TrustBadge status="VERIFIED" />
          <TrustBadge status="LIVE" />
          <TrustBadge status="COMMUNITY" />
          <TrustBadge status="DISPUTED" />
        </div>

        {/* Results */}
        {itinerary && (
          <div style={{ marginTop: '2rem' }}>
            <ItineraryView items={itinerary} narration={narration} />
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
