import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Navigation, ShieldCheck, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrustBadge } from '../trust/TrustBadge';
import { FactProvenanceDrawer } from '../trust/FactProvenanceDrawer';
import { ItineraryItem } from '../../types/domain';
import { formatTime } from '../../lib/utils';

interface ItineraryTimelineProps {
  items: ItineraryItem[];
  warnings?: string[];
  activeDay?: number | 'ALL';
  onSelectDay?: (day: number | 'ALL') => void;
  onSelectItem?: (item: ItineraryItem) => void;
  selectedItem?: ItineraryItem | null;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  items,
  warnings = [],
  activeDay: controlledActiveDay,
  onSelectDay,
  onSelectItem,
  selectedItem,
}) => {
  const { t } = useTranslation();
  const [internalActiveDay, setInternalActiveDay] = useState<number | 'ALL'>(1);
  const activeDay = controlledActiveDay !== undefined ? controlledActiveDay : internalActiveDay;
  const [drawerItem, setDrawerItem] = useState<ItineraryItem | null>(null);

  const handleDayClick = (day: number | 'ALL') => {
    if (onSelectDay) {
      onSelectDay(day);
    } else {
      setInternalActiveDay(day);
    }
  };

  // Group items by dayNumber
  const daysMap = new Map<number, ItineraryItem[]>();
  items.forEach((item) => {
    const list = daysMap.get(item.dayNumber) || [];
    list.push(item);
    daysMap.set(item.dayNumber, list);
  });

  const availableDays = Array.from(daysMap.keys()).sort((a, b) => a - b);
  const currentDayItems =
    activeDay === 'ALL'
      ? items
      : daysMap.get(Number(activeDay)) || items;

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-slate-300">
        <Sparkles className="h-8 w-8 text-orange-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">{t('planner.noPlanYet')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Day Tabs */}
      {availableDays.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {availableDays.map((day) => (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeDay === day
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('planner.day')} {day} ({daysMap.get(day)?.length || 0} stops)
            </button>
          ))}
          <button
            onClick={() => handleDayClick('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeDay === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Days ({items.length} stops)
          </button>
        </div>
      )}

      {/* Plan Warnings Banner */}
      {warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{t('planner.warnings')}</span>
          </div>
          {warnings.map((warn, i) => (
            <p key={i} className="text-xs text-amber-800 pl-5">
              • {warn}
            </p>
          ))}
        </div>
      )}

      {/* Timeline Items */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {currentDayItems.map((item, index) => {
          const isSelected = selectedItem?.entityId === item.entityId;

          return (
            <div key={`${item.dayNumber}-${item.sequence}`} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-6 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-[10px] ring-4 ring-white shadow-xs">
                {item.sequence}
              </div>

              {/* Transit Buffer Bar if before stop */}
              {item.travelBufferMinutesBefore > 0 && (
                <div className="mb-2 pl-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Navigation className="h-3 w-3 text-orange-500" />
                  <span>
                    ~{item.travelBufferMinutesBefore} {t('planner.travelBuffer')}
                  </span>
                </div>
              )}

              {/* Stop Card */}
              <Card
                onClick={() => onSelectItem?.(item)}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Day {item.dayNumber} • {formatTime(item.startTime)} – {formatTime(item.endTime)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {item.attractionName}
                      </h4>
                    </div>

                    <TrustBadge status={item.trustSummary.overall_status} />
                  </div>

                  {item.explanationText && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.explanationText}
                    </p>
                  )}

                  {/* Fact Provenance Quick Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawerItem(item);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Audit {item.trustSummary.facts.length} Verified Facts</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Day {item.dayNumber} • Stop #{item.sequence}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Fact Audit Modal/Drawer */}
      {drawerItem && (
        <FactProvenanceDrawer
          isOpen={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          attractionName={drawerItem.attractionName}
          facts={drawerItem.trustSummary.facts}
          warnings={drawerItem.trustSummary.warnings}
        />
      )}
    </div>
  );
};
