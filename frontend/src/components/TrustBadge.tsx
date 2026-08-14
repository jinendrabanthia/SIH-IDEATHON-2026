import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Activity, 
  Users, 
  Cpu, 
  XCircle, 
  Clock, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

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
    const iconProps = { size: 14, strokeWidth: 2.5 };
    switch (status) {
      case 'VERIFIED': return <CheckCircle2 {...iconProps} />;
      case 'LIVE': return <Activity {...iconProps} />;
      case 'COMMUNITY': return <Users {...iconProps} />;
      case 'INFERRED': return <Cpu {...iconProps} />;
      case 'UNVERIFIED': return <XCircle {...iconProps} />;
      case 'OUTDATED': return <Clock {...iconProps} />;
      case 'DISPUTED': return <AlertTriangle {...iconProps} />;
      default: return <HelpCircle {...iconProps} />;
    }
  };

  const labelKey = `trust.${status.toLowerCase()}`;
  const label = t(labelKey, { defaultValue: status });

  return (
    <span className={`trust-badge ${getBadgeStyle(status)}`} title={t(`${labelKey}_desc`, { defaultValue: '' })}>
      {getIcon(status)}
      <span>{label}</span>
    </span>
  );
}
