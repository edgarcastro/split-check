import {useMemo} from 'react';
import {useCheckSplit} from '../context/CheckSplitContext';

export function useCheckCalculations() {
  const {getSplitSummary} = useCheckSplit();

  const splitSummary = useMemo(() => {
    return getSplitSummary();
  }, [getSplitSummary]);

  return splitSummary;
}
