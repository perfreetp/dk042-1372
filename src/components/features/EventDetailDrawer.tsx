import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  FileEdit,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime, formatTime, getRiskLevelBgClass, getRectificationStatusColor, formatDate } from '../../utils';
import { RiskScoreBar } from '../ui/RiskScoreBar';
import { RiskTagBadge } from '../ui/RiskTagBadge';
import {
  FENCE_TYPE_LABELS,
  RISK_LEVEL_LABELS,
  RECTIFICATION_STATUS_LABELS,
  RECTIFICATION_TYPE_LABELS,
} from '../../types';

export function EventDetailDrawer() {
  const { ui, selectedEvent, closeEventDetail, openRectificationModal, getRectificationByEventId } =
    useAppStore();
  const rect = selectedEvent ? getRectificationByEventId(selectedEvent.id) : undefined;

  if (!ui.showEventDetail || !selectedEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeEventDetail}
      />
      <div className="relative w-[480px] bg-white shadow-2xl animate-slide-in-right overflow-hidden flex flex-col">
        <div
          className={`h-1.5 w-full ${
            selectedEvent.riskLevel === 'critical'
              ? 'bg-danger-500'
              : selectedEvent.riskLevel === 'high'
              ? 'bg-warning-500'
              : selectedEvent.riskLevel === 'medium'
              ? 'bg-warning-400'
              : 'bg-success-500'
          }`}
        />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              围栏事件详情
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedEvent.busPlate} | {selectedEvent.routeName}
            </p>
          </div>
          <button
            onClick={closeEventDetail}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelBgClass(
                  selectedEvent.riskLevel
                )}`}
              >
                {RISK_LEVEL_LABELS[selectedEvent.riskLevel]}
              </span>
              <span className="text-sm text-gray-500">
                风险评分：
                <span className="font-semibold text-gray-900">
                  {selectedEvent.riskScore}
                </span>
              </span>
            </div>
            <RiskScoreBar score={selectedEvent.riskScore} showLabel={false} />
          </div>

          {selectedEvent.riskTags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-500" />
                风险标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.riskTags.map((tag, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <RiskTagBadge type={tag.type} />
                    <span className="text-xs text-gray-500 pl-1">
                      {tag.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              围栏信息
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500">围栏类型</span>
                <span className="text-sm font-medium text-gray-900">
                  {FENCE_TYPE_LABELS[selectedEvent.fenceType]}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500">围栏名称</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedEvent.fenceName}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              时间信息
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500">进入时间</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDateTime(selectedEvent.entryTime)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-gray-500">离开时间</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedEvent.exitTime
                    ? formatDateTime(selectedEvent.exitTime)
                    : '-'}
                </span>
              </div>
              {selectedEvent.durationMin > 0 && (
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-gray-500">停留时长</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedEvent.durationMin} 分钟
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              当班人员
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-primary-600 font-medium">
                    司机
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEvent.driver.name}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {selectedEvent.driver.phone}
                </div>
              </div>
              <div className="bg-success-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-success-600 font-medium">
                    照管员
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEvent.attendant.name}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {selectedEvent.attendant.phone}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary-500" />
              整改状态
            </h4>
            {!rect ? (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">暂未发起整改</span>
                <button
                  onClick={openRectificationModal}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  生成整改
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">整改状态</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRectificationStatusColor(
                      rect.status
                    )}`}
                  >
                    {RECTIFICATION_STATUS_LABELS[rect.status]}
                  </span>
                </div>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">整改类型</span>
                  <span className="text-sm font-medium text-gray-900">
                    {RECTIFICATION_TYPE_LABELS[rect.type]}
                  </span>
                </div>
                <div className="p-4 border-b border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1.5">整改要求</span>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {rect.requirement}
                  </p>
                </div>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">下发日期</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(rect.createdAt)}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">截止日期</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(rect.deadline)}
                  </span>
                </div>
                {rect.schoolReply && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">学校回复</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(rect.replyDate || null)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {rect.schoolReply}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              轨迹证据
            </h4>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">轨迹回放预览</p>
                <p className="text-xs mt-1">
                  {formatTime(selectedEvent.entryTime)} -{' '}
                  {selectedEvent.exitTime
                    ? formatTime(selectedEvent.exitTime)
                    : '至今'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              openRectificationModal();
              closeEventDetail();
            }}
            className="w-full btn-primary"
          >
            <FileEdit className="w-4 h-4 mr-2" />
            生成整改事项
          </button>
        </div>
      </div>
    </div>
  );
}
