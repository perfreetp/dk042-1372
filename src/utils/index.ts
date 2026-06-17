import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  RiskLevel,
  RiskTagType,
  RectificationStatus,
  FenceEvent,
} from '../types';

export function formatDate(date: Date | null): string {
  if (!date) return '-';
  return format(date, 'yyyy-MM-dd', { locale: zhCN });
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '-';
  return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function formatTime(date: Date | null): string {
  if (!date) return '-';
  return format(date, 'HH:mm', { locale: zhCN });
}

export function getDaysRemaining(deadline: Date): number {
  return differenceInDays(deadline, new Date());
}

export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-success-500',
    medium: 'bg-warning-500',
    high: 'bg-warning-600',
    critical: 'bg-danger-500',
  };
  return colors[level];
}

export function getRiskLevelTextColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'text-success-700',
    medium: 'text-warning-700',
    high: 'text-warning-700',
    critical: 'text-danger-700',
  };
  return colors[level];
}

export function getRiskLevelBgClass(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-success-100 text-success-800',
    medium: 'bg-warning-100 text-warning-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-danger-100 text-danger-800',
  };
  return colors[level];
}

export function getRiskTagColor(type: RiskTagType): string {
  const highRisk: RiskTagType[] = ['night_movement', 'off_site_boarding'];
  const mediumRisk: RiskTagType[] = ['frequent_detour', 'long_stay'];
  const lowRisk: RiskTagType[] = ['missing_entry', 'missing_exit'];

  if (highRisk.includes(type)) return 'badge-danger';
  if (mediumRisk.includes(type)) return 'badge-warning';
  if (lowRisk.includes(type)) return 'badge-primary';
  return 'badge-gray';
}

export function getRectificationStatusColor(
  status: RectificationStatus
): string {
  const colors: Record<RectificationStatus, string> = {
    pending: 'badge-warning',
    replied: 'badge-primary',
    completed: 'badge-success',
    overdue: 'badge-danger',
    rejected: 'badge-danger',
  };
  return colors[status];
}

export function getDeadlineColorClass(deadline: Date): string {
  const days = getDaysRemaining(deadline);
  if (days < 0) return 'text-danger-600 font-semibold';
  if (days <= 1) return 'text-danger-500 font-medium';
  if (days <= 3) return 'text-warning-600';
  return 'text-gray-600';
}

export function getRiskScoreGradient(score: number): string {
  if (score >= 80) return 'from-danger-500 to-danger-600';
  if (score >= 60) return 'from-warning-500 to-warning-600';
  if (score >= 40) return 'from-warning-400 to-warning-500';
  return 'from-success-400 to-success-500';
}

export function calculateRiskScore(
  baseScore: number,
  tags: { type: RiskTagType }[],
  eventDate: Date
): number {
  const tagBonus: Record<RiskTagType, number> = {
    frequent_detour: 20,
    off_site_boarding: 25,
    night_movement: 30,
    long_stay: 15,
    missing_entry: 0,
    missing_exit: 0,
  };

  const bonus = tags.reduce(
    (sum, tag) => sum + (tagBonus[tag.type] || 0),
    0
  );

  const daysDiff = differenceInDays(new Date(), eventDate);
  const timeWeight = daysDiff <= 3 ? 1.5 : daysDiff <= 7 ? 1.2 : 1.0;

  return Math.min(100, Math.round((baseScore + bonus) * timeWeight));
}

export function sortEventsByRisk(events: FenceEvent[]): FenceEvent[] {
  return [...events].sort((a, b) => b.riskScore - a.riskScore);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
