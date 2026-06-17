import {
  School,
  FenceSummary,
  FenceEvent,
  Rectification,
  RiskTag,
  RiskLevel,
  RiskTagType,
  DailyFenceSummary,
  InspectionTask,
  InspectionTaskStatus,
  ReviewedEvent,
} from '../types';

const drivers = [
  { id: 'd1', name: '张建国', phone: '138****1234' },
  { id: 'd2', name: '李为民', phone: '139****5678' },
  { id: 'd3', name: '王建设', phone: '137****9012' },
  { id: 'd4', name: '赵援朝', phone: '136****3456' },
  { id: 'd5', name: '孙红旗', phone: '135****7890' },
];

const attendants = [
  { id: 'a1', name: '刘桂兰', phone: '158****2345' },
  { id: 'a2', name: '陈秀梅', phone: '159****6789' },
  { id: 'a3', name: '周玉英', phone: '157****0123' },
  { id: 'a4', name: '吴淑珍', phone: '156****4567' },
  { id: 'a5', name: '郑美华', phone: '155****8901' },
];

export const schools: School[] = [
  {
    id: 's1',
    name: '阳光镇中心小学',
    address: '阳光镇育才路1号',
    busCount: 6,
    routeCount: 4,
    latestRiskTags: ['frequent_detour', 'off_site_boarding'],
  },
  {
    id: 's2',
    name: '红星乡第一中学',
    address: '红星乡文化路88号',
    busCount: 8,
    routeCount: 6,
    latestRiskTags: ['night_movement'],
  },
  {
    id: 's3',
    name: '幸福村完全小学',
    address: '幸福村幸福路12号',
    busCount: 3,
    routeCount: 2,
    latestRiskTags: ['long_stay', 'missing_entry'],
  },
  {
    id: 's4',
    name: '前进镇实验学校',
    address: '前进镇科技路66号',
    busCount: 10,
    routeCount: 8,
    latestRiskTags: [],
  },
  {
    id: 's5',
    name: '胜利乡第二小学',
    address: '胜利乡胜利街58号',
    busCount: 5,
    routeCount: 3,
    latestRiskTags: ['missing_exit', 'off_site_boarding'],
  },
  {
    id: 's6',
    name: '光明镇中心幼儿园',
    address: '光明镇童趣路3号',
    busCount: 4,
    routeCount: 3,
    latestRiskTags: ['frequent_detour'],
  },
];

const routeSchoolMap: Record<string, { schoolId: string; schoolName: string; routeName: string }> = {
  r1: { schoolId: 's1', schoolName: '阳光镇中心小学', routeName: '阳光镇1号线' },
  r2: { schoolId: 's1', schoolName: '阳光镇中心小学', routeName: '阳光镇2号线' },
  r8: { schoolId: 's1', schoolName: '阳光镇中心小学', routeName: '阳光镇3号线' },
  r19: { schoolId: 's1', schoolName: '阳光镇中心小学', routeName: '阳光镇4号线' },
  r3: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡1号线' },
  r7: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡2号线' },
  r10: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡3号线' },
  r20: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡4号线' },
  r21: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡5号线' },
  r22: { schoolId: 's2', schoolName: '红星乡第一中学', routeName: '红星乡6号线' },
  r4: { schoolId: 's3', schoolName: '幸福村完全小学', routeName: '幸福村1号线' },
  r11: { schoolId: 's3', schoolName: '幸福村完全小学', routeName: '幸福村2号线' },
  r9: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇1号线' },
  r12: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇2号线' },
  r13: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇3号线' },
  r14: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇4号线' },
  r23: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇5号线' },
  r24: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇6号线' },
  r25: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇7号线' },
  r26: { schoolId: 's4', schoolName: '前进镇实验学校', routeName: '前进镇8号线' },
  r5: { schoolId: 's5', schoolName: '胜利乡第二小学', routeName: '胜利乡1号线' },
  r15: { schoolId: 's5', schoolName: '胜利乡第二小学', routeName: '胜利乡2号线' },
  r16: { schoolId: 's5', schoolName: '胜利乡第二小学', routeName: '胜利乡3号线' },
  r6: { schoolId: 's6', schoolName: '光明镇中心幼儿园', routeName: '光明镇1号线' },
  r17: { schoolId: 's6', schoolName: '光明镇中心幼儿园', routeName: '光明镇2号线' },
  r18: { schoolId: 's6', schoolName: '光明镇中心幼儿园', routeName: '光明镇3号线' },
};

export function getSchoolInfoByRoute(routeId: string) {
  return routeSchoolMap[routeId] || routeSchoolMap['r1'];
}

function createRiskTag(
  type: RiskTagType,
  level: RiskLevel
): RiskTag {
  const descriptions: Record<RiskTagType, string> = {
    frequent_detour: '3天内累计绕行5次以上',
    off_site_boarding: '在核定站点外上下学生',
    night_movement: '22:00-次日5:00期间有异常移动',
    long_stay: '在非指定区域停留超过30分钟',
    missing_entry: '应进入学校围栏但未进入',
    missing_exit: '应离开学校围栏但未离开',
  };
  return { type, description: descriptions[type], level };
}

export const fenceSummaries: FenceSummary[] = Object.entries(routeSchoolMap).map(
  ([routeId, info]) => {
    const riskMap: Record<string, RiskTagType[]> = {
      r1: ['frequent_detour', 'off_site_boarding'],
      r2: ['missing_entry'],
      r3: ['night_movement'],
      r4: ['long_stay', 'missing_entry'],
      r5: ['missing_exit', 'off_site_boarding'],
      r6: ['frequent_detour'],
      r7: [],
      r8: [],
      r9: [],
      r10: [],
      r11: [],
      r12: [],
      r13: [],
      r14: [],
      r15: [],
      r16: [],
      r17: [],
      r18: [],
      r19: [],
      r20: [],
      r21: [],
      r22: [],
      r23: [],
      r24: [],
      r25: [],
      r26: [],
    };
    const abnormalMap: Record<string, number> = {
      r1: 8, r2: 5, r3: 6, r4: 4, r5: 6, r6: 5, r7: 2, r8: 0,
      r9: 0, r10: 0, r11: 1, r12: 0, r13: 0, r14: 0, r15: 2, r16: 0,
      r17: 0, r18: 0, r19: 0, r20: 0, r21: 0, r22: 0, r23: 0, r24: 0,
      r25: 0, r26: 0,
    };
    const busCountMap: Record<string, number> = {
      r1: 2, r2: 2, r3: 3, r4: 2, r5: 2, r6: 2, r7: 3, r8: 2,
      r9: 3, r10: 2, r11: 1, r12: 3, r13: 2, r14: 2, r15: 2, r16: 1,
      r17: 1, r18: 1, r19: 2, r20: 1, r21: 1, r22: 1, r23: 1, r24: 2,
      r25: 2, r26: 2,
    };
    const tags = riskMap[routeId] || [];
    const abnormal = abnormalMap[routeId] || 0;
    const baseSchool = Math.floor(Math.random() * 10) + 20;
    const basePickup = Math.floor(Math.random() * 20) + 35;
    const baseDanger = tags.length > 0 ? Math.floor(Math.random() * 4) + 1 : 0;

    return {
      schoolId: info.schoolId,
      routeId,
      routeName: info.routeName,
      busCount: busCountMap[routeId] || 2,
      schoolFenceCount: baseSchool,
      pickupFenceCount: basePickup,
      dangerFenceCount: baseDanger,
      abnormalCount: abnormal,
      riskTags: tags,
    };
  }
);

function generateDailySummaries(): DailyFenceSummary[] {
  const result: DailyFenceSummary[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);

    for (const summary of fenceSummaries) {
      const factor = dayOffset <= 7 ? 1 : dayOffset <= 15 ? 0.9 : 0.8;
      const hasAbnormal = summary.abnormalCount > 0;
      const abnormalChance = dayOffset <= 7 ? (hasAbnormal ? 0.7 : 0.2) : hasAbnormal ? 0.4 : 0.1;
      const hasAbnormalToday = Math.random() < abnormalChance;

      result.push({
        date,
        schoolId: summary.schoolId,
        routeId: summary.routeId,
        routeName: summary.routeName,
        busCount: summary.busCount,
        schoolFenceCount: Math.round(summary.schoolFenceCount / 7 * factor),
        pickupFenceCount: Math.round(summary.pickupFenceCount / 7 * factor),
        dangerFenceCount: Math.random() < 0.3 ? (summary.dangerFenceCount > 0 ? 1 : 0) : 0,
        abnormalCount: hasAbnormalToday ? Math.ceil(Math.random() * 3) : 0,
        riskTags: hasAbnormalToday ? summary.riskTags.slice(0, Math.ceil(Math.random() * summary.riskTags.length)) : [],
      });
    }
  }

  return result;
}

export const dailySummaries: DailyFenceSummary[] = generateDailySummaries();

function createEvent(
  id: string,
  routeId: string,
  busPlate: string,
  fenceType: 'school' | 'pickup' | 'danger',
  fenceName: string,
  eventType: 'entry' | 'exit' | 'missed' | 'detour',
  daysAgo: number,
  hour: number,
  durationMin: number,
  riskTags: { type: RiskTagType; level: RiskLevel }[],
  baseScore: number
): FenceEvent {
  const routeInfo = routeSchoolMap[routeId] || routeSchoolMap['r1'];
  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  const attendant = attendants[Math.floor(Math.random() * attendants.length)];

  const now = new Date();
  const entryTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  entryTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  const exitTime = durationMin > 0
    ? new Date(entryTime.getTime() + durationMin * 60 * 1000)
    : null;

  const tagBonus = riskTags.reduce((sum, tag) => {
    const bonuses: Record<RiskTagType, number> = {
      frequent_detour: 20,
      off_site_boarding: 25,
      night_movement: 30,
      long_stay: 15,
      missing_entry: 0,
      missing_exit: 0,
    };
    return sum + bonuses[tag.type];
  }, 0);

  const timeWeight = daysAgo <= 3 ? 1.5 : daysAgo <= 7 ? 1.2 : 1.0;
  const riskScore = Math.min(100, Math.round((baseScore + tagBonus) * timeWeight));

  const riskLevel: RiskLevel =
    riskScore >= 80
      ? 'critical'
      : riskScore >= 60
      ? 'high'
      : riskScore >= 40
      ? 'medium'
      : 'low';

  return {
    id,
    busId: `bus${id}`,
    busPlate,
    routeId,
    routeName: routeInfo.routeName,
    fenceType,
    fenceName,
    eventType,
    entryTime,
    exitTime,
    durationMin,
    driver,
    attendant,
    riskScore,
    riskLevel,
    riskTags: riskTags.map((t) => createRiskTag(t.type, t.level)),
  };
}

export const fenceEvents: FenceEvent[] = [
  createEvent('e1', 'r1', '皖A·12345', 'pickup', '李家村接送点', 'detour', 1, 8, 60,
    [{ type: 'frequent_detour', level: 'high' }, { type: 'off_site_boarding', level: 'critical' }], 30),
  createEvent('e2', 'r2', '皖A·12346', 'school', '学校正门围栏', 'missed', 2, 7, 0,
    [{ type: 'missing_entry', level: 'high' }], 40),
  createEvent('e3', 'r3', '皖A·12347', 'danger', 'S206省道危险段', 'entry', 3, 23, 60,
    [{ type: 'night_movement', level: 'critical' }], 50),
  createEvent('e4', 'r4', '皖A·12348', 'pickup', '幸福村广场', 'entry', 5, 8, 65,
    [{ type: 'long_stay', level: 'medium' }], 30),
  createEvent('e5', 'r1', '皖A·12345', 'school', '学校东门围栏', 'missed', 1, 16, 0,
    [{ type: 'missing_exit', level: 'high' }], 40),
  createEvent('e6', 'r5', '皖A·12349', 'pickup', '胜利乡政府门口', 'detour', 4, 6, 60,
    [{ type: 'off_site_boarding', level: 'high' }, { type: 'frequent_detour', level: 'medium' }], 30),
  createEvent('e7', 'r6', '皖A·12350', 'pickup', '光明镇文化站', 'detour', 6, 7, 55,
    [{ type: 'frequent_detour', level: 'high' }], 30),
  createEvent('e8', 'r7', '皖A·12351', 'danger', '老桥危险路段', 'entry', 10, 18, 60,
    [], 50),
  createEvent('e9', 'r8', '皖A·12352', 'school', '学校北门围栏', 'entry', 8, 7, 10,
    [], 0),
  createEvent('e10', 'r9', '皖A·12353', 'pickup', '前进镇汽车站', 'entry', 2, 7, 10,
    [], 0),
  createEvent('e11', 'r1', '皖A·12345', 'pickup', '王家村路口', 'detour', 10, 7, 45,
    [{ type: 'frequent_detour', level: 'medium' }], 30),
  createEvent('e12', 'r3', '皖A·12354', 'school', '学校南门围栏', 'missed', 12, 7, 0,
    [{ type: 'missing_entry', level: 'medium' }], 40),
  createEvent('e13', 'r19', '皖A·12355', 'pickup', '阳光镇卫生院', 'entry', 15, 7, 40,
    [{ type: 'long_stay', level: 'low' }], 30),
  createEvent('e14', 'r20', '皖A·12356', 'danger', '红星乡急弯段', 'entry', 20, 17, 30,
    [], 50),
  createEvent('e15', 'r5', '皖A·12349', 'school', '学校正门围栏', 'missed', 25, 7, 0,
    [{ type: 'missing_entry', level: 'medium' }], 40),
];

const now = new Date();

export const rectifications: Rectification[] = [
  {
    id: 'rect1',
    schoolId: 's1',
    schoolName: '阳光镇中心小学',
    routeId: 'r1',
    routeName: '阳光镇1号线',
    eventId: 'e1',
    eventDescription: '皖A·12345在李家村接送点附近频繁绕行并站点外上下车',
    type: 'explain',
    requirement:
      '请说明2026年6月17日上午校车绕行及站点外上下学生的原因，并提供相关佐证材料。',
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'rect2',
    schoolId: 's2',
    schoolName: '红星乡第一中学',
    routeId: 'r3',
    routeName: '红星乡1号线',
    eventId: 'e3',
    eventDescription: '皖A·12347于夜间23点进入S206省道危险路段',
    type: 'explain',
    requirement:
      '请说明2026年6月15日夜间校车进入危险路段的原因，及夜间出车的审批手续。',
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    status: 'overdue',
  },
  {
    id: 'rect3',
    schoolId: 's3',
    schoolName: '幸福村完全小学',
    routeId: 'r4',
    routeName: '幸福村1号线',
    eventId: 'e4',
    eventDescription: '皖A·12348在幸福村广场停留超过60分钟',
    type: 'supplement_record',
    requirement:
      '请补充2026年6月13日校车长时间停留的情况说明及相关家长告知记录。',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    status: 'replied',
    schoolReply:
      '因车辆临时故障，司机在安全区域停车等待维修，已电话告知所有乘车学生家长。附维修记录及通话记录。',
    replyDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'rect4',
    schoolId: 's5',
    schoolName: '胜利乡第二小学',
    routeId: 'r5',
    routeName: '胜利乡1号线',
    eventId: 'e6',
    eventDescription: '皖A·12349在胜利乡政府门口站点外上下学生',
    type: 'revalidate_site',
    requirement:
      '请重新核定胜利乡1号线的站点设置，评估是否需要在该区域增设接送点。',
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'rect5',
    schoolId: 's1',
    schoolName: '阳光镇中心小学',
    routeId: 'r2',
    routeName: '阳光镇2号线',
    eventId: 'e2',
    eventDescription: '皖A·12346未按规定进入学校正门围栏',
    type: 'explain',
    requirement:
      '请说明2026年6月16日早间校车未进入学校围栏的原因，并确保今后严格按照规定路线行驶。',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    status: 'completed',
    schoolReply:
      '当日因学校正门临时施工，经与学校沟通后从东门进入，已补报变更申请。今后将提前报备路线变更。',
    replyDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'rect6',
    schoolId: 's6',
    schoolName: '光明镇中心幼儿园',
    routeId: 'r6',
    routeName: '光明镇1号线',
    eventId: 'e7',
    eventDescription: '皖A·12350在光明镇文化站附近频繁绕行',
    type: 'revalidate_site',
    requirement:
      '请核查光明镇1号线的站点设置，绕行路段是否需要调整或增设站点。',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
    status: 'pending',
  },
];

export const inspectionTasks: InspectionTask[] = [
  {
    id: 'task1',
    name: '6月第三周高风险事件专项抽查',
    reason: '本周夜间异常移动和站点外上下车风险事件集中，需重点抽查核实。',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    status: 'in_progress' as InspectionTaskStatus,
    createdBy: '王科长',
    assignee: '李科员',
    items: [
      {
        eventId: 'e1',
        event: fenceEvents.find(e => e.id === 'e1')!,
        checked: true,
        conclusion: '经核实，确因道路施工临时绕行，已督促学校优化线路。',
        checkedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        eventId: 'e3',
        event: fenceEvents.find(e => e.id === 'e3')!,
        checked: false,
      },
      {
        eventId: 'e5',
        event: fenceEvents.find(e => e.id === 'e5')!,
        checked: false,
      },
    ],
  },
  {
    id: 'task2',
    name: '阳光镇中心小学围栏执行例行抽查',
    reason: '月度例行抽查，覆盖阳光镇中心小学所有线路。',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    deadline: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed' as InspectionTaskStatus,
    createdBy: '王科长',
    assignee: '王科长',
    completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    summary: '本次抽查共1条风险事件，已全部核实完毕。未进入围栏系因学校正门施工，情况属实，已督促学校完善变更备案流程。',
    items: [
      {
        eventId: 'e2',
        event: fenceEvents.find(e => e.id === 'e2')!,
        checked: true,
        conclusion: '学校正门施工，情况属实，已要求学校提交路线变更备案。',
        checkedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
    ],
  },
];

export const initialReviewedEvents: ReviewedEvent[] = [
  { eventId: 'e9', reviewedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
  { eventId: 'e10', reviewedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
];
