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
  } = useAppStore();

  const dashboard = getDashboardData();
  const filteredEvents = getFilteredEvents();

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'rectifications'>('events');

  const selectedSchool = dashboard.schoolStats.find((s) => s.schoolId === selectedSchoolId);

  const handleSchoolClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setActiveTab('events');
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
              <span className="text-xs text-gray-500">按近7天高风险事件数排序</span>
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
                  <th className="px-4 py-3 text-center font-medium">待处理任务</th>
                  <th className="px-4 py-3 text-center font-medium">进行中任务</th>
                  <th className="px-4 py-3 text-center font-medium">已完成任务</th>
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

              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex gap-2">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'events'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  风险事件 ({schoolEvents.length})
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
                  抽查任务 ({schoolTasks.length})
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
                  整改事项 ({schoolRects.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'events' && (
                  <div className="space-y-3">
                    {schoolEvents.length > 0 ? (
                      schoolEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                        >
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
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-400">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p>近7天暂无高风险事件</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-3">
                    {schoolTasks.length > 0 ? (
                      schoolTasks.map((task) => (
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
                      ))
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
                    {schoolRects.length > 0 ? (
                      schoolRects.map((rect) => (
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
      </div>
    </div>
  );
}
