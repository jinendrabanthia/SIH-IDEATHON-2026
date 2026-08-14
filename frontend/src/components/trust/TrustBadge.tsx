import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Radio, AlertTriangle, HelpCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { VerificationStatus } from '../../types/domain';

interface TrustBadgeProps {
  status: VerificationStatus;
  className?: string;
  showIcon?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ status, className, showIcon = true }) => {
  const { t } = useTranslation();

  const getStatusConfig = (st: VerificationStatus) => {
    switch (st) {
      case 'VERIFIED':
        return {
          variant: 'success' as const,
          icon: ShieldCheck,
          label: t('trust.status.VERIFIED'),
        };
      case 'LIVE':
        return {
          variant: 'live' as const,
          icon: Radio,
          label: t('trust.status.LIVE'),
        };
      case 'COMMUNITY':
        return {
          variant: 'secondary' as const,
          icon: ShieldCheck,
          label: t('trust.status.COMMUNITY'),
        };
      case 'INFERRED':
        return {
          variant: 'inferred' as const,
          icon: HelpCircle,
          label: t('trust.status.INFERRED'),
        };
      case 'UNVERIFIED':
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          label: t('trust.status.UNVERIFIED'),
        };
      case 'OUTDATED':
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          label: t('trust.status.OUTDATED'),
        };
      case 'DISPUTED':
        return {
          variant: 'disputed' as const,
          icon: AlertCircle,
          label: t('trust.status.DISPUTED'),
        };
      default:
        return {
          variant: 'outline' as const,
          icon: HelpCircle,
          label: st,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="mr-1 h-3 w-3 inline" />}
      {config.label}
    </Badge>
  );
};
