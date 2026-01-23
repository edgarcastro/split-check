import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { SplitSummary } from '../components/summary/SplitSummary';
import { Button } from '../components/shared/Button';
import { useCheckSplit } from '../context/CheckSplitContext';
import { motion } from 'motion/react';

interface SummaryViewProps {
  onBack: () => void;
  onReset: () => void;
}

export function SummaryView({ onBack, onReset }: SummaryViewProps) {
  const { t } = useTranslation();
  const { state, resetCheck } = useCheckSplit();

  const handleReset = () => {
    if (
      window.confirm(
        t('confirmations.startOver')
      )
    ) {
      resetCheck();
      onReset();
    }
  };

  const unassignedItems = state.items.filter(
    (item) => item.assignedTo.length === 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('summary.title')}
            </h2>
            <p className="text-gray-600">
              {t('summary.subtitle')}
            </p>
          </div>

          {unassignedItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="font-medium text-amber-900">
                    {unassignedItems.length} {t('summary.unassignedWarningTitle')}
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    {t('summary.unassignedWarningMessage')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <SplitSummary />

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button variant="secondary" onClick={onBack}>
              ← {t('common.back')}
            </Button>
            <Button variant="danger" onClick={handleReset}>
              {t('summary.resetButton')}
            </Button>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
