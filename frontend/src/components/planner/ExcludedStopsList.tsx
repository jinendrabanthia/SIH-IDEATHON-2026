import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, AlertOctagon, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Exclusion } from '../../types/domain';
import { TrustBadge } from '../trust/TrustBadge';

interface ExcludedStopsListProps {
  excluded: Exclusion[];
}

export const ExcludedStopsList: React.FC<ExcludedStopsListProps> = ({ excluded }) => {
  const { t } = useTranslation();

  if (!excluded || excluded.length === 0) return null;

  return (
    <Card className="border-rose-200/80 bg-rose-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-rose-700">
          <Ban className="h-4 w-4" />
          <CardTitle className="text-sm font-bold">{t('planner.excludedTitle')}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {excluded.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">{item.attractionName}</span>
              <TrustBadge status={item.verificationStatus} showIcon={false} />
            </div>
            <div className="flex items-start gap-1.5 text-xs text-rose-700">
              <AlertOctagon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{item.reason}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
