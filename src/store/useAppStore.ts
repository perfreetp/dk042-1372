import { create } from 'zustand';
import { addDays } from 'date-fns';
import {
  AppState,
  AppAction,
  FenceSummary,
  FenceEvent,
  Rectification,
  Filters,
  RectificationStatus,
} from '../types';
import { schools, fenceSummaries, fenceEvents, rectifications } from '../data/mockData';
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
  riskEvents: sortEventsByRisk(fenceEvents),
  rectifications,
  selectedEvent: null,
  ui: {
    isLoading: false,
    showRectificationModal: false,
    showEventDetail: false,
  },
};

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

    case 'LOAD_FENCE_SUMMARIES':
      return {
        ...state,
        fenceSummaries: action.payload,
      };

    case 'LOAD_RISK_EVENTS':
      return {
        ...state,
        riskEvents: sortEventsByRisk(action.payload),
      };

    case 'LOAD_RECTIFICATIONS':
      return {
        ...state,
        rectifications: action.payload,
      };

    case 'SELECT_EVENT':
      return {
        ...state,
        selectedEvent: action.payload,
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
  getFilteredSummaries: () => FenceSummary[];
  getFilteredEvents: () => FenceEvent[];
  getFilteredRectifications: () => Rectification[];
  getStatistics: () => {
    totalFenceEvents: number;
    normalEvents: number;
    abnormalEvents: number;
    riskTagCount: number;
    pendingRectifications: number;
    overdueRectifications: number;
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  dispatch: (action) =>
    set((state) => appReducer(state, action)),

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

  createRectification: (data) => {
    const state = get();
    const event = state.selectedEvent;
    if (!event) return;

    const school = state.schools.find(
      (s) => s.id === state.filters.selectedSchoolId || state.schools[0].id
    );
    if (!school) return;

    const newRectification: Rectification = {
      id: generateId(),
      schoolId: school.id,
      schoolName: school.name,
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

  getFilteredSummaries: () => {
    const state = get();
    let summaries = state.fenceSummaries;

    if (state.filters.selectedSchoolId) {
      summaries = summaries.filter(
        (s) => s.schoolId === state.filters.selectedSchoolId
      );
    }

    if (state.filters.routeId) {
      summaries = summaries.filter((s) => s.routeId === state.filters.routeId);
    }

    if (state.filters.riskLevel) {
      const levelMap: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };
      const threshold = levelMap[state.filters.riskLevel] || 0;
      summaries = summaries.filter((s) => {
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

    return summaries;
  },

  getFilteredEvents: () => {
    const state = get();
    let events = state.riskEvents;

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

    return rects.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  },

  getStatistics: () => {
    const state = get();
    const summaries = state.getFilteredSummaries();
    const events = state.getFilteredEvents();

    const totalFenceEvents = summaries.reduce(
      (sum, s) => sum + s.schoolFenceCount + s.pickupFenceCount + s.dangerFenceCount,
      0
    );

    const abnormalEvents = summaries.reduce(
      (sum, s) => sum + s.abnormalCount,
      0
    );

    const riskTagCount = summaries.reduce(
      (sum, s) => sum + s.riskTags.length,
      0
    );

    const rects = state.getFilteredRectifications();
    const pendingRectifications = rects.filter(
      (r) => r.status === 'pending'
    ).length;
    const overdueRectifications = rects.filter(
      (r) => r.status === 'overdue'
    ).length;

    return {
      totalFenceEvents,
      normalEvents: totalFenceEvents - abnormalEvents,
      abnormalEvents,
      riskTagCount,
      pendingRectifications,
      overdueRectifications,
    };
  },
}));
