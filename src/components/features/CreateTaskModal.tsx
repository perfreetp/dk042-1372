import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import { RISK_TAG_LABELS } from '../../types';
import { getRiskTagColor } from '../../utils';

export function CreateTaskModal() {
  const {
    ui,
    selectedEventIds,
    riskEvents,
    closeCreateTaskModal,
    createInspectionTask,
  } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [taskName, setTaskName] = useState(`${today} 高风险事件抽查`);
  const [reason, setReason] = useState('本次抽查针对高评分风险事件进行现场核实。');
  const [assignee, setAssignee] = useState('李科员');
  const [deadlineDays, setDeadlineDays] = useState(7);

  if (!ui.showCreateTaskModal) return null;

  const selectedEvents = riskEvents.filter((e) => selectedEventIds.includes(e.id));

  const handleSubmit = () => {
    if (!taskName.trim() || !reason.trim() || selectedEventIds.length === 0) return;
    createInspectionTask({ name: taskName, reason, assignee, deadlineDays });
    setTaskName(`${today} 高风险事件抽查`);
    setReason('本次抽查针对高评分风险事件进行现场核实。');
    setAssignee('李科员');
    setDeadlineDays(7);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={closeCreateTaskModal}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            创建抽查任务
          </h3>
          <button
            onClick={closeCreateTaskModal}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">任务名称</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="input"
              placeholder="请输入任务名称"
            />
          </div>

          <div>
            <label className="label">抽查理由</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="请输入抽查理由"
            />
          </div>

          <div>
            <label className="label">抽查人</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="input"
            >
              <option value="王科长">王科长</option>
              <option value="李科员">李科员</option>
              <option value="张科员">张科员</option>
              <option value="刘科员">刘科员</option>
            </select>
          </div>

          <div>
            <label className="label">整改期限</label>
            <select
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="input"
            >
              <option value={3}>3天</option>
              <option value={7}>7天</option>
              <option value={15}>15天</option>
              <option value={30}>30天</option>
            </select>
          </div>

          <div>
            <label className="label">已选事件列表</label>
            {selectedEvents.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">请在风险抽查列表先勾选事件</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {event.busPlate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.routeName}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {event.riskTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`${getRiskTagColor(tag.type)} text-xs`}
                        >
                          {RISK_TAG_LABELS[tag.type]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={closeCreateTaskModal}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!taskName.trim() || !reason.trim() || selectedEventIds.length === 0}
            className="btn-primary"
          >
            创建任务
          </button>
        </div>
      </div>
    </div>
  );
}
