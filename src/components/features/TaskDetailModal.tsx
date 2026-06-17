import { useState } from 'react';
import { X, CheckCircle, Clock, User, FileText, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDate, formatDateTime, getRiskLevelBgClass } from '../../utils';
import {
  RISK_LEVEL_LABELS,
  INSPECTION_TASK_STATUS_LABELS,
  FENCE_TYPE_LABELS,
  InspectionTaskStatus,
} from '../../types';
import { RiskTagBadge } from '../ui/RiskTagBadge';

export function TaskDetailModal() {
  const {
    ui,
    inspectionTasks,
    selectedTaskId,
    closeTaskDetailModal,
    updateTaskItem,
    updateTaskStatus,
    getTaskCompletionRate,
    addReviewedEvent,
  } = useAppStore();

  const [summary, setSummary] = useState('');
  const [showSummaryInput, setShowSummaryInput] = useState(false);

  if (!ui.showTaskDetailModal || !selectedTaskId) return null;

  const task = inspectionTasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const completionRate = getTaskCompletionRate(task.id);
  const canComplete = completionRate.canComplete;

  const hasConclusion = (item: typeof task.items[0]) => {
    return item.checked && item.conclusion && item.conclusion.trim().length > 0;
  };

  const getTaskStatusBadgeClass = (status: InspectionTaskStatus) => {
    const classes: Record<InspectionTaskStatus, string> = {
      pending: 'badge-warning',
      in_progress: 'badge-primary',
      completed: 'badge-success',
    };
    return classes[status];
  };

  const handleCheckChange = (eventId: string, checked: boolean) => {
    const item = task.items.find((i) => i.eventId === eventId);
    const currentConclusion = item?.conclusion;

    updateTaskItem({
      taskId: task.id,
      eventId,
      checked,
      conclusion: checked ? currentConclusion : undefined,
    });

    if (checked && currentConclusion && currentConclusion.trim().length > 0) {
      addReviewedEvent(eventId);
    }
  };

  const handleConclusionChange = (eventId: string, conclusion: string) => {
    const item = task.items.find((i) => i.eventId === eventId);
    if (!item || !item.checked) return;

    updateTaskItem({
      taskId: task.id,
      eventId,
      checked: true,
      conclusion,
    });

    if (conclusion && conclusion.trim().length > 0) {
      addReviewedEvent(eventId);
    }
  };

  const handleCompleteAll = () => {
    if (!canComplete) return;
    setShowSummaryInput(true);
  };

  const handleConfirmComplete = () => {
    updateTaskStatus(task.id, 'completed', summary);
    setShowSummaryInput(false);
    setSummary('');
    closeTaskDetailModal();
  };

  const handleCancelComplete = () => {
    setShowSummaryInput(false);
    setSummary('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeTaskDetailModal}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {task.name}
            </h3>
            <span className={getTaskStatusBadgeClass(task.status)}>
              {INSPECTION_TASK_STATUS_LABELS[task.status]}
            </span>
          </div>
          <button
            onClick={closeTaskDetailModal}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">创建人：</span>
              <span className="font-medium text-gray-900">{task.createdBy}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">创建时间：</span>
              <span className="font-medium text-gray-900">
                {formatDateTime(task.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">抽查人：</span>
              <span className="font-medium text-gray-900">{task.assignee}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">截止时间：</span>
              <span className="font-medium text-gray-900">
                {formatDate(task.deadline)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-500 flex-shrink-0">抽查理由：</span>
            <span className="text-gray-900">{task.reason}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {task.items.map((item) => {
            const event = item.event;
            const completed = hasConclusion(item);
            return (
              <div
                key={item.eventId}
                className={`border rounded-lg p-4 transition-colors ${
                  completed
                    ? 'border-success-200 bg-success-50/30'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleCheckChange(item.eventId, e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={task.status === 'completed'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelBgClass(
                          event.riskLevel
                        )}`}
                      >
                        {RISK_LEVEL_LABELS[event.riskLevel]}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {event.busPlate}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-sm text-gray-700">
                        {event.routeName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">围栏：</span>
                        <span>
                          {FENCE_TYPE_LABELS[event.fenceType]} - {event.fenceName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDateTime(event.entryTime)}</span>
                      </div>
                    </div>

                    {event.riskTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {event.riskTags.map((tag, index) => (
                          <RiskTagBadge key={index} type={tag.type} />
                        ))}
                      </div>
                    )}

                    {item.checked && (
                      <div className="space-y-2">
                        <textarea
                          value={item.conclusion || ''}
                          onChange={(e) =>
                            handleConclusionChange(item.eventId, e.target.value)
                          }
                          disabled={task.status === 'completed'}
                          rows={2}
                          className="input resize-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                          placeholder="请输入核查结论..."
                        />
                        {completed && item.checkedAt && (
                          <div className="flex items-center gap-1.5 text-xs text-success-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>已核查 · {formatDateTime(item.checkedAt)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {task.status === 'completed' && (
          <div className="px-6 py-4 border-t border-gray-200 bg-success-50">
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-success-700 font-medium">任务总结：</span>
                <span className="text-gray-800">{task.summary || '-'}</span>
              </div>
            </div>
            {task.completedAt && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>完成时间：{formatDateTime(task.completedAt)}</span>
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                完成进度：
                <span className="font-semibold text-primary-600">
                  {completionRate.checked}
                </span>
                {' / '}
                <span className="font-medium">{completionRate.total}</span>
                {' '}
                <span className="text-gray-500">({completionRate.rate}%)</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${completionRate.rate}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div></div>
            <div className="flex items-center gap-3">
              <button onClick={closeTaskDetailModal} className="btn-secondary">
                关闭
              </button>
              {task.status !== 'completed' && (
                <button
                  onClick={handleCompleteAll}
                  disabled={!canComplete}
                  className="btn-success"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  完成全部任务
                </button>
              )}
            </div>
          </div>
        </div>

        {showSummaryInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-xl">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                任务总结
              </h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="input resize-none w-full mb-4"
                placeholder="请输入任务总结..."
                autoFocus
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelComplete}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmComplete}
                  disabled={!summary.trim()}
                  className="btn-success"
                >
                  确认完成
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
