import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Database, Calendar, ExternalLink, Flag, Info } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { TrustBadge } from './TrustBadge';
import { DisputeModal } from './DisputeModal';
import { Button } from '../ui/Button';
import { FactProvenance } from '../../types/domain';

interface FactProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attractionName: string;
  facts: FactProvenance[];
  warnings?: string[];
}

export const FactProvenanceDrawer: React.FC<FactProvenanceDrawerProps> = ({
  isOpen,
  onClose,
  attractionName,
  facts,
  warnings = [],
}) => {
  const { t } = useTranslation();
  const [selectedFactForDispute, setSelectedFactForDispute] = useState<FactProvenance | null>(null);

  const formatFactValue = (value: unknown): string => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }
    return String(value);
  };

  return (
    <>
      <Modal open={isOpen} onOpenChange={onClose}>
        <ModalContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-600" />
              <ModalTitle className="text-xl">Evidence & Provenance Audit</ModalTitle>
            </div>
            <ModalDescription>
              Verified facts and audit trails for <strong className="text-slate-900">{attractionName}</strong>
            </ModalDescription>
          </ModalHeader>

          {/* Warnings Banner if any */}
          {warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Info className="h-4 w-4" />
                <span>Verification Warnings</span>
              </div>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-xs text-amber-700">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Facts List */}
          <div className="space-y-4 pt-2">
            {facts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No individual facts recorded for this stop yet.
              </p>
            ) : (
              facts.map((fact) => (
                <div
                  key={fact.fact_id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {fact.fact_key.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                        {formatFactValue(fact.fact_value)}
                      </h4>
                    </div>
                    <TrustBadge status={fact.verification_status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        Source: <strong>{fact.source_name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                      <span>Type: {fact.source_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Checked: {new Date(fact.last_checked).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Confidence:</span>
                      <span className="font-semibold text-emerald-700">
                        {Math.round(fact.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7"
                      onClick={() => setSelectedFactForDispute(fact)}
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      Report Dispute
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            {t('trust.noFabrication')}
          </div>
        </ModalContent>
      </Modal>

      {/* Embedded Dispute Modal */}
      {selectedFactForDispute && (
        <DisputeModal
          isOpen={!!selectedFactForDispute}
          onClose={() => setSelectedFactForDispute(null)}
          entityId={selectedFactForDispute.fact_id}
          entityName={`${attractionName} - ${selectedFactForDispute.fact_key}`}
          entityType="FACT"
        />
      )}
    </>
  );
};
