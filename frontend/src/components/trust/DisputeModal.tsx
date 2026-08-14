import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { Button } from '../ui/Button';
import { feedbackApi } from '../../api/services/feedbackApi';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  entityType: 'ATTRACTION' | 'FACT' | 'CROWD_RECORD';
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityName,
  entityType,
}) => {
  const { t } = useTranslation();
  const [feedbackType, setFeedbackType] = useState<'INACCURATE' | 'OUTDATED' | 'OTHER'>('INACCURATE');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await feedbackApi.submitFeedback({
        entityId,
        entityType,
        feedbackType,
        comment,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <AlertCircle className="h-5 w-5" />
            <ModalTitle>{t('feedback.modalTitle')}</ModalTitle>
          </div>
          <ModalDescription>
            {t('feedback.entityLabel')}: <span className="font-semibold text-slate-800">{entityName}</span>
          </ModalDescription>
        </ModalHeader>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-slate-800">{t('feedback.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('feedback.typeLabel')}
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as any)}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="INACCURATE">{t('feedback.inaccurate')}</option>
                <option value="OUTDATED">{t('feedback.outdated')}</option>
                <option value="OTHER">{t('feedback.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Details & Verification Notes
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback.commentPlaceholder')}
                className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" disabled={isSubmitting}>
                {isSubmitting ? t('feedback.submitting') : t('feedback.submit')}
              </Button>
            </div>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
