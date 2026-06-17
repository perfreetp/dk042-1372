import { Filter, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DateRangePicker } from '../ui/DateRangePicker';
import { RISK_LEVEL_LABELS, RiskLevel } from '../../types';
import { cn } from '../../utils';

interface FilterBarProps {
  showSchoolFilter?: boolean;
  showRouteFilter?: boolean;
  showRiskFilter?: boolean;
}

export function FilterBar({
  showSchoolFilter = true,
  showRouteFilter = true,
  showRiskFilter = true,
}: FilterBarProps) {
  const { filters, setFilters, schools, fenceSummaries, getFilteredSummaries } =
    useAppStore();

  const selectedSchool = schools.find((s) => s.id === filters.selectedSchoolId);
  const filteredSummaries = getFilteredSummaries();

  const availableRoutes = filters.selectedSchoolId
    ? fenceSummaries.filter((s) => s.schoolId === filters.selectedSchoolId)
    : filteredSummaries;

  const handleReset = () => {
    setFilters({
      selectedSchoolId: null,
      routeId: null,
      riskLevel: null,
    });
  };

  const hasActiveFilters =
    filters.selectedSchoolId || filters.routeId || filters.riskLevel;

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选条件</span>
        </div>

        {showSchoolFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">学校：</label>
            <select
              value={filters.selectedSchoolId || ''}
              onChange={(e) =>
                setFilters({
                  selectedSchoolId: e.target.value || null,
                  routeId: null,
                })
              }
              className="select w-48"
            >
              <option value="">全部学校</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRouteFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">线路：</label>
            <select
              value={filters.routeId || ''}
              onChange={(e) => setFilters({ routeId: e.target.value || null })}
              className="select w-48"
              disabled={!filters.selectedSchoolId && availableRoutes.length > 10}
            >
              <option value="">全部线路</option>
              {availableRoutes.map((summary) => (
                <option key={summary.routeId} value={summary.routeId}>
                  {summary.routeName}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRiskFilter && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">风险等级：</label>
            <select
              value={filters.riskLevel || ''}
              onChange={(e) =>
                setFilters({
                  riskLevel: (e.target.value as RiskLevel) || null,
                })
              }
              className="select w-36"
            >
              <option value="">全部等级</option>
              {(Object.entries(RISK_LEVEL_LABELS) as [RiskLevel, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">日期：</label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => setFilters({ dateRange })}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        )}

        {selectedSchool && (
          <div className="ml-auto">
            <span className="text-sm text-gray-500">
              当前学校：
              <span className="text-primary-600 font-medium">
                {selectedSchool.name}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
