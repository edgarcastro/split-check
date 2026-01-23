import { useCheckSplit } from '../../context/CheckSplitContext';
import { useCheckCalculations } from '../../hooks/useCheckCalculations';
import { PersonTotal } from './PersonTotal';
import { TotalBreakdown } from './TotalBreakdown';
import { EmptyState } from '../shared/EmptyState';

export function SplitSummary() {
  const { state } = useCheckSplit();
  const summary = useCheckCalculations();

  if (state.people.length === 0) {
    return (
      <EmptyState
        icon={<div className="text-6xl">💰</div>}
        title="No people to split the check"
        description="Please add people in the previous step to see the split"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Person totals */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Individual Totals</h2>
          <div className="space-y-4">
            {summary.personTotals.map((personTotal) => {
              const person = state.people.find(
                (p) => p.id === personTotal.personId
              );
              return (
                <PersonTotal
                  key={personTotal.personId}
                  personTotal={personTotal}
                  color={person?.color || '#6b7280'}
                />
              );
            })}
          </div>
        </div>

        {/* Overall breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Details
          </h2>
          <TotalBreakdown summary={summary} />
        </div>
      </div>
    </div>
  );
}
