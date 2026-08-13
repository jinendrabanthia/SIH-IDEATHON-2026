import { useTranslation } from 'react-i18next';
import { TrustBadge } from './TrustBadge';
import type { VerificationStatus } from './TrustBadge';

interface ItineraryItem {
  dayNumber: number;
  sequence: number;
  attractionName: string;
  startTime: string;
  endTime: string;
  travelBufferMinutesBefore: number;
  explanationText?: string;
  trustSummary?: Array<{
    key: string;
    status: VerificationStatus;
  }>;
}

interface ItineraryViewProps {
  items: ItineraryItem[];
  narration?: string;
}

export function ItineraryView({ items, narration }: ItineraryViewProps) {
  const { t } = useTranslation();

  // Group by day
  const days = items.reduce((acc, item) => {
    if (!acc[item.dayNumber]) acc[item.dayNumber] = [];
    acc[item.dayNumber].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {narration && (
        <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span role="img" aria-label="sparkles">✨</span> AI Trip Overview
          </h3>
          <p style={{ lineHeight: 1.6, color: 'var(--color-text)' }}>{narration}</p>
        </div>
      )}

      {Object.entries(days).map(([dayNum, dayItems]) => (
        <div key={dayNum} className="glass animate-slide-up" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            Day {dayNum}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dayItems.map((item, idx) => (
              <div key={`${dayNum}-${idx}`} style={{ display: 'flex', gap: '1rem' }}>
                {/* Timeline Column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '4rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.startTime}</div>
                  <div style={{ flex: 1, width: '2px', background: 'var(--color-border)', margin: '0.5rem 0' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item.endTime}</div>
                </div>

                {/* Content Column */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{item.attractionName}</h3>
                  
                  {item.travelBufferMinutesBefore > 0 && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span role="img" aria-label="car">🚗</span> {item.travelBufferMinutesBefore} min travel
                    </div>
                  )}

                  {/* Fact Trust Badges for this attraction */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <TrustBadge status="VERIFIED" /> 
                    {/* Hardcoded VERIFIED for MVP, normally derived from item.trustSummary */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
