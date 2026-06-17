import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Tags,
  Building2,
  Bus,
  ChevronRight,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { FilterBar } from '../../components/features/FilterBar';
import { StatCard } from '../../components/ui/StatCard';
import { RiskTagBadge } from '../../components/ui/RiskTagBadge';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils';

export function SchoolListPage() {
  const { schools, getFilteredSummaries, getStatistics, setFilters, filters } =
    useAppStore();

  const stats = getStatistics();
  const summaries = getFilteredSummaries();

  const handleSchoolSelect = (schoolId: string) => {
    setFilters({
      selectedSchoolId: schoolId === filters.selectedSchoolId ? null : schoolId,
      routeId: null,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="学校清单"
        subtitle="查看辖区内所有学校的校车围栏执行情况"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <FilterBar showSchoolFilter={false} />

        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            title="围栏事件总数"
            value={stats.totalFenceEvents}
            icon={Activity}
            color="blue"
            trend={{ value: 5.2, isPositive: false }}
          />
          <StatCard
            title="正常进出"
            value={stats.normalEvents}
            icon={CheckCircle}
            color="green"
            trend={{ value: 3.1, isPositive: true }}
          />
          <StatCard
            title="异常事件"
            value={stats.abnormalEvents}
            icon={AlertTriangle}
            color="yellow"
            trend={{ value: 12.5, isPositive: false }}
          />
          <StatCard
            title="风险标签"
            value={stats.riskTagCount}
            icon={Tags}
            color="red"
            trend={{ value: 8.3, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  学校列表
                </h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {schools.map((school) => {
                  const isSelected = school.id === filters.selectedSchoolId;
                  const schoolSummaries = summaries.filter(
                    (s) => s.schoolId === school.id
                  );
                  const hasRisk = school.latestRiskTags.length > 0;

                  return (
                    <button
                      key={school.id}
                      onClick={() => handleSchoolSelect(school.id)}
                      className={cn(
                        'w-full p-4 text-left transition-all hover:bg-gray-50',
                        isSelected && 'bg-primary-50 border-l-4 border-primary-500'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {school.name}
                            </h4>
                            {!isSelected && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {school.address}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Bus className="w-3.5 h-3.5" />
                              {school.busCount} 辆校车
                            </span>
                            <span className="text-xs text-gray-500">
                              {school.routeCount} 条线路
                            </span>
                          </div>
                          {hasRisk && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {school.latestRiskTags.map((tag, index) => (
                                <RiskTagBadge
                                  key={index}
                                  type={tag}
                                  className="text-[10px]"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {schoolSummaries.length > 0 && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {schoolSummaries.reduce(
                                (sum, s) => sum + s.abnormalCount,
                                0
                              )}
                            </p>
                            <p className="text-xs text-gray-500">异常</p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary-500" />
                    线路围栏数据汇总
                  </h3>
                  {filters.selectedSchoolId && (
                    <span className="text-xs text-gray-500">
                      共 {summaries.length} 条线路
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="table-header">线路名称</th>
                      <th className="table-header text-center">校车数</th>
                      <th className="table-header text-center">
                        学校围栏
                      </th>
                      <th className="table-header text-center">
                        接送点围栏
                      </th>
                      <th className="table-header text-center">
                        危险路段
                      </th>
                      <th className="table-header text-center">
                        异常次数
                      </th>
                      <th className="table-header">风险标签</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summaries.length > 0 ? (
                      summaries.map((summary) => (
                        <tr
                          key={summary.routeId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="table-cell font-medium">
                            {summary.routeName}
                          </td>
                          <td className="table-cell text-center">
                            {summary.busCount}
                          </td>
                          <td className="table-cell text-center text-success-600 font-medium">
                            {summary.schoolFenceCount}
                          </td>
                          <td className="table-cell text-center text-primary-600 font-medium">
                            {summary.pickupFenceCount}
                          </td>
                          <td className="table-cell text-center">
                            <span
                              className={cn(
                                'font-medium',
                                summary.dangerFenceCount > 0
                                  ? 'text-danger-600'
                                  : 'text-gray-400'
                              )}
                            >
                              {summary.dangerFenceCount}
                            </span>
                          </td>
                          <td className="table-cell text-center">
                            <span
                              className={cn(
                                'font-medium',
                                summary.abnormalCount > 0
                                  ? 'text-warning-600'
                                  : 'text-gray-400'
                              )}
                            >
                              {summary.abnormalCount}
                            </span>
                          </td>
                          <td className="table-cell">
                            {summary.riskTags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {summary.riskTags.map((tag, index) => (
                                  <RiskTagBadge
                                    key={index}
                                    type={tag}
                                    className="text-[10px]"
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                无异常
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>请选择学校查看线路数据</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
