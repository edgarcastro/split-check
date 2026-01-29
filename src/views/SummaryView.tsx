import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Container} from '../components/layout/Container';
import {SplitSummary} from '../components/summary/SplitSummary';
import {Button} from '@/components/ui/button';
import {useCheckSplit} from '../context/CheckSplitContext';
import {useCheckCalculations} from '../hooks/useCheckCalculations';
import {generateSummaryPdf} from '../utils/generateSummaryPdf';
import {motion} from 'motion/react';
import {ShareIcon, ExclamationTriangleIcon} from '@heroicons/react/24/outline';

interface SummaryViewProps {
  onBack: () => void;
}

export function SummaryView({onBack}: SummaryViewProps) {
  const {t} = useTranslation();
  const {state} = useCheckSplit();
  const summary = useCheckCalculations();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!navigator.share) return;

    setIsSharing(true);
    try {
      const pdfBlob = await generateSummaryPdf({summary, state, t});
      const file = new File([pdfBlob], 'split-check-summary.pdf', {
        type: 'application/pdf',
      });

      await navigator.share({
        title: t('summary.title'),
        files: [file],
      });
    } catch (error) {
      // User cancelled or share failed - ignore
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const canShare = typeof navigator.share === 'function';

  // Count unassigned units (items where all units have no assignments)
  const unassignedUnitCount = state.items.reduce((count, item) => {
    return (
      count +
      item.unitAssignments.filter((ua) => ua.assignedTo.length === 0).length
    );
  }, 0);

  return (
    <motion.div
      initial={{opacity: 0, x: 20}}
      animate={{opacity: 1, x: 0}}
      exit={{opacity: 0, x: -20}}
      transition={{duration: 0.3}}
    >
      <Container>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('summary.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('summary.subtitle')}
            </p>
          </div>

          {unassignedUnitCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="size-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-200">
                    {unassignedUnitCount} {t('summary.unassignedWarningTitle')}
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                    {t('summary.unassignedWarningMessage')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <SplitSummary />

          <div className="flex flex-row justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:justify-between sm:gap-2">
            <Button variant="outline" onClick={onBack} className="sm:w-auto">
              ← {t('common.back')}
            </Button>
            {canShare && (
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="sm:w-auto"
              >
                <ShareIcon className="size-4" />
                {isSharing ? t('summary.sharing') : t('summary.shareButton')}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
