import { create } from 'zustand';
import { addDays, format, isWithinInterval, isSameDay, differenceInDays } from 'date-fns';
import {
  AppState,
  AppAction,
  FenceSummary,
  FenceEvent,
  Rectification,
  RectificationStatus,
  Filters,
  InspectionTask,
  InspectionTaskStatus,
  InspectionTaskItem,
  DailyFenceSummary,
  RISK_TAG_LABELS,
  RECTIFICATION_STATUS_LABELS,
  RECTIFICATION_TYPE_LABELS,
} from '../types';
import {
  schools,
  fenceSummaries,
  fenceEvents,
  rectifications,
  dailySummaries,
  inspectionTasks,
  getSchoolInfoByRoute,
} from '../data/mockData';
import { generateId, sortEventsByRisk } from '../utils';

const initialFilters: Filters = {
  selectedSchoolId: null,
  dateRange: {
    start: addDays(new Date(), -7),
    end: new Date(),
  },
  routeId: null,
  riskLevel: null,
};

const initialState: Omit<AppState, 'dispatch'> = {
  filters: initialFilters,
  schools,
  fenceSummaries,
  dailySummaries,
  riskEvents: sortEventsByRisk(fenceEvents),
  rectifications,
  inspectionTasks,
  selectedEvent: null,
  selectedTaskId: null,
  selectedEventIds: [],
  ui: {
    isLoading: false,
    showRectificationModal: false,
    showEventDetail: false,
    showCreateTaskModal: false,
    showTaskDetailModal: false,
    showLedgerModal: false,
  },
};

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, {
    start: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
    end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59),
  });
}

function appReducer(
  state: Omit<AppState, 'dispatch'>,
  action: AppAction
): Omit<AppState, 'dispatch'> {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'SELECT_EVENT':
      return {
        ...state,
        selectedEvent: action.payload,
      };

    case 'TOGGLE_EVENT_SELECTION': {
      const id = action.payload;
      const exists = state.selectedEventIds.includes(id);
      return {
        ...state,
        selectedEventIds: exists
          ? state.selectedEventIds.filter((eid) => eid !== id)
          : [...state.selectedEventIds, id],
      };
    }

    case 'CLEAR_EVENT_SELECTION':
      return {
        ...state,
        selectedEventIds: [],
      };

    case 'SET_SELECTED_TASK':
      return {
        ...state,
        selectedTaskId: action.payload,
      };

    case 'CREATE_RECTIFICATION':
      return {
        ...state,
        rectifications: [...state.rectifications, action.payload],
        ui: {
          ...state.ui,
          showRectificationModal: false,
        },
      };

    case 'UPDATE_RECTIFICATION_STATUS':
      return {
        ...state,
        rectifications: state.rectifications.map((r) =>
          r.id === action.payload.id
            ? {
                ...r,
                status: action.payload.status,
                schoolReply: action.payload.reply ?? r.schoolReply,
                replyDate: action.payload.reply ? new Date() : r.replyDate,
              }
            : r
        ),
      };

    case 'CREATE_INSPECTION_TASK':
      return {
        ...state,
        inspectionTasks: [action.payload, ...state.inspectionTasks],
        selectedEventIds: [],
        ui: {
          ...state.ui,
          showCreateTaskModal: false,
        },
      };

    case 'UPDATE_TASK_ITEM': {
      const { taskId, eventId, checked, conclusion } = action.payload;
      return {
        ...state,
        inspectionTasks: state.inspectionTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                items: task.items.map((item) =>
                  item.eventId === eventId
                    ? {
                        ...item,
                        checked,
                        conclusion: conclusion ?? item.conclusion,
                        checkedAt: checked ? new Date() : undefined,
                      }
                    : item
                ),
              }
            : task
        ),
      };
    }

    case 'UPDATE_TASK_STATUS': {
      const { taskId, status } = action.payload;
      return {
        ...state,
        inspectionTasks: state.inspectionTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status,
                completedAt: status === 'completed' ? new Date() : undefined,
              }
            : task
        ),
      };
    }

    case 'TOGGLE_RECTIFICATION_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showRectificationModal: action.payload,
        },
      };

    case 'TOGGLE_EVENT_DETAIL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showEventDetail: action.payload,
        },
      };

    case 'TOGGLE_CREATE_TASK_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showCreateTaskModal: action.payload,
        },
      };

    case 'TOGGLE_TASK_DETAIL_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showTaskDetailModal: action.payload,
        },
      };

    case 'TOGGLE_LEDGER_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          showLedgerModal: action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    default:
      return state;
  }
}

interface AppStore extends Omit<AppState, 'dispatch'> {
  dispatch: (action: AppAction) => void;
  setFilters: (filters: Partial<Filters>) => void;
  selectEvent: (event: FenceEvent | null) => void;
  openRectificationModal: () => void;
  closeRectificationModal: () => void;
  openEventDetail: () => void;
  closeEventDetail: () => void;
  openCreateTaskModal: () => void;
  closeCreateTaskModal: () => void;
  openTaskDetailModal: () => void;
  closeTaskDetailModal: () => void;
  openLedgerModal: () => void;
  closeLedgerModal: () => void;
  toggleEventSelection: (eventId: string) => void;
  clearEventSelection: () => void;
  setSelectedTask: (taskId: string | null) => void;

  createRectification: (data: {
    type: Rectification['type'];
    requirement: string;
    deadlineDays: number;
  }) => void;
  updateRectificationStatus: (
    id: string,
    status: RectificationStatus,
    reply?: string
  ) => void;

  createInspectionTask: (data: { name: string; reason: string }) => void;
  updateTaskItem: (data: {
    taskId: string;
    eventId: string;
    checked: boolean;
    conclusion?: string;
  }) => void;
  updateTaskStatus: (taskId: string, status: InspectionTaskStatus) => void;

  getFilteredSummaries: () => FenceSummary[];
  getFilteredEvents: () => FenceEvent[];
  getFilteredRectifications: () => Rectification[];
  getFilteredTasks: () => InspectionTask[];

  getRectificationByEventId: (eventId: string) => Rectification | undefined;

  getStatistics: () => {
    totalFenceEvents: number;
    normalEvents: number;
    abnormalEvents: number;
    riskTagCount: number;
    pendingRectifications: number;
    overdueRectifications: number;
    totalTasks: number;
    pendingTasks: number;
  };

  getLedgerData: () => {
    dateRange: { start: Date; end: Date };
    schoolSummaries: Array<{
      schoolId: string;
      schoolName: string;
      routeCount: number;
      busCount: number;
      schoolFenceTotal: number;
      pickupFenceTotal: number;
      dangerFenceTotal: number;
      abnormalTotal: number;
      riskTags: string[];
    }>;
    riskEvents: Array<{
      no: number;
      schoolName: string;
      routeName: string;
      busPlate: string;
      fenceName: string;
      eventTime: string;
      riskTags: string[];
      riskScore: number;
      rectificationStatus: string;
    }>;
    rectifications: Array<{
      no: number;
      schoolName: string;
      routeName: string;
      type: string;
      requirement: string;
      createdAt: string;
      deadline: string;
      status: string;
      daysLeft: string;
    }>;
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  dispatch: (action) => set((state) => appReducer(state, action)),

  setFilters: (filters) =>
    set((state) => appReducer(state, { type: 'SET_FILTERS', payload: filters })),

  selectEvent: (event) =>
    set((state) => appReducer(state, { type: 'SELECT_EVENT', payload: event })),

  openRectificationModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_RECTIFICATION_MODAL', payload: true })
    ),

  closeRectificationModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_RECTIFICATION_MODAL', payload: false })
    ),

  openEventDetail: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_EVENT_DETAIL', payload: true })
    ),

  closeEventDetail: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_EVENT_DETAIL', payload: false })
    ),

  openCreateTaskModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_CREATE_TASK_MODAL', payload: true })
    ),

  closeCreateTaskModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_CREATE_TASK_MODAL', payload: false })
    ),

  openTaskDetailModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_TASK_DETAIL_MODAL', payload: true })
    ),

  closeTaskDetailModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_TASK_DETAIL_MODAL', payload: false })
    ),

  openLedgerModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_LEDGER_MODAL', payload: true })
    ),

  closeLedgerModal: () =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_LEDGER_MODAL', payload: false })
    ),

  toggleEventSelection: (eventId) =>
    set((state) =>
      appReducer(state, { type: 'TOGGLE_EVENT_SELECTION', payload: eventId })
    ),

  clearEventSelection: () =>
    set((state) => appReducer(state, { type: 'CLEAR_EVENT_SELECTION', payload: undefined })),

  setSelectedTask: (taskId) =>
    set((state) => appReducer(state, { type: 'SET_SELECTED_TASK', payload: taskId })),

  createRectification: (data) => {
    const state = get();
    const event = state.selectedEvent;
    if (!event) return;

    const routeInfo = getSchoolInfoByRoute(event.routeId);

    const newRectification: Rectification = {
      id: generateId(),
      schoolId: routeInfo.schoolId,
      schoolName: routeInfo.schoolName,
      routeId: event.routeId,
      routeName: event.routeName,
      eventId: event.id,
      eventDescription: `${event.busPlate}${event.riskTags
        .map((t) => t.description)
        .join('，')}`,
      type: data.type,
      requirement: data.requirement,
      createdAt: new Date(),
      deadline: addDays(new Date(), data.deadlineDays),
      status: 'pending',
    };

    set((state) =>
      appReducer(state, {
        type: 'CREATE_RECTIFICATION',
        payload: newRectification,
      })
    );
  },

  updateRectificationStatus: (id, status, reply) =>
    set((state) =>
      appReducer(state, {
        type: 'UPDATE_RECTIFICATION_STATUS',
        payload: { id, status, reply },
      })
    ),

  createInspectionTask: (data) => {
    const state = get();
    if (state.selectedEventIds.length === 0) return;

    const events = state.riskEvents.filter((e) =>
      state.selectedEventIds.includes(e.id)
    );

    const items: InspectionTaskItem[] = events.map((event) => ({
      eventId: event.id,
      event,
      checked: false,
    }));

    const newTask: InspectionTask = {
      id: generateId(),
      name: data.name,
      reason: data.reason,
      createdAt: new Date(),
      status: 'pending',
      createdBy: '王科长',
      items,
    };

    set((state) =>
      appReducer(state, { type: 'CREATE_INSPECTION_TASK', payload: newTask })
    );
  },

  updateTaskItem: (data) =>
    set((state) => appReducer(state, { type: 'UPDATE_TASK_ITEM', payload: data })),

  updateTaskStatus: (taskId, status) =>
    set((state) =>
      appReducer(state, { type: 'UPDATE_TASK_STATUS', payload: { taskId, status } })
    ),

  getFilteredSummaries: () => {
    const state = get();
    const { start, end } = state.filters.dateRange;

    const dailyInRange = state.dailySummaries.filter((d) =>
      isDateInRange(d.date, start, end)
    );

    const grouped: Record<string, DailyFenceSummary[]> = {};
    for (const d of dailyInRange) {
      if (!grouped[d.routeId]) grouped[d.routeId] = [];
      grouped[d.routeId].push(d);
    }

    const aggregated: FenceSummary[] = Object.entries(grouped).map(
      ([routeId, items]) => {
        const first = items[0];
        const allTags = Array.from(new Set(items.flatMap((i) => i.riskTags)));
        return {
          schoolId: first.schoolId,
          routeId,
          routeName: first.routeName,
          busCount: first.busCount,
          schoolFenceCount: items.reduce((s, i) => s + i.schoolFenceCount, 0),
          pickupFenceCount: items.reduce((s, i) => s + i.pickupFenceCount, 0),
          dangerFenceCount: items.reduce((s, i) => s + i.dangerFenceCount, 0),
          abnormalCount: items.reduce((s, i) => s + i.abnormalCount, 0),
          riskTags: allTags,
        };
      }
    );

    let result = aggregated;

    if (state.filters.selectedSchoolId) {
      result = result.filter((s) => s.schoolId === state.filters.selectedSchoolId);
    }

    if (state.filters.routeId) {
      result = result.filter((s) => s.routeId === state.filters.routeId);
    }

    if (state.filters.riskLevel) {
      const levelMap: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };
      const threshold = levelMap[state.filters.riskLevel] || 0;
      result = result.filter((s) => {
        if (s.riskTags.length === 0) return threshold <= 1;
        const maxLevel = Math.max(
          ...s.riskTags.map((t) => {
            if (['night_movement', 'off_site_boarding'].includes(t)) return 4;
            if (['frequent_detour', 'long_stay'].includes(t)) return 3;
            return 2;
          })
        );
        return maxLevel >= threshold;
      });
    }

    return result;
  },

  getFilteredEvents: () => {
    const state = get();
    const { start, end } = state.filters.dateRange;
    let events = state.riskEvents.filter((e) =>
      isDateInRange(e.entryTime, start, end)
    );

    if (state.filters.selectedSchoolId) {
      const schoolRoutes = state.fenceSummaries
        .filter((s) => s.schoolId === state.filters.selectedSchoolId)
        .map((s) => s.routeId);
      events = events.filter((e) => schoolRoutes.includes(e.routeId));
    }

    if (state.filters.routeId) {
      events = events.filter((e) => e.routeId === state.filters.routeId);
    }

    if (state.filters.riskLevel) {
      events = events.filter((e) => e.riskLevel === state.filters.riskLevel);
    }

    return sortEventsByRisk(events);
  },

  getFilteredRectifications: () => {
    const state = get();
    let rects = state.rectifications;

    if (state.filters.selectedSchoolId) {
      rects = rects.filter((r) => r.schoolId === state.filters.selectedSchoolId);
    }

    const now = new Date();
    return rects
      .map((r) => ({
        ...r,
        _effectiveStatus:
          r.status === 'pending' && r.deadline < now
            ? ('overdue' as RectificationStatus)
            : r.status,
      }))
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime()) as Rectification[];
  },

  getFilteredTasks: () => {
    const state = get();
    let tasks = state.inspectionTasks;
    if (state.filters.selectedSchoolId) {
      tasks = tasks.filter((t) =>
        t.items.some((item) => {
          const routeInfo = getSchoolInfoByRoute(item.event.routeId);
          return routeInfo.schoolId === state.filters.selectedSchoolId;
        })
      );
    }
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getRectificationByEventId: (eventId) => {
    return get().rectifications.find((r) => r.eventId === eventId);
  },

  getStatistics: () => {
    const state = get();
    const summaries = state.getFilteredSummaries();
    const events = state.getFilteredEvents();

    const totalFenceEvents = summaries.reduce(
      (sum, s) => sum + s.schoolFenceCount + s.pickupFenceCount + s.dangerFenceCount,
      0
    );

    const abnormalEvents = summaries.reduce((sum, s) => sum + s.abnormalCount, 0);

    const riskTagCount = summaries.reduce((sum, s) => sum + s.riskTags.length, 0);

    const rects = state.getFilteredRectifications();
    const now = new Date();
    const pendingRectifications = rects.filter(
      (r) => r.status === 'pending' && r.deadline >= now
    ).length;
    const overdueRectifications = rects.filter(
      (r) => r.status === 'overdue' || (r.status === 'pending' && r.deadline < now)
    ).length;

    const tasks = state.getFilteredTasks();
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

    return {
      totalFenceEvents,
      normalEvents: Math.max(0, totalFenceEvents - abnormalEvents),
      abnormalEvents,
      riskTagCount,
      pendingRectifications,
      overdueRectifications,
      totalTasks,
      pendingTasks,
    };
  },

  getLedgerData: () => {
    const state = get();
    const summaries = state.getFilteredSummaries();
    const events = state.getFilteredEvents();
    const rects = state.getFilteredRectifications();
    const { start, end } = state.filters.dateRange;

    const schoolMap: Record<string, {
      schoolId: string;
      schoolName: string;
      routeCount: number;
      busCount: number;
      schoolFenceTotal: number;
      pickupFenceTotal: number;
      dangerFenceTotal: number;
      abnormalTotal: number;
      riskTags: Set<string>;
    }> = {};

    for (const s of summaries) {
      if (!schoolMap[s.schoolId]) {
        const school = state.schools.find((sc) => sc.id === s.schoolId);
        schoolMap[s.schoolId] = {
          schoolId: s.schoolId,
          schoolName: school?.name || s.schoolId,
          routeCount: 0,
          busCount: 0,
          schoolFenceTotal: 0,
          pickupFenceTotal: 0,
          dangerFenceTotal: 0,
          abnormalTotal: 0,
          riskTags: new Set(),
        };
      }
      const entry = schoolMap[s.schoolId];
      entry.routeCount += 1;
      entry.busCount += s.busCount;
      entry.schoolFenceTotal += s.schoolFenceCount;
      entry.pickupFenceTotal += s.pickupFenceCount;
      entry.dangerFenceTotal += s.dangerFenceCount;
      entry.abnormalTotal += s.abnormalCount;
      s.riskTags.forEach((t) => entry.riskTags.add(t));
    }

    const schoolSummaries = Object.values(schoolMap).map((s) => ({
      ...s,
      riskTags: Array.from(s.riskTags),
    }));

    const riskEventsData = events.map((event, idx) => {
      const routeInfo = getSchoolInfoByRoute(event.routeId);
      const rect = state.getRectificationByEventId(event.id);
      return {
        no: idx + 1,
        schoolName: routeInfo.schoolName,
        routeName: event.routeName,
        busPlate: event.busPlate,
        fenceName: event.fenceName,
        eventTime: format(event.entryTime, 'yyyy-MM-dd HH:mm'),
        riskTags: event.riskTags.map((t) => RISK_TAG_LABELS[t.type] || t.type),
        riskScore: event.riskScore,
        rectificationStatus: rect
          ? RECTIFICATION_STATUS_LABELS[rect.status]
          : '未整改',
      };
    });

    const now = new Date();
    const rectificationsData = rects.map((r, idx) => {
      const days = differenceInDays(r.deadline, now);
      let daysLeft = '';
      if (r.status === 'overdue' || (r.status === 'pending' && days < 0)) {
        daysLeft = `超期${Math.abs(days)}天`;
      } else if (r.status === 'completed') {
        daysLeft = '已完成';
      } else if (days === 0) {
        daysLeft = '今日到期';
      } else {
        daysLeft = `剩余${days}天`;
      }
      return {
        no: idx + 1,
        schoolName: r.schoolName,
        routeName: r.routeName,
        type: RECTIFICATION_TYPE_LABELS[r.type],
        requirement: r.requirement,
        createdAt: format(r.createdAt, 'yyyy-MM-dd'),
        deadline: format(r.deadline, 'yyyy-MM-dd'),
        status: RECTIFICATION_STATUS_LABELS[r.status],
        daysLeft,
      };
    });

    return {
      dateRange: { start, end },
      schoolSummaries,
      riskEvents: riskEventsData,
      rectifications: rectificationsData,
    };
  },
}));
