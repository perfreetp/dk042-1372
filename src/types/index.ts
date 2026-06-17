export type FenceType = 'school' | 'pickup' | 'danger';

export type EventType = 'entry' | 'exit' | 'missed' | 'detour';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskTagType =
  | 'frequent_detour'
  | 'off_site_boarding'
  | 'night_movement'
  | 'long_stay'
  | 'missing_entry'
  | 'missing_exit';

export type RectificationStatus =
  | 'pending'
  | 'replied'
  | 'completed'
  | 'overdue'
  | 'rejected';

export type RectificationType =
  | 'explain'
  | 'supplement_record'
  | 'revalidate_site';

export interface Person {
  id: string;
  name: string;
  phone: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  busCount: number;
  routeCount: number;
  latestRiskTags: RiskTagType[];
}

export interface FenceSummary {
  schoolId: string;
  routeId: string;
  routeName: string;
  busCount: number;
  schoolFenceCount: number;
  pickupFenceCount: number;
  dangerFenceCount: number;
  abnormalCount: number;
  riskTags: RiskTagType[];
}

export interface RiskTag {
  type: RiskTagType;
  description: string;
  level: RiskLevel;
}

export interface FenceEvent {
  id: string;
  busId: string;
  busPlate: string;
  routeId: string;
  routeName: string;
  fenceType: FenceType;
  fenceName: string;
  eventType: EventType;
  entryTime: Date;
  exitTime: Date | null;
  durationMin: number;
  driver: Person;
  attendant: Person;
  riskScore: number;
  riskLevel: RiskLevel;
  riskTags: RiskTag[];
}

export interface Rectification {
  id: string;
  schoolId: string;
  schoolName: string;
  routeId: string;
  routeName: string;
  eventId: string;
  eventDescription: string;
  type: RectificationType;
  requirement: string;
  createdAt: Date;
  deadline: Date;
  status: RectificationStatus;
  schoolReply?: string;
  replyDate?: Date;
}

export type InspectionTaskStatus = 'pending' | 'in_progress' | 'completed';

export interface InspectionTaskItem {
  eventId: string;
  event: FenceEvent;
  checked: boolean;
  conclusion?: string;
  checkedAt?: Date;
}

export interface InspectionTask {
  id: string;
  name: string;
  reason: string;
  createdAt: Date;
  deadline: Date;
  status: InspectionTaskStatus;
  items: InspectionTaskItem[];
  createdBy: string;
  assignee: string;
  completedAt?: Date;
  summary?: string;
}

export interface ReviewedEvent {
  eventId: string;
  reviewedAt: Date;
}

export const INSPECTION_TASK_STATUS_LABELS: Record<InspectionTaskStatus, string> = {
  pending: '待抽查',
  in_progress: '抽查中',
  completed: '已完成',
};

export interface DailyFenceSummary {
  date: Date;
  schoolId: string;
  routeId: string;
  routeName: string;
  busCount: number;
  schoolFenceCount: number;
  pickupFenceCount: number;
  dangerFenceCount: number;
  abnormalCount: number;
  riskTags: RiskTagType[];
}

export interface Filters {
  selectedSchoolId: string | null;
  dateRange: { start: Date; end: Date };
  routeId: string | null;
  riskLevel: RiskLevel | null;
}

export interface AppState {
  filters: Filters;
  schools: School[];
  fenceSummaries: FenceSummary[];
  dailySummaries: DailyFenceSummary[];
  riskEvents: FenceEvent[];
  rectifications: Rectification[];
  inspectionTasks: InspectionTask[];
  reviewedEvents: ReviewedEvent[];
  selectedEvent: FenceEvent | null;
  selectedTaskId: string | null;
  selectedEventIds: string[];
  ui: {
    isLoading: boolean;
    showRectificationModal: boolean;
    showEventDetail: boolean;
    showCreateTaskModal: boolean;
    showTaskDetailModal: boolean;
    showLedgerModal: boolean;
  };
}

export type AppAction =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'LOAD_FENCE_SUMMARIES'; payload: FenceSummary[] }
  | { type: 'LOAD_RISK_EVENTS'; payload: FenceEvent[] }
  | { type: 'LOAD_RECTIFICATIONS'; payload: Rectification[] }
  | { type: 'SELECT_EVENT'; payload: FenceEvent | null }
  | { type: 'CREATE_RECTIFICATION'; payload: Rectification }
  | {
      type: 'UPDATE_RECTIFICATION_STATUS';
      payload: { id: string; status: RectificationStatus; reply?: string };
    }
  | { type: 'TOGGLE_RECTIFICATION_MODAL'; payload: boolean }
  | { type: 'TOGGLE_EVENT_DETAIL'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_EVENT_SELECTION'; payload: string }
  | { type: 'CLEAR_EVENT_SELECTION'; payload: undefined }
  | { type: 'SET_SELECTED_TASK'; payload: string | null }
  | { type: 'CREATE_INSPECTION_TASK'; payload: InspectionTask }
  | {
      type: 'UPDATE_TASK_ITEM';
      payload: { taskId: string; eventId: string; checked: boolean; conclusion?: string };
    }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: InspectionTaskStatus; summary?: string } }
  | { type: 'TOGGLE_CREATE_TASK_MODAL'; payload: boolean }
  | { type: 'TOGGLE_TASK_DETAIL_MODAL'; payload: boolean }
  | { type: 'TOGGLE_LEDGER_MODAL'; payload: boolean }
  | { type: 'ADD_REVIEWED_EVENT'; payload: ReviewedEvent }
  | { type: 'LOAD_STATE_FROM_STORAGE'; payload: Partial<AppState> };

export const RISK_TAG_LABELS: Record<RiskTagType, string> = {
  frequent_detour: '频繁绕行',
  off_site_boarding: '站点外上下车',
  night_movement: '夜间异常移动',
  long_stay: '长时间停留',
  missing_entry: '未进入围栏',
  missing_exit: '未离开围栏',
};

export const FENCE_TYPE_LABELS: Record<FenceType, string> = {
  school: '学校围栏',
  pickup: '接送点围栏',
  danger: '危险路段',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '严重风险',
};

export const RECTIFICATION_STATUS_LABELS: Record<RectificationStatus, string> = {
  pending: '待回复',
  replied: '已回复',
  completed: '已完成',
  overdue: '已超期',
  rejected: '需重提',
};

export const RECTIFICATION_TYPE_LABELS: Record<RectificationType, string> = {
  explain: '说明原因',
  supplement_record: '补充家长告知记录',
  revalidate_site: '重新核定站点位置',
};
