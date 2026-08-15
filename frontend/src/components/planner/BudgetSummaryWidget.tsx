import React from 'react';
import { IndianRupee, Car, Ticket, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ItineraryItem, TransportPreference } from '../../types/domain';

interface BudgetSummaryWidgetProps {
  items: ItineraryItem[];
  transportMode: TransportPreference;
}

export const BudgetSummaryWidget: React.FC<BudgetSummaryWidgetProps> = ({ items, transportMode }) => {
  if (items.length === 0) return null;

  // Calculate estimated ticket fees based on facts
  let totalTicketEst = 0;
  let verifiedTicketsCount = 0;

  items.forEach((item) => {
    const priceFact = item.trustSummary.facts.find((f) => f.fact_key === 'ticket_price');
    if (priceFact && typeof priceFact.fact_value === 'object' && priceFact.fact_value !== null) {
      const val = priceFact.fact_value as any;
      if (typeof val.inr === 'number') {
        totalTicketEst += val.inr;
        verifiedTicketsCount++;
      } else if (typeof val.adult === 'number') {
        totalTicketEst += val.adult;
        verifiedTicketsCount++;
      }
    } else {
      // Default estimate for heritage monument if not recorded
      totalTicketEst += 25;
    }
  });

  const transitPerStop =
    transportMode === 'WALKING'
      ? 0
      : transportMode === 'PUBLIC_TRANSIT'
      ? 20
      : transportMode === 'CAB'
      ? 150
      : 80;

  const totalTransitEst = items.length * transitPerStop;
  const grandTotal = totalTicketEst + totalTransitEst;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-slate-800">
          <IndianRupee className="h-4 w-4 text-emerald-600" />
          <CardTitle className="text-sm font-bold">Estimated Cost & Fare Breakdown</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Ticket className="h-3.5 w-3.5 text-orange-600" />
              <span>Attraction Tickets</span>
            </div>
            <p className="text-sm font-bold text-slate-900">₹{totalTicketEst}</p>
            <span className="text-[10px] text-slate-400">
              {verifiedTicketsCount > 0 ? `${verifiedTicketsCount} verified rates` : 'Estimated entries'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Car className="h-3.5 w-3.5 text-blue-600" />
              <span>Transit ({transportMode.replace('_', ' ')})</span>
            </div>
            <p className="text-sm font-bold text-slate-900">₹{totalTransitEst}</p>
            <span className="text-[10px] text-slate-400">{items.length} transit legs</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Estimated Total / Person</span>
          </div>
          <span className="text-base font-extrabold text-emerald-900">₹{grandTotal}</span>
        </div>
      </CardContent>
    </Card>
  );
};
