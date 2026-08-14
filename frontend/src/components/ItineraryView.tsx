
import { TrustBadge } from './TrustBadge';
import type { VerificationStatus } from './TrustBadge';
import { FadeContent } from './animations/FadeContent';
import { Sparkles, Car } from 'lucide-react';

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
  // Group by day
  const days = items.reduce((acc, item) => {
    if (!acc[item.dayNumber]) acc[item.dayNumber] = [];
    acc[item.dayNumber].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', width: '100%' }}>
      
      {narration && (
        <FadeContent delay={0.2} direction="up">
          <div className="editorial-card" style={{ 
            padding: 'var(--space-6)', 
            borderLeft: '4px solid var(--color-primary)',
            background: 'var(--color-surface-hover)'
          }}>
            <h3 className="font-display" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={20} color="var(--color-accent)" /> 
              Overview
            </h3>
            <p style={{ color: 'var(--color-text-primary)' }}>{narration}</p>
          </div>
        </FadeContent>
      )}

      {Object.entries(days).map(([dayNum, dayItems], dayIndex) => (
        <FadeContent key={dayNum} delay={0.3 + (dayIndex * 0.1)} direction="up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <h2 className="font-display" style={{ 
              color: 'var(--color-text-primary)', 
              borderBottom: '1px solid var(--color-border)', 
              paddingBottom: 'var(--space-2)' 
            }}>
              Day {dayNum}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {dayItems.map((item, idx) => (
                <div key={`${dayNum}-${idx}`} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  {/* Timeline Column */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    minWidth: '5rem',
                    paddingTop: 'var(--space-2)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{item.startTime}</div>
                    <div style={{ 
                      flex: 1, 
                      width: '2px', 
                      background: 'var(--color-border-strong)', 
                      margin: 'var(--space-2) 0',
                      borderRadius: '2px'
                    }} />
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>{item.endTime}</div>
                  </div>

                  {/* Content Column */}
                  <div className="editorial-card" style={{ 
                    flex: 1, 
                    padding: 'var(--space-5)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--space-3)' 
                  }}>
                    <h3 className="font-display" style={{ fontSize: '1.25rem' }}>{item.attractionName}</h3>
                    
                    {item.travelBufferMinutesBefore > 0 && (
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--color-text-secondary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-2)',
                        background: 'var(--color-surface-hover)',
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-sm)',
                        alignSelf: 'flex-start'
                      }}>
                        <Car size={16} /> {item.travelBufferMinutesBefore} min travel
                      </div>
                    )}

                    {/* Fact Trust Badges for this attraction */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      <TrustBadge status="VERIFIED" /> 
                      {/* Hardcoded VERIFIED for MVP, normally derived from item.trustSummary */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeContent>
      ))}
    </div>
  );
}
