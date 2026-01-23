import { useMemo } from 'react';
import { useCheckSplit } from '../context/CheckSplitContext';

export function useCheckCalculations() {
  const { state, getSplitSummary } = useCheckSplit();

  const splitSummary = useMemo(() => {
    return getSplitSummary();
  }, [
    state.items,
    state.people,
    state.taxRate,
    state.tipRate,
    state.serviceCharges,
    getSplitSummary,
  ]);

  return splitSummary;
}
