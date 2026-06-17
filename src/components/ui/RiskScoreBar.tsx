import { getRiskScoreGradient } from '../../utils';

interface RiskScoreBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function RiskScoreBar({
  score,
  showLabel = true,
  size = 'md',
}: RiskScoreBarProps) {
  const gradient = getRiskScoreGradient(score);
  const heightClass = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">风险评分</span>
          <span
            className={`text-xs font-bold ${
              score >= 80
                ? 'text-danger-600'
                : score >= 60
                ? 'text-warning-600'
                : score >= 40
                ? 'text-warning-500'
                : 'text-success-600'
            }`}
          >
            {score}分
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
