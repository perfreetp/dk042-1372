import {
  School,
  FenceSummary,
  FenceEvent,
  Rectification,
  RiskTag,
  RiskLevel,
  RiskTagType,
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

function createEvent(
  id: string,
  schoolId: string,
  busPlate: string,
  routeId: string,
  routeName: string,
  fenceType: 'school' | 'pickup' | 'danger',
  fenceName: string,
  eventType: 'entry' | 'exit' | 'missed' | 'detour',
  entryTime: Date,
  exitTime: Date | null,
  riskTags: { type: RiskTagType; level: RiskLevel }[],
  baseScore: number
): FenceEvent {
  const driver = drivers[Math.floor(Math.random() * drivers.length)];
  const attendant = attendants[Math.floor(Math.random() * attendants.length)];
  const durationMin = exitTime
    ? Math.round((exitTime.getTime() - entryTime.getTime()) / 60000)
    : 0;

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

  const daysDiff =
    (Date.now() - entryTime.getTime()) / (1000 * 60 * 60 * 24);
  const timeWeight = daysDiff <= 3 ? 1.5 : daysDiff <= 7 ? 1.2 : 1.0;
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
    routeName,
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

const now = new Date();

export const fenceEvents: FenceEvent[] = [
  createEvent(
    'e1',
    's1',
    '皖A·12345',
    'r1',
    '阳光镇1号线',
    'pickup',
    '李家村接送点',
    'detour',
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000),
    [
      { type: 'frequent_detour', level: 'high' },
      { type: 'off_site_boarding', level: 'critical' },
    ],
    30
  ),
  createEvent(
    'e2',
    's1',
    '皖A·12346',
    'r2',
    '阳光镇2号线',
    'school',
    '学校正门围栏',
    'missed',
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    null,
    [{ type: 'missing_entry', level: 'high' }],
    40
  ),
  createEvent(
    'e3',
    's2',
    '皖A·12347',
    'r3',
    '红星乡1号线',
    'danger',
    'S206省道危险段',
    'entry',
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 23 * 60 * 60 * 1000),
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 22 * 60 * 60 * 1000),
    [{ type: 'night_movement', level: 'critical' }],
    50
  ),
  createEvent(
    'e4',
    's3',
    '皖A·12348',
    'r4',
    '幸福村1号线',
    'pickup',
    '幸福村广场',
    'entry',
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000),
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    [{ type: 'long_stay', level: 'medium' }],
    30
  ),
  createEvent(
    'e5',
    's1',
    '皖A·12345',
    'r1',
    '阳光镇1号线',
    'school',
    '学校东门围栏',
    'missed',
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000),
    null,
    [{ type: 'missing_exit', level: 'high' }],
    40
  ),
  createEvent(
    'e6',
    's5',
    '皖A·12349',
    'r5',
    '胜利乡1号线',
    'pickup',
    '胜利乡政府门口',
    'detour',
    new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
    new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000),
    [
      { type: 'off_site_boarding', level: 'high' },
      { type: 'frequent_detour', level: 'medium' },
    ],
    30
  ),
  createEvent(
    'e7',
    's6',
    '皖A·12350',
    'r6',
    '光明镇1号线',
    'pickup',
    '光明镇文化站',
    'detour',
    new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000),
    [{ type: 'frequent_detour', level: 'high' }],
    30
  ),
  createEvent(
    'e8',
    's2',
    '皖A·12351',
    'r7',
    '红星乡2号线',
    'danger',
    '老桥危险路段',
    'entry',
    new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 - 18 * 60 * 60 * 1000),
    new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 - 17 * 60 * 60 * 1000),
    [],
    50
  ),
  createEvent(
    'e9',
    's1',
    '皖A·12352',
    'r8',
    '阳光镇3号线',
    'school',
    '学校北门围栏',
    'entry',
    new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000 - 7 * 30 * 60 * 1000),
    new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000 - 7 * 20 * 60 * 1000),
    [],
    0
  ),
  createEvent(
    'e10',
    's4',
    '皖A·12353',
    'r9',
    '前进镇1号线',
    'pickup',
    '前进镇汽车站',
    'entry',
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000),
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 6 * 50 * 60 * 1000),
    [],
    0
  ),
];

export const fenceSummaries: FenceSummary[] = [
  {
    schoolId: 's1',
    routeId: 'r1',
    routeName: '阳光镇1号线',
    busCount: 2,
    schoolFenceCount: 28,
    pickupFenceCount: 56,
    dangerFenceCount: 3,
    abnormalCount: 8,
    riskTags: ['frequent_detour', 'off_site_boarding'],
  },
  {
    schoolId: 's1',
    routeId: 'r2',
    routeName: '阳光镇2号线',
    busCount: 2,
    schoolFenceCount: 26,
    pickupFenceCount: 48,
    dangerFenceCount: 1,
    abnormalCount: 5,
    riskTags: ['missing_entry'],
  },
  {
    schoolId: 's1',
    routeId: 'r8',
    routeName: '阳光镇3号线',
    busCount: 2,
    schoolFenceCount: 30,
    pickupFenceCount: 52,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's2',
    routeId: 'r3',
    routeName: '红星乡1号线',
    busCount: 3,
    schoolFenceCount: 42,
    pickupFenceCount: 78,
    dangerFenceCount: 5,
    abnormalCount: 6,
    riskTags: ['night_movement'],
  },
  {
    schoolId: 's2',
    routeId: 'r7',
    routeName: '红星乡2号线',
    busCount: 3,
    schoolFenceCount: 38,
    pickupFenceCount: 65,
    dangerFenceCount: 4,
    abnormalCount: 2,
    riskTags: [],
  },
  {
    schoolId: 's2',
    routeId: 'r10',
    routeName: '红星乡3号线',
    busCount: 2,
    schoolFenceCount: 28,
    pickupFenceCount: 45,
    dangerFenceCount: 2,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's3',
    routeId: 'r4',
    routeName: '幸福村1号线',
    busCount: 2,
    schoolFenceCount: 22,
    pickupFenceCount: 38,
    dangerFenceCount: 1,
    abnormalCount: 4,
    riskTags: ['long_stay', 'missing_entry'],
  },
  {
    schoolId: 's3',
    routeId: 'r11',
    routeName: '幸福村2号线',
    busCount: 1,
    schoolFenceCount: 12,
    pickupFenceCount: 20,
    dangerFenceCount: 0,
    abnormalCount: 1,
    riskTags: [],
  },
  {
    schoolId: 's4',
    routeId: 'r9',
    routeName: '前进镇1号线',
    busCount: 3,
    schoolFenceCount: 45,
    pickupFenceCount: 85,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's4',
    routeId: 'r12',
    routeName: '前进镇2号线',
    busCount: 3,
    schoolFenceCount: 42,
    pickupFenceCount: 78,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's4',
    routeId: 'r13',
    routeName: '前进镇3号线',
    busCount: 2,
    schoolFenceCount: 30,
    pickupFenceCount: 55,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's4',
    routeId: 'r14',
    routeName: '前进镇4号线',
    busCount: 2,
    schoolFenceCount: 28,
    pickupFenceCount: 50,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's5',
    routeId: 'r5',
    routeName: '胜利乡1号线',
    busCount: 2,
    schoolFenceCount: 26,
    pickupFenceCount: 48,
    dangerFenceCount: 2,
    abnormalCount: 6,
    riskTags: ['missing_exit', 'off_site_boarding'],
  },
  {
    schoolId: 's5',
    routeId: 'r15',
    routeName: '胜利乡2号线',
    busCount: 2,
    schoolFenceCount: 24,
    pickupFenceCount: 42,
    dangerFenceCount: 1,
    abnormalCount: 2,
    riskTags: [],
  },
  {
    schoolId: 's5',
    routeId: 'r16',
    routeName: '胜利乡3号线',
    busCount: 1,
    schoolFenceCount: 12,
    pickupFenceCount: 22,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's6',
    routeId: 'r6',
    routeName: '光明镇1号线',
    busCount: 2,
    schoolFenceCount: 28,
    pickupFenceCount: 52,
    dangerFenceCount: 0,
    abnormalCount: 5,
    riskTags: ['frequent_detour'],
  },
  {
    schoolId: 's6',
    routeId: 'r17',
    routeName: '光明镇2号线',
    busCount: 1,
    schoolFenceCount: 14,
    pickupFenceCount: 26,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
  {
    schoolId: 's6',
    routeId: 'r18',
    routeName: '光明镇3号线',
    busCount: 1,
    schoolFenceCount: 12,
    pickupFenceCount: 24,
    dangerFenceCount: 0,
    abnormalCount: 0,
    riskTags: [],
  },
];

export const rectifications: Rectification[] = [
  {
    id: 'rect1',
    schoolId: 's1',
    schoolName: '阳光镇中心小学',
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
