import { useState } from 'react';
import { X, Copy, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';

export function LedgerModal() {
  const { ui, closeLedgerModal, getLedgerData } = useAppStore();
  const [showToast, setShowToast] = useState(false);

  if (!ui.showLedgerModal) return null;

  const ledgerData = getLedgerData();

  const handleCopyAll = async () => {
    const { dateRange, schoolSummaries, riskEvents, rectifications } = ledgerData;

    const dateRangeText = `日期范围：${format(dateRange.start, 'yyyy-MM-dd')} 至 ${format(dateRange.end, 'yyyy-MM-dd')}\n\n`;

    const sectionATitle = '一、学校围栏汇总表\n';
    const sectionAHeaders = ['学校名称', '线路数', '校车数', '学校围栏进出', '接送点围栏进出', '危险路段进入', '异常次数', '风险标签'];
    const sectionARows = schoolSummaries.map((s) => [
      s.schoolName,
      String(s.routeCount),
      String(s.busCount),
      String(s.schoolFenceTotal),
      String(s.pickupFenceTotal),
      String(s.dangerFenceTotal),
      String(s.abnormalTotal),
      s.riskTags.join('、') || '-',
    ]);
    const sectionAText = buildTextTable(sectionAHeaders, sectionARows);

    const sectionBTitle = '\n二、风险事件明细表\n';
    const sectionBHeaders = ['序号', '学校', '线路', '车牌号', '围栏名称', '发生时间', '风险标签', '风险评分', '整改状态'];
    const sectionBRows = riskEvents.map((e) => [
      String(e.no),
      e.schoolName,
      e.routeName,
      e.busPlate,
      e.fenceName,
      e.eventTime,
      e.riskTags.join('、') || '-',
      String(e.riskScore),
      e.rectificationStatus,
    ]);
    const sectionBText = buildTextTable(sectionBHeaders, sectionBRows);

    const sectionCTitle = '\n三、整改跟踪进度表\n';
    const sectionCHeaders = ['序号', '学校', '线路', '整改类型', '整改要求', '下发日期', '截止日期', '状态', '时间提示'];
    const sectionCRows = rectifications.map((r) => [
      String(r.no),
      r.schoolName,
      r.routeName,
      r.type,
      r.requirement,
      r.createdAt,
      r.deadline,
      r.status,
      r.daysLeft,
    ]);
    const sectionCText = buildTextTable(sectionCHeaders, sectionCRows);

    const fullText = dateRangeText + sectionATitle + sectionAText + sectionBTitle + sectionBText + sectionCTitle + sectionCText;

    await navigator.clipboard.writeText(fullText);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const buildTextTable = (headers: string[], rows: string[][]): string => {
    const allRows = [headers, ...rows];
    const colWidths = headers.map((_, colIdx) =>
      Math.max(...allRows.map((row) => getDisplayWidth(row[colIdx] || '')))
    );

    const padRow = (row: string[]) =>
      row.map((cell, colIdx) => padDisplayWidth(cell || '', colWidths[colIdx])).join(' | ');

    const separator = colWidths.map((w) => '-'.repeat(w)).join('-+-');

    return [padRow(headers), separator, ...rows.map(padRow)].join('\n') + '\n';
  };

  const getDisplayWidth = (str: string): number => {
    let width = 0;
    for (const char of str) {
      width += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    }
    return width;
  };

  const padDisplayWidth = (str: string, width: number): string => {
    const currentWidth = getDisplayWidth(str);
    const padding = Math.max(0, width - currentWidth);
    return str + ' '.repeat(padding);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeLedgerModal}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-primary-700" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">监管台账预览</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                筛选日期：{format(ledgerData.dateRange.start, 'yyyy-MM-dd')} 至 {format(ledgerData.dateRange.end, 'yyyy-MM-dd')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="btn-secondary"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制全部
            </button>
            <button
              onClick={closeLedgerModal}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">一、学校围栏汇总表</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">学校名称</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">线路数</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">校车数</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">学校围栏进出</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">接送点围栏进出</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">危险路段进入</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">异常次数</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">风险标签</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.schoolSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    ledgerData.schoolSummaries.map((school, idx) => (
                      <tr key={school.schoolId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.schoolName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.routeCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.busCount}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.schoolFenceTotal}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.pickupFenceTotal}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{school.dangerFenceTotal}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <span className={school.abnormalTotal > 0 ? 'text-danger-600 font-medium' : ''}>
                            {school.abnormalTotal}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {school.riskTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {school.riskTags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="badge badge-danger">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">二、风险事件明细表</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">序号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">学校</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">线路</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">车牌号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">围栏名称</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">发生时间</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">风险标签</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">风险评分</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">整改状态</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.riskEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    ledgerData.riskEvents.map((event) => (
                      <tr key={event.no} className={event.no % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{event.no}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{event.schoolName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{event.routeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 font-mono">{event.busPlate}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{event.fenceName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{event.eventTime}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          {event.riskTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {event.riskTags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="badge badge-warning">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <span className={event.riskScore >= 60 ? 'text-danger-600 font-semibold' : event.riskScore >= 40 ? 'text-warning-600 font-medium' : ''}>
                            {event.riskScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <span className={
                            event.rectificationStatus === '已完成' ? 'badge badge-success' :
                            event.rectificationStatus === '未整改' || event.rectificationStatus === '已超期' ? 'badge badge-danger' :
                            event.rectificationStatus === '已回复' ? 'badge badge-primary' :
                            'badge badge-warning'
                          }>
                            {event.rectificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">三、整改跟踪进度表</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">序号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">学校</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">线路</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">整改类型</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">整改要求</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">下发日期</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">截止日期</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">时间提示</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.rectifications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    ledgerData.rectifications.map((rect) => (
                      <tr key={rect.no} className={rect.no % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.no}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.schoolName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.routeName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200 max-w-xs">
                          <div className="line-clamp-2" title={rect.requirement}>
                            {rect.requirement}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.createdAt}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">{rect.deadline}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                          <span className={
                            rect.status === '已完成' ? 'badge badge-success' :
                            rect.status === '已超期' || rect.status === '需重提' ? 'badge badge-danger' :
                            rect.status === '已回复' ? 'badge badge-primary' :
                            'badge badge-warning'
                          }>
                            {rect.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border-b border-gray-200">
                          <span className={
                            rect.daysLeft.includes('超期') ? 'text-danger-600 font-semibold' :
                            rect.daysLeft.includes('今日到期') || rect.daysLeft.includes('剩余') && parseInt(rect.daysLeft.replace(/\D/g, '')) <= 2 ? 'text-warning-600 font-medium' :
                            rect.daysLeft === '已完成' ? 'text-success-600' :
                            'text-gray-600'
                          }>
                            {rect.daysLeft}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg text-sm animate-fade-in">
          已复制到剪贴板
        </div>
      )}
    </div>
  );
}
