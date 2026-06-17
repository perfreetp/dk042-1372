import { useState } from 'react';
import {
  ClipboardCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { FilterBar } from '../../components/features/FilterBar';
import { useAppStore } from '../../store/useAppStore';
import {
  formatDate,
  getDeadlineColorClass,
  getDaysRemaining,
  getRectificationStatusColor,
} from '../../utils';
import {
  RECTIFICATION_STATUS_LABELS,
  RECTIFICATION_TYPE_LABELS,
  Rectification,
  RectificationStatus,
} from '../../types';

export function RectificationPage() {
  const { getFilteredRectifications, updateRectificationStatus } =
    useAppStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const rectifications = getFilteredRectifications();

  const pendingCount = rectifications.filter(
    (r) => r.status === 'pending'
  ).length;
  const overdueCount = rectifications.filter(
    (r) => r.status === 'overdue'
  ).length;
  const completedCount = rectifications.filter(
    (r) => r.status === 'completed'
  ).length;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusUpdate = (
    id: string,
    status: RectificationStatus,
    reply?: string
  ) => {
    updateRectificationStatus(id, status, reply);
    setReplyText((prev) => ({ ...prev, [id]: '' }));
  };

  const getDaysRemainingText = (deadline: Date) => {
    const days = getDaysRemaining(deadline);
    if (days < 0) return `已超期 ${Math.abs(days)} 天`;
    if (days === 0) return '今日到期';
    return `剩余 ${days} 天`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="整改跟踪"
        subtitle="按到期日自动排序，及时跟进学校整改回复"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <FilterBar showRouteFilter={false} showRiskFilter={false} />

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">整改事项总数</p>
                <p className="text-3xl font-bold text-primary-600">
                  {rectifications.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待回复</p>
                <p className="text-3xl font-bold text-warning-600">
                  {pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已超期</p>
                <p className="text-3xl font-bold text-danger-600">
                  {overdueCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已完成</p>
                <p className="text-3xl font-bold text-success-600">
                  {completedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary-500" />
                整改事项列表
                <span className="text-xs text-gray-500 font-normal">
                  按到期日排序
                </span>
              </h3>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {rectifications.length > 0 ? (
              rectifications.map((rectification) => {
                const isExpanded = expandedId === rectification.id;
                const daysRemaining = getDaysRemaining(rectification.deadline);

                return (
                  <div key={rectification.id} className="transition-colors">
                    <button
                      onClick={() => toggleExpand(rectification.id)}
                      className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-1.5 h-12 rounded-full ${
                            daysRemaining < 0
                              ? 'bg-danger-500'
                              : daysRemaining <= 1
                              ? 'bg-danger-400'
                              : daysRemaining <= 3
                              ? 'bg-warning-400'
                              : 'bg-success-400'
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span
                                className={getRectificationStatusColor(
                                  rectification.status
                                )}
                              >
                                {RECTIFICATION_STATUS_LABELS[
                                  rectification.status
                                ]}
                              </span>
                              <span className="badge-primary">
                                {
                                  RECTIFICATION_TYPE_LABELS[
                                    rectification.type
                                  ]
                                }
                              </span>
                              <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {rectification.schoolName}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <div
                                className={`text-sm ${getDeadlineColorClass(
                                  rectification.deadline
                                )}`}
                              >
                                {getDaysRemainingText(rectification.deadline)}
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <p className="flex-1 truncate">
                              {rectification.eventDescription}
                            </p>
                            <span className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                              <Calendar className="w-4 h-4" />
                              到期：{formatDate(rectification.deadline)}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                              <Clock className="w-4 h-4" />
                              发出：{formatDate(rectification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pl-[5.5rem]">
                        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              整改要求
                            </h4>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {rectification.requirement}
                            </p>
                          </div>

                          {rectification.schoolReply && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  学校回复
                                </h4>
                                <span className="text-xs text-gray-400">
                                  {rectification.replyDate &&
                                    formatDate(rectification.replyDate)}
                                </span>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {rectification.schoolReply}
                                </p>
                              </div>
                            </div>
                          )}

                          {rectification.status === 'replied' && (
                            <div className="pt-4 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                审核回复
                              </h4>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      rectification.id,
                                      'completed'
                                    )
                                  }
                                  className="btn-success text-xs"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                  审核通过
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      rectification.id,
                                      'rejected'
                                    )
                                  }
                                  className="btn-danger text-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                  要求重提
                                </button>
                              </div>
                            </div>
                          )}

                          {rectification.status === 'pending' && (
                            <div className="pt-4 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                标记状态
                              </h4>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={replyText[rectification.id] || ''}
                                  onChange={(e) =>
                                    setReplyText((prev) => ({
                                      ...prev,
                                      [rectification.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="记录学校电话回复内容（可选）..."
                                  className="input flex-1 text-sm"
                                />
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      rectification.id,
                                      'replied',
                                      replyText[rectification.id]
                                    )
                                  }
                                  className="btn-primary text-xs"
                                >
                                  <Send className="w-3.5 h-3.5 mr-1.5" />
                                  标记已回复
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>当前筛选条件下暂无整改事项</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
