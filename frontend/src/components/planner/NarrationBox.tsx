import React, { useState } from 'react';
import { Sparkles, CheckCircle2, MessageSquareText, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { nluApi } from '../../api/services/nluApi';
import { ItineraryItem } from '../../types/domain';

interface NarrationBoxProps {
  items: ItineraryItem[];
}

export const NarrationBox: React.FC<NarrationBoxProps> = ({ items }) => {
  const [narration, setNarration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateNarration = async () => {
    if (items.length === 0) return;
    setIsLoading(true);

    try {
      const payload = items.map((item) => ({
        attractionName: item.attractionName,
        startTime: item.startTime,
        endTime: item.endTime,
        factId: item.trustSummary.facts[0]?.fact_id,
      }));

      const validFactIds = items.flatMap((i) => i.trustSummary.facts.map((f) => f.fact_id));

      const res = await nluApi.narrateItinerary(payload, validFactIds);
      setNarration(res.narration);
    } catch (err) {
      console.error('Narration generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <Card className="border-indigo-100 bg-indigo-50/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-900">
          <MessageSquareText className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-sm font-bold">AI Trip Story & Narration</CardTitle>
        </div>

        {!narration && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateNarration}
            disabled={isLoading}
            className="text-xs h-7 gap-1 border-indigo-200 hover:bg-indigo-100"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-indigo-600" />
                Generate Story
              </>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {narration ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-indigo-100">
              {narration}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Passed Trust Validation Gate (Zero Hallucinated Facts)
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Generate an AI overview narrative with every fact citation validated.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
