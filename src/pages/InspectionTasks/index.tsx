import {
  ListCheck,
  Clock,
  PlayCircle,
  CheckCircle,
  Eye,
  FileText,
  User,
  Calendar,
  Building2,
  Plus,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAppStore } from '../../store/useAppStore';
import {
  formatDate,
  getDaysRemaining,
} from '../../utils';
import {
  INSPECTION_TASK_STATUS_LABELS,
  InspectionTask,
  InspectionTaskStatus,
} from '../../types';
import { getSchoolInfoByRoute } from '../../data/mockData';

function getTaskStatusColor(status: InspectionTaskStatus): string {
  const colors: Record<InspectionTaskStatus, string> = {
    pending: 'badge-primary',
    in_progress: 'badge-warning',
    completed: 'badge-success',
  };
  return colors[status];
}

function getUniqueSchoolCount(task: InspectionTask): number {
  const schoolIds = new Set<string>();
  task.items.forEach((item) => {
    const schoolInfo = getSchoolInfoByRoute(item.event.routeId);
    schoolIds.add(schoolInfo.schoolId);
  });
  return schoolIds.size;
}

function getCheckedCount(task: InspectionTask): number {
  return task.items.filter((item) => item.checked).length;
}

export function InspectionTasksPage() {
  const {
    getFilteredTasks,
    updateTaskStatus,
    openCreateTaskModal,
    setSelectedTask,
    openTaskDetailModal,
    getTaskCompletionRate,
  } = useAppStore();

  const tasks = getFilteredTasks();

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter((t) => t.status !== 'completed' && getDaysRemaining(t.deadline) < 0).length;

  const handleStartInspection = (taskId: string) => {
    updateTaskStatus(taskId, 'in_progress');
  };

  const handleViewDetail = (taskId: string) => {
    setSelectedTask(taskId);
    openTaskDetailModal();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="抽查任务"
        subtitle="管理和跟踪风险事件抽查任务的执行进度"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ListCheck className="w-5 h-5 text-primary-500" />
              任务总览
            </h3>
          </div>
          <button
            onClick={openCreateTaskModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建抽查任务
          </button>
        </div>

        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">总任务数</p>
                <p className="text-3xl font-bold text-primary-600">
                  {totalCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <ListCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待抽查</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">抽查中</p>
                <p className="text-3xl font-bold text-orange-600">
                  {inProgressCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已完成</p>
                <p className="text-3xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">超期任务</p>
                <p className="text-3xl font-bold text-red-600">
                  {overdueCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                任务列表
                <span className="text-xs text-gray-500 font-normal">
                  按创建时间倒序
                </span>
              </h3>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const completionRate = getTaskCompletionRate(task.id);
                const schoolCount = getUniqueSchoolCount(task);
                const daysRemaining = getDaysRemaining(task.deadline);
                const isOverdue = !isCompleted && daysRemaining < 0;
                const summaryText = task.summary && task.summary.length > 30
                  ? task.summary.substring(0, 30) + '...'
                  : task.summary;

                return (
                  <div
                    key={task.id}
                    className={`p-5 transition-all ${
                      isCompleted ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={getTaskStatusColor(task.status)}>
                            {INSPECTION_TASK_STATUS_LABELS[task.status]}
                          </span>
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {task.name}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            抽查人：{task.assignee}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            创建人：{task.createdBy}
                          </span>
                          <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                            <Calendar className="w-4 h-4 text-gray-400" />
                            截止日期：{formatDate(task.deadline)}
                            {isOverdue && ' (已超期)'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            创建时间：{formatDate(task.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            涉及学校：{schoolCount} 所
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ListCheck className="w-4 h-4 text-gray-400" />
                            完成 {completionRate.checked}/{completionRate.total} ({completionRate.rate}%)
                          </span>
                        </div>

                        {!isCompleted && (
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${completionRate.rate}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {isCompleted && task.completedAt && (
                          <div className="bg-green-50 rounded-lg p-3 text-sm">
                            <div className="flex items-center gap-1.5 text-green-700 mb-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">完成时间：{formatDate(task.completedAt)}</span>
                            </div>
                            {summaryText && (
                              <p className="text-gray-600 text-xs mt-1">
                                结论摘要：{summaryText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleStartInspection(task.id)}
                            className="btn-primary text-xs flex items-center gap-1.5"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            开始抽查
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(task.id)}
                          className="btn-secondary text-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400">
                <ListCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>当前筛选条件下暂无抽查任务</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
