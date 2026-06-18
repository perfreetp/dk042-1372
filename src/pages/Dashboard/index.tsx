import { useState, useMemo } from 'react';
import {
  BarChart3,
  AlertTriangle,
  ClipboardCheck,
  ListChecks,
  Clock,
  School,
  Bus,
  Route,
  ArrowRight,
  X,
  FileText,
  Copy,
  CheckCircle,
  AlertCircle,
  Bell,
  CalendarDays,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { RiskTagBadge } from '../../components/ui/RiskTagBadge';
import { useAppStore } from '../../store/useAppStore';
import { formatDate, getRiskLevelBgClass, getRectificationStatusColor } from '../../utils';
import {
  RISK_LEVEL_LABELS,
  FENCE_TYPE_LABELS,
  RECTIFICATION_STATUS_LABELS,
  RECTIFICATION_TYPE_LABELS,
  INSPECTION_TASK_STATUS_LABELS,
} from '../../types';
import { getSchoolInfoByRoute } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

type WeeklyTabType = 'structured' | 'text';
type DateRangeType = '7d' | '30d';

type TaskUrgencyLevel = 'normal' | 'approaching' | 'overdue' | 'long_pending';

interface TaskUrgencyInfoDisplay {
  taskId: string;
  level: TaskUrgencyLevel;
  daysToDeadline: number;
  daysSinceCreated: number;
  uncheckedCount: number;
  assignee: string;
  completionRate: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    getDashboardData,
    getFilteredEvents,
    inspectionTasks,
    rectifications,
    setFilters,
    setSelectedTask,
    openTaskDetailModal,
    getWeeklyMeetingMaterial,
    getDashboardDetailData,
    getTaskUrgencyInfo,
    isEventReviewed,
    schools,
  } = useAppStore();

  const dashboard = getDashboardData();
  const filteredEvents = getFilteredEvents();

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'rectifications'>('events');
  const [detailDateRange, setDetailDateRange] = useState<DateRangeType>('7d');

  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyScope, setWeeklyScope] = useState<string>('all');
  const [weeklyTab, setWeeklyTab] = useState<WeeklyTabType>('structured');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const selectedSchool = dashboard.schoolStats.find((s) => s.schoolId === selectedSchoolId);

  const detailData = useMemo(() => {
    if (!selectedSchoolId) return null;
    return getDashboardDetailData(selectedSchoolId);
  }, [selectedSchoolId, getDashboardDetailData]);

  const currentDetailEvents = useMemo(() => {
    if (!detailData) return [];
    return detailDateRange === '7d' ? detailData.events7 : detailData.events30;
  }, [detailData, detailDateRange]);

  const currentDetailTasks = useMemo(() => {
    if (!detailData) return [];
    return detailDateRange === '7d' ? detailData.tasks7 : detailData.tasks30;
  }, [detailData, detailDateRange]);

  const currentDetailRects = useMemo(() => {
    if (!detailData) return [];
    return detailDateRange === '7d' ? detailData.rects7 : detailData.rects30;
  }, [detailData, detailDateRange]);

  const weeklyMaterial = useMemo(() => {
    const sid = weeklyScope === 'all' ? undefined : weeklyScope;
    return getWeeklyMeetingMaterial(sid);
  }, [showWeeklyModal, weeklyScope, getWeeklyMeetingMaterial]);

  const handleSchoolClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setActiveTab('events');
    setDetailDateRange('7d');
  };

  const handleDrillToRisk = (schoolId: string) => {
    setFilters({ selectedSchoolId: schoolId });
    navigate('/risk-inspection');
  };

  const handleDrillToTasks = (schoolId: string) => {
    setFilters({ selectedSchoolId: schoolId });
    navigate('/inspection-tasks');
  };

  const handleDrillToRectifications = (schoolId: string) => {
    setFilters({ selectedSchoolId: schoolId });
    navigate('/rectification');
  };

  const schoolEvents = useMemo(() => {
    if (!selectedSchool) return [];
    return filteredEvents.filter((e) => {
      const info = getSchoolInfoByRoute(e.routeId);
      return info.schoolId === selectedSchool.schoolId;
    });
  }, [filteredEvents, selectedSchool]);

  const schoolTasks = useMemo(() => {
    if (!selectedSchool) return [];
    return inspectionTasks.filter((t) =>
      t.items.some((item) => {
        const info = getSchoolInfoByRoute(item.event.routeId);
        return info.schoolId === selectedSchool.schoolId;
      })
    );
  }, [inspectionTasks, selectedSchool]);

  const schoolRects = useMemo(() => {
    if (!selectedSchool) return [];
    return rectifications.filter((r) => r.schoolId === selectedSchool.schoolId);
  }, [rectifications, selectedSchool]);

  const copyToClipboard = async (text: string, type: 'all' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'all') {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } else {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    } catch (e) {
      console.warn('复制失败', e);
    }
  };

  const getTaskUrgencyDisplay = (taskId: string): TaskUrgencyInfoDisplay => {
    const info = getTaskUrgencyInfo(taskId);
    const totalItems = currentDetailTasks.find((t) => t.id === taskId)?.items.length || 0;
    const checkedWithConclusion = currentDetailTasks
      .find((t) => t.id === taskId)
      ?.items.filter((i) => i.checked && i.conclusion && i.conclusion.trim().length > 0).length || 0;
    const completionRate = totalItems > 0 ? Math.round((checkedWithConclusion / totalItems) * 100) : 0;
    return {
      taskId: info.taskId,
      level: info.level as TaskUrgencyLevel,
      daysToDeadline: info.daysToDeadline,
      daysSinceCreated: info.daysSinceCreated,
      uncheckedCount: info.uncheckedCount + info.noConclusionCount,
      assignee: info.assignee,
      completionRate,
    };
  };

  const renderUrgencyBadge = (info: TaskUrgencyInfoDisplay) => {
    if (info.level === 'overdue') {
      return (
        <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            ⚠️ 已超期{Math.abs(info.daysToDeadline)}天，需催办抽查人 {info.assignee} 立即完成
          </span>
        </div>
      );
    }
    if (info.level === 'approaching') {
      return (
        <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg text-sm text-warning-700 flex items-start gap-2">
          <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            ⏰ 还有{info.daysToDeadline}天到期，还有 {info.uncheckedCount} 条事件未核查
          </span>
        </div>
      );
    }
    if (info.level === 'long_pending') {
      return (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 flex items-start gap-2">
          <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            📋 任务创建超{info.daysSinceCreated}天，完成率仅 {info.completionRate}%，请跟进抽查人 {info.assignee}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="抽查复盘看板"
        subtitle="按学校维度汇总风险、任务、整改数据，周例会一目了然"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-primary-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">监管学校</p>
                <p className="text-3xl font-bold text-primary-600">
                  {dashboard.overview.totalSchools}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">校车总数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboard.overview.totalBuses}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">运行线路</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboard.overview.totalRoutes}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Route className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-danger-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">近7天高风险</p>
                <p className="text-3xl font-bold text-danger-600">
                  {dashboard.overview.highRiskEvents7}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              近30天共 {dashboard.overview.highRiskEvents30} 件
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-warning-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">超期整改</p>
                <p className="text-3xl font-bold text-warning-600">
                  {dashboard.overview.overdueRectifications}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              累计下发 {dashboard.overview.totalRectifications} 件
            </p>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-500" />
                学校风险汇总
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">按近7天高风险事件数排序</span>
                <select
                  value={weeklyScope}
                  onChange={(e) => setWeeklyScope(e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">全县范围</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowWeeklyModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  生成周例会材料
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-5 py-3 text-left font-medium">学校</th>
                  <th className="px-4 py-3 text-center font-medium">高风险(7天)</th>
                  <th className="px-4 py-3 text-center font-medium">高风险(30天)</th>
                  <th className="px-4 py-3 text-center font-medium">下发整改(7天)</th>
                  <th className="px-4 py-3 text-center font-medium">下发整改(30天)</th>
                  <th className="px-4 py-3 text-center font-medium">未办任务</th>
                  <th className="px-4 py-3 text-center font-medium">临近截止</th>
                  <th className="px-4 py-3 text-center font-medium">已超期</th>
                  <th className="px-4 py-3 text-center font-medium">进行中任务</th>
                  <th className="px-4 py-3 text-center font-medium">已完成任务</th>
                  <th className="px-4 py-3 text-center font-medium">长期搁置</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboard.schoolStats.map((school) => {
                  const hasRisk = school.highRiskEvents7 > 0;
                  return (
                    <tr
                      key={school.schoolId}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        hasRisk ? 'bg-danger-50/30' : ''
                      }`}
                      onClick={() => handleSchoolClick(school.schoolId)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                            <School className="w-4.5 h-4.5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{school.schoolName}</p>
                            <p className="text-xs text-gray-500">
                              {school.highRiskEvents7 > 0
                                ? '高风险关注'
                                : school.pendingTasks + school.inProgressTasks > 0
                                ? '有任务待处理'
                                : '运行正常'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-sm font-bold ${
                            school.highRiskEvents7 > 0
                              ? 'bg-danger-100 text-danger-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {school.highRiskEvents7}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {school.highRiskEvents30}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {school.rectificationsIssued7}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {school.rectificationsIssued30}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.pendingTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {school.pendingTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.approachingTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-warning-100 text-warning-700 rounded text-xs font-medium">
                            {school.approachingTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.overdueTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-danger-100 text-danger-700 rounded text-xs font-medium">
                            {school.overdueTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.inProgressTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-warning-100 text-warning-700 rounded text-xs font-medium">
                            {school.inProgressTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.completedTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs font-medium">
                            {school.completedTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {school.longPendingTasks > 0 ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {school.longPendingTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrillToRisk(school.schoolId);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                          >
                            看风险
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrillToTasks(school.schoolId);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                          >
                            看任务
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrillToRectifications(school.schoolId);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                          >
                            看整改
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSchool && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedSchool.schoolName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    近7天高风险 {selectedSchool.highRiskEvents7} 件 · 待处理任务{' '}
                    {selectedSchool.pendingTasks + selectedSchool.inProgressTasks} 件
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSchoolId(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setDetailDateRange('7d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        detailDateRange === '7d'
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      近7天
                    </button>
                    <button
                      onClick={() => setDetailDateRange('30d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        detailDateRange === '30d'
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      近30天
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('events')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'events'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      风险事件 ({currentDetailEvents.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'tasks'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ListChecks className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      抽查任务 ({currentDetailTasks.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('rectifications')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'rectifications'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ClipboardCheck className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      整改事项 ({currentDetailRects.length})
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'events' && (
                  <div className="space-y-3">
                    {currentDetailEvents.length > 0 ? (
                      currentDetailEvents.map((event) => {
                        const checked = isEventReviewed(event.id);
                        return (
                          <div
                            key={event.id}
                            className="relative p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                          >
                            {checked && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                已核查
                              </div>
                            )}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelBgClass(
                                      event.riskLevel
                                    )}`}
                                  >
                                    {RISK_LEVEL_LABELS[event.riskLevel]}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {event.busPlate}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {event.routeName}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {FENCE_TYPE_LABELS[event.fenceType]} - {event.fenceName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(event.entryTime)}
                                </p>
                                {event.riskTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {event.riskTags.map((tag, idx) => (
                                      <RiskTagBadge key={idx} type={tag.type} />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setFilters({ selectedSchoolId: selectedSchool.schoolId });
                                  navigate('/risk-inspection');
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                查看详情
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-gray-400">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>{detailDateRange === '7d' ? '近7天' : '近30天'}暂无高风险事件</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-3">
                    {currentDetailTasks.length > 0 ? (
                      currentDetailTasks.map((task) => {
                        const urgencyInfo = getTaskUrgencyDisplay(task.id);
                        return (
                          <div
                            key={task.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      task.status === 'completed'
                                        ? 'bg-success-100 text-success-700'
                                        : task.status === 'in_progress'
                                        ? 'bg-warning-100 text-warning-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {INSPECTION_TASK_STATUS_LABELS[task.status]}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {task.name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {task.reason}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>抽查人：{task.assignee}</span>
                                  <span>截止：{formatDate(task.deadline)}</span>
                                  <span>共 {task.items.length} 条事件</span>
                                </div>
                                {renderUrgencyBadge(urgencyInfo)}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedTask(task.id);
                                  openTaskDetailModal();
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              >
                                查看详情
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-gray-400">
                        <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>暂无抽查任务</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rectifications' && (
                  <div className="space-y-3">
                    {currentDetailRects.length > 0 ? (
                      currentDetailRects.map((rect) => (
                        <div
                          key={rect.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${getRectificationStatusColor(
                                    rect.status
                                  )}`}
                                >
                                  {RECTIFICATION_STATUS_LABELS[rect.status]}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {RECTIFICATION_TYPE_LABELS[rect.type]}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {rect.requirement}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{rect.routeName}</span>
                                <span>下发：{formatDate(rect.createdAt)}</span>
                                <span>截止：{formatDate(rect.deadline)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setFilters({ selectedSchoolId: selectedSchool.schoolId });
                                navigate('/rectification');
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              查看详情
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-400">
                        <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>暂无整改事项</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showWeeklyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    校车监管周例会材料
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    可直接复制粘贴到会议纪要 · 生成时间：{weeklyMaterial.generatedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(weeklyMaterial.textSummary, 'all')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      copiedAll
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copiedAll ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        复制全文
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowWeeklyModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-2">
                <button
                  onClick={() => setWeeklyTab('structured')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    weeklyTab === 'structured'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  结构化数据
                </button>
                <button
                  onClick={() => setWeeklyTab('text')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    weeklyTab === 'text'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  会议纪要文本
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {weeklyTab === 'structured' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary-500" />
                        风险学校排行
                      </h4>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs">
                              <th className="px-4 py-2.5 text-left font-medium">排名</th>
                              <th className="px-4 py-2.5 text-left font-medium">学校名</th>
                              <th className="px-4 py-2.5 text-center font-medium">7天风险</th>
                              <th className="px-4 py-2.5 text-center font-medium">30天风险</th>
                              <th className="px-4 py-2.5 text-center font-medium">待办任务</th>
                              <th className="px-4 py-2.5 text-center font-medium">超期整改</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {weeklyMaterial.schoolRanking.map((s) => (
                              <tr key={s.rank} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                      s.rank <= 3
                                        ? 'bg-danger-100 text-danger-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {s.rank}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                  {s.schoolName}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      s.riskCount7 > 0
                                        ? 'bg-danger-100 text-danger-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {s.riskCount7}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center text-gray-600">
                                  {s.riskCount30}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {s.pendingTasks > 0 ? (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {s.pendingTasks}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {s.overdueRects > 0 ? (
                                    <span className="px-2 py-0.5 bg-danger-100 text-danger-700 rounded text-xs font-medium">
                                      {s.overdueRects}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger-500" />
                        重点事件列表（按风险评分排序 · Top15）
                      </h4>
                      <div className="space-y-2">
                        {weeklyMaterial.keyEvents.map((e) => {
                          const levelColor =
                            e.riskLevel === '重大' || e.riskLevel === '严重'
                              ? 'bg-danger-100 text-danger-700 border-danger-200'
                              : 'bg-warning-100 text-warning-700 border-warning-200';
                          return (
                            <div
                              key={e.no}
                              className={`p-3 border rounded-lg flex items-start gap-3 ${levelColor}`}
                            >
                              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs font-bold">
                                {e.no}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/70">
                                    {e.riskLevel}
                                  </span>
                                  <span className="font-medium text-sm text-gray-900">
                                    {e.schoolName}
                                  </span>
                                  <span className="text-sm text-gray-700">{e.busPlate}</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-1">
                                  {e.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{e.time}</p>
                              </div>
                            </div>
                          );
                        })}
                        {weeklyMaterial.keyEvents.length === 0 && (
                          <div className="py-8 text-center text-gray-400 text-sm">
                            暂无重点事件
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-blue-500" />
                        未办任务列表
                      </h4>
                      <div className="space-y-2">
                        {weeklyMaterial.pendingTasks.map((t) => {
                          const urgencyStyle =
                            t.urgency === '已超期'
                              ? 'bg-danger-50 border-danger-200'
                              : t.urgency === '临近截止'
                              ? 'bg-warning-50 border-warning-200'
                              : t.urgency === '长期未填'
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-gray-50 border-gray-200';
                          const badgeStyle =
                            t.urgency === '已超期'
                              ? 'bg-danger-100 text-danger-700'
                              : t.urgency === '临近截止'
                              ? 'bg-warning-100 text-warning-700'
                              : t.urgency === '长期未填'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700';
                          return (
                            <div
                              key={t.no}
                              className={`p-3 border rounded-lg ${urgencyStyle}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`text-xs font-bold px-2 py-0.5 rounded ${badgeStyle}`}
                                    >
                                      {t.urgency}
                                    </span>
                                    <span className="font-medium text-sm text-gray-900">
                                      {t.taskName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>抽查人：{t.assignee}</span>
                                    <span>截止：{t.deadline}</span>
                                    <span>未核查 {t.uncheckedCount} 条</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {weeklyMaterial.pendingTasks.length === 0 && (
                          <div className="py-8 text-center text-gray-400 text-sm">
                            暂无未办任务
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning-500" />
                        整改超期列表
                      </h4>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs">
                              <th className="px-4 py-2.5 text-left font-medium">序号</th>
                              <th className="px-4 py-2.5 text-left font-medium">学校</th>
                              <th className="px-4 py-2.5 text-left font-medium">类型</th>
                              <th className="px-4 py-2.5 text-left font-medium">整改要求</th>
                              <th className="px-4 py-2.5 text-center font-medium">截止日期</th>
                              <th className="px-4 py-2.5 text-center font-medium">超期天数</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {weeklyMaterial.overdueRectifications.map((r) => (
                              <tr key={r.no} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-600">{r.no}</td>
                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                  {r.schoolName}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600">{r.type}</td>
                                <td className="px-4 py-2.5 text-gray-700 max-w-xs truncate">
                                  {r.requirement}
                                </td>
                                <td className="px-4 py-2.5 text-center text-gray-600">
                                  {r.deadline}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className="px-2 py-0.5 bg-danger-100 text-danger-700 rounded text-xs font-bold">
                                    {r.overdueDays}天
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {weeklyMaterial.overdueRectifications.length === 0 && (
                          <div className="py-8 text-center text-gray-400 text-sm">
                            暂无超期整改
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {weeklyTab === 'text' && (
                  <div>
                    <textarea
                      readOnly
                      value={weeklyMaterial.textSummary}
                      className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg bg-white font-mono text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  数据截至当前时间，建议每周五生成
                </p>
                <button
                  onClick={() => copyToClipboard(weeklyMaterial.textSummary, 'text')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm ${
                    copiedText
                      ? 'bg-success-500 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {copiedText ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制文本内容
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
