import {useTranslation} from 'react-i18next';
import {Container} from '../components/layout/Container';
import {PeopleManager} from '../components/people/PeopleManager';
import {Button} from '@/components/ui/button';
import {useCheckSplit} from '../context/CheckSplitContext';
import {motion} from 'motion/react';

interface PeopleViewProps {
  onNext: () => void;
  onBack: () => void;
}

export function PeopleView({onNext, onBack}: PeopleViewProps) {
  const {t} = useTranslation();
  const {state} = useCheckSplit();
  const hasPeople = state.people.length >= 2;

  return (
    <motion.div
      initial={{opacity: 0, x: 20}}
      animate={{opacity: 1, x: 0}}
      exit={{opacity: 0, x: -20}}
      transition={{duration: 0.3}}
    >
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('people.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('people.subtitle')}
            </p>
          </div>

          <PeopleManager />

          {!hasPeople && state.people.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {t('people.minPeopleWarning')}
              </p>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onBack}>
              ← {t('common.back')}
            </Button>
            <Button onClick={onNext} disabled={!hasPeople} className="px-8">
              {t('people.nextButton')}
            </Button>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
