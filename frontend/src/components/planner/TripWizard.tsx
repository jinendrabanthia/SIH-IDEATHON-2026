import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Clock, Accessibility, Sparkles, Navigation, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Destination, Pace, TransportPreference, PlannerInput } from '../../types/domain';

interface TripWizardProps {
  destinations: Destination[];
  input: PlannerInput;
  onChange: (input: PlannerInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const INTEREST_OPTIONS = [
  'Heritage & Architecture',
  'Temples & Spiritual',
  'Nature & Parks',
  'Local Food & Markets',
  'Museums & Culture',
  'Handicrafts & Art',
];

export const TripWizard: React.FC<TripWizardProps> = ({
  destinations,
  input,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();

  const handleInterestToggle = (interest: string) => {
    const current = input.preferences.interests;
    const next = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];

    onChange({
      ...input,
      preferences: {
        ...input.preferences,
        interests: next,
      },
    });
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 text-orange-600">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-lg">{t('planner.title')}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Destination */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-orange-600" />
            {t('planner.destination')}
          </label>
          <select
            value={input.destinationId}
            onChange={(e) => onChange({ ...input, destinationId: e.target.value })}
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="" disabled>
              {t('planner.selectDestination')}
            </option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.region ? `${d.region}, ` : ''}{d.country})
              </option>
            ))}
          </select>
        </div>

        {/* Start Date & Days */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-orange-600" />
              {t('planner.startDate')}
            </label>
            <input
              type="date"
              value={input.startDate ? input.startDate.split('T')[0] : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                try {
                  onChange({
                    ...input,
                    startDate: new Date(val).toISOString(),
                  });
                } catch {
                  // ignore invalid date
                }
              }}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-600" />
              {t('planner.days')}
            </label>
            <select
              value={input.days}
              onChange={(e) => onChange({ ...input, days: Number(e.target.value) })}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'Day' : 'Days'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pace Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-orange-600" />
            {t('planner.pace')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['RELAXED', 'MODERATE', 'PACKED'] as Pace[]).map((pace) => (
              <button
                key={pace}
                type="button"
                onClick={() =>
                  onChange({
                    ...input,
                    preferences: { ...input.preferences, pace },
                  })
                }
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                  input.preferences.pace === pace
                    ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {pace === 'RELAXED' ? 'Relaxed' : pace === 'MODERATE' ? 'Moderate' : 'Packed'}
              </button>
            ))}
          </div>
        </div>

        {/* Transport Preference */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-orange-600" />
            {t('planner.transport')}
          </label>
          <select
            value={input.preferences.transportPreference}
            onChange={(e) =>
              onChange({
                ...input,
                preferences: {
                  ...input.preferences,
                  transportPreference: e.target.value as TransportPreference,
                },
              })
            }
            className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="MIXED">{t('planner.transports.MIXED')}</option>
            <option value="WALKING">{t('planner.transports.WALKING')}</option>
            <option value="PUBLIC_TRANSIT">{t('planner.transports.PUBLIC_TRANSIT')}</option>
            <option value="CAB">{t('planner.transports.CAB')}</option>
            <option value="OWN_VEHICLE">{t('planner.transports.OWN_VEHICLE')}</option>
          </select>
        </div>

        {/* Accessibility Checkbox */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="h-4 w-4 text-emerald-700" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                {t('planner.wheelchairAccess')}
              </span>
              <span className="text-[11px] text-emerald-700">
                Filters only strictly verified accessible venues
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={input.preferences.accessibilityWheelchair}
            onChange={(e) =>
              onChange({
                ...input,
                preferences: {
                  ...input.preferences,
                  accessibilityWheelchair: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
          />
        </div>

        {/* Interests Badges */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t('planner.interests')}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map((interest) => {
              const selected = input.preferences.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    selected
                      ? 'border-orange-500 bg-orange-500 text-white font-medium shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onSubmit}
          disabled={isLoading || !input.destinationId}
          className="w-full h-12 rounded-xl text-base font-bold shadow-md shadow-orange-500/20"
        >
          {isLoading ? t('planner.generating') : t('planner.generateBtn')}
        </Button>
      </CardContent>
    </Card>
  );
};
