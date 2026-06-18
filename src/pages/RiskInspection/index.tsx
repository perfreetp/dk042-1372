import {
  AlertTriangle,
  Clock,
  MapPin,
  Bus,
  Eye,
  FileEdit,
  ChevronRight,
  CheckCircle2,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { FilterBar } from '../../components/features/FilterBar';
import { RiskScoreBar } from '../../components/ui/RiskScoreBar';
import { RiskTagBadge } from '../../components/ui/RiskTagBadge';
import { useAppStore } from '../../store/useAppStore';
import {
  formatDateTime,
  formatTime,
  getRiskLevelBgClass,
  getRiskLevelColor,
  getRectificationStatusColor,
} from '../../utils';
import {
  RISK_LEVEL_LABELS,
  FENCE_TYPE_LABELS,
  FenceEvent,
  Rectification,
  RECTIFICATION_STATUS_LABELS,
} from '../../types';

export function RiskInspectionPage() {
  const {
    getFilteredEvents,
    selectEvent,
    openEventDetail,
    openRectificationModal,
    getStatistics,
    selectedEventIds,
    toggleEventSelection,
    clearEventSelection,
    openCreateTaskModal,
    getRectificationByEventId,
    isEventReviewed,
    addReviewedEvent,
  } = useAppStore();

  const events = getFilteredEvents();
  const stats = getStatistics();

  const handleViewDetail = (event: FenceEvent) => {
    selectEvent(event);
    openEventDetail();
    addReviewedEvent(event.id);
  };

  const handleCreateRectification = (event: FenceEvent) => {
    selectEvent(event);
    openRectificationModal();
  };

  const highRiskCount = events.filter(
    (e) => e.riskLevel === 'high' || e.riskLevel === 'critical'
  ).length;

  const pendingReviewCount = events.filter((e) => !isEventReviewed(e.id)).length;
  const reviewedCount = events.filter((e) => isEventReviewed(e.id)).length;
  const selectedCount = events.filter((e) => selectedEventIds.includes(e.id)).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="风险抽查"
        subtitle="按风险优先级排序，优先查看最值得关注的事件"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <FilterBar />

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-danger-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">高风险事件</p>
                <p className="text-3xl font-bold text-danger-600">
                  {highRiskCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-warning-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待核查</p>
                <p className="text-3xl font-bold text-warning-600">
                  {pendingReviewCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-500 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-success-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已核查</p>
                <p className="text-3xl font-bold text-success-600">
                  {reviewedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">已选择</p>
                <p className="text-3xl font-bold text-primary-600">
                  {selectedCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-500" />
                风险事件列表
                <span className="text-xs text-gray-500 font-normal">
                  按风险评分从高到低排序
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {selectedCount > 0 ? (
                  <>
                    <span className="text-sm text-primary-600 font-medium">
                      已选择 {selectedCount} 条
                    </span>
                    <button
                      onClick={openCreateTaskModal}
                      disabled={selectedCount === 0}
                      className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                      生成抽查任务（{selectedCount}件）
                    </button>
                    <button
                      onClick={clearEventSelection}
                      className="btn-secondary text-xs"
                    >
                      清空选择
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">
                    共 {events.length} 条记录
                  </span>
                )}
              </div>
            </div>
            {selectedEventIds.length > selectedCount && (
              <div className="mt-3 text-xs text-gray-400">
                提示：有 {selectedEventIds.length - selectedCount} 条勾选的事件不在当前筛选列表中，生成任务时不会包含
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events.map((event, index) => {
                const isReviewed = isEventReviewed(event.id);
                const isSelected = selectedEventIds.includes(event.id);
                const rect = getRectificationByEventId(event.id);

                return (
                  <div
                    key={event.id}
                    className={`p-5 hover:bg-gray-50 transition-all ${
                      isReviewed ? 'opacity-75' : ''
                    } ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <button
                        onClick={() => toggleEventSelection(event.id)}
                        className="flex-shrink-0 mt-1 text-gray-400 hover:text-primary-500 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getRiskLevelColor(
                            event.riskLevel
                          )}`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelBgClass(
                                  event.riskLevel
                                )}`}
                              >
                                {RISK_LEVEL_LABELS[event.riskLevel]}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {event.busPlate}
                              </span>
                              <span className="text-sm text-gray-500">
                                {event.routeName}
                              </span>
                              {isReviewed && (
                                <span className="flex items-center gap-1 text-xs text-success-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  已核查
                                </span>
                              )}
                              {rect && (
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRectificationStatusColor(
                                    rect.status
                                  )}`}
                                >
                                  {RECTIFICATION_STATUS_LABELS[rect.status]}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-primary-500" />
                                {FENCE_TYPE_LABELS[event.fenceType]} -{' '}
                                {event.fenceName}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {formatDateTime(event.entryTime)}
                                {event.exitTime && (
                                  <>
                                    {' '}
                                    ~ {formatTime(event.exitTime)}
                                    {event.durationMin > 0 && (
                                      <span className="text-gray-400 ml-1">
                                        ({event.durationMin}分钟)
                                      </span>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>

                            {event.riskTags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {event.riskTags.map((tag, tagIndex) => (
                                  <div key={tagIndex} className="flex items-center gap-2">
                                    <RiskTagBadge type={tag.type} />
                                    <span className="text-xs text-gray-500">
                                      {tag.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="w-64">
                              <RiskScoreBar
                                score={event.riskScore}
                                size="sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleViewDetail(event)}
                              className="btn-secondary text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              查看详情
                            </button>
                            <button
                              onClick={() =>
                                handleCreateRectification(event)
                              }
                              className="btn-primary text-xs"
                            >
                              <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                              生成整改
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>当前筛选条件下暂无风险事件</p>
                <p className="text-sm mt-1">请尝试调整筛选条件</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
