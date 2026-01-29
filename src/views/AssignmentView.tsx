import {useRef, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Container} from '../components/layout/Container';
import {AssignmentBoard} from '../components/assignment/AssignmentBoard';
import {Button} from '@/components/ui/button';
import {useCheckSplit} from '../context/CheckSplitContext';
import {motion} from 'motion/react';

interface AssignmentViewProps {
  onNext: () => void;
  onBack: () => void;
}

export function AssignmentView({onNext, onBack}: AssignmentViewProps) {
  const {t} = useTranslation();
  const {state} = useCheckSplit();
  const nextButtonRef = useRef<HTMLDivElement>(null);

  // Check if there are any unassigned units
  const hasUnassignedUnits = state.items.some((item) =>
    item.unitAssignments.some((ua) => ua.assignedTo.length === 0),
  );

  // Scroll to next button when all items are assigned
  useEffect(() => {
    if (!hasUnassignedUnits && state.items.length > 0) {
      setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [hasUnassignedUnits, state.items.length]);

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
              {t('assignment.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('assignment.subtitle')}
            </p>
          </div>

          <AssignmentBoard />

          <div
            ref={nextButtonRef}
            className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <Button variant="outline" onClick={onBack}>
              ← {t('common.back')}
            </Button>
            <Button
              onClick={onNext}
              disabled={hasUnassignedUnits}
              className="px-8"
            >
              {t('assignment.nextButton')}
            </Button>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
