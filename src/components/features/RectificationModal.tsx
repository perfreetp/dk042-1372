import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  RectificationType,
  RECTIFICATION_TYPE_LABELS,
} from '../../types';
import { getSchoolInfoByRoute } from '../../data/mockData';

const deadlineOptions = [
  { value: 3, label: '3个工作日' },
  { value: 7, label: '7个工作日' },
  { value: 15, label: '15个工作日' },
];

export function RectificationModal() {
  const {
    ui,
    selectedEvent,
    closeRectificationModal,
    createRectification,
  } = useAppStore();

  const [type, setType] = useState<RectificationType>('explain');
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [requirement, setRequirement] = useState('');

  if (!ui.showRectificationModal) return null;

  const handleSubmit = () => {
    if (!selectedEvent || !requirement.trim()) return;
    createRectification({ type, requirement, deadlineDays });
    setType('explain');
    setDeadlineDays(7);
    setRequirement('');
  };

  const getDefaultRequirement = () => {
    if (!selectedEvent) return '';
    const eventDesc = `${selectedEvent.busPlate}于${selectedEvent.entryTime.toLocaleDateString()}${
      selectedEvent.riskTags.length > 0
        ? '存在' + selectedEvent.riskTags.map((t) => t.description).join('、')
        : ''
    }`;

    switch (type) {
      case 'explain':
        return `请说明${eventDesc}的原因，并提供相关佐证材料。`;
      case 'supplement_record':
        return `请补充${eventDesc}的情况说明及相关家长告知记录。`;
      case 'revalidate_site':
        return `请重新核定${selectedEvent.routeName}的站点设置，评估${selectedEvent.fenceName}附近是否需要调整。`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeRectificationModal}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            生成整改事项
          </h3>
          <button
            onClick={closeRectificationModal}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">关联信息（自动带出）</p>
            {selectedEvent ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 w-12 shrink-0">学校</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {getSchoolInfoByRoute(selectedEvent.routeId).schoolName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 w-12 shrink-0">线路</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedEvent.routeName}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">请先在风险抽查列表选择一个事件</p>
            )}
          </div>

          {selectedEvent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">关联事件</p>
              <p className="text-sm text-gray-900">
                <span className="font-medium">{selectedEvent.busPlate}</span>
                <span className="mx-2 text-gray-400">|</span>
                {selectedEvent.routeName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedEvent.fenceName} -{' '}
                {selectedEvent.riskTags.map((t) => t.description).join('，')}
              </p>
            </div>
          )}

          <div>
            <label className="label">整改类型</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(RECTIFICATION_TYPE_LABELS).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setType(value as RectificationType);
                      setRequirement('');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      type === value
                        ? 'bg-primary-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="label">整改期限</label>
            <div className="grid grid-cols-3 gap-2">
              {deadlineOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDeadlineDays(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    deadlineDays === option.value
                      ? 'bg-primary-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">整改要求</label>
              <button
                onClick={() => setRequirement(getDefaultRequirement())}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                使用模板
              </button>
            </div>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="请输入具体的整改要求..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={closeRectificationModal}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedEvent || !requirement.trim()}
            className="btn-primary"
          >
            <Send className="w-4 h-4 mr-2" />
            下发整改
          </button>
        </div>
      </div>
    </div>
  );
}
