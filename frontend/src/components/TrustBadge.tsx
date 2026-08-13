import { useTranslation } from 'react-i18next';

export type VerificationStatus = 
  | 'VERIFIED'
  | 'LIVE'
  | 'COMMUNITY'
  | 'INFERRED'
  | 'UNVERIFIED'
  | 'OUTDATED'
  | 'DISPUTED';

interface TrustBadgeProps {
  status: VerificationStatus;
}

export function TrustBadge({ status }: TrustBadgeProps) {
  const { t } = useTranslation();

  const getBadgeStyle = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED': return 'trust-badge--verified';
      case 'LIVE': return 'trust-badge--live';
      case 'COMMUNITY': return 'trust-badge--community';
      case 'INFERRED': return 'trust-badge--inferred';
      case 'UNVERIFIED': return 'trust-badge--unverified';
      case 'OUTDATED': return 'trust-badge--outdated';
      case 'DISPUTED': return 'trust-badge--disputed';
      default: return '';
    }
  };

  const getIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED': return '🟢';
      case 'LIVE': return '🔵';
      case 'COMMUNITY': return '🟡';
      case 'INFERRED': return '🟠';
      case 'UNVERIFIED': return '🔴';
      case 'OUTDATED': return '⏳';
      case 'DISPUTED': return '⚠️';
      default: return '❓';
    }
  };

  const labelKey = `trust.${status.toLowerCase()}`;
  const label = t(labelKey, { defaultValue: status });

  return (
    <span className={`trust-badge ${getBadgeStyle(status)}`} title={t(`${labelKey}_desc`, { defaultValue: '' })}>
      <span style={{ marginRight: '0.25rem' }}>{getIcon(status)}</span>
      {label}
    </span>
  );
}
