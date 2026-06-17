import { RiskTagType, RISK_TAG_LABELS } from '../../types';
import { getRiskTagColor } from '../../utils';

interface RiskTagBadgeProps {
  type: RiskTagType;
  showLabel?: boolean;
  className?: string;
}

export function RiskTagBadge({
  type,
  showLabel = true,
  className = '',
}: RiskTagBadgeProps) {
  const colorClass = getRiskTagColor(type);
  const label = RISK_TAG_LABELS[type];

  return (
    <span className={`${colorClass} ${className}`}>
      {showLabel && label}
    </span>
  );
}
