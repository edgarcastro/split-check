import {useRef, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Container} from '../components/layout/Container';
import {CheckInputForm} from '../components/check-input/CheckInputForm';
import {ImageUpload} from '../components/check-input/ImageUpload';
import {CheckItemsList} from '../components/check-input/CheckItemsList';
import {Button} from '@/components/ui/button';
import {useCheckSplit} from '../context/CheckSplitContext';
import {motion} from 'motion/react';

interface CheckInputViewProps {
  onNext: () => void;
}

export function CheckInputView({onNext}: CheckInputViewProps) {
  const {t} = useTranslation();
  const {state} = useCheckSplit();
  const hasItems = state.items.length > 0;
  const itemsListRef = useRef<HTMLDivElement>(null);

  const scrollToItems = useCallback(() => {
    // Small delay to allow the items list to render
    setTimeout(() => {
      itemsListRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, []);

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
              {t('checkInput.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{t('checkInput.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload onProcessComplete={scrollToItems} />
            <CheckInputForm />
          </div>

          {hasItems && (
            <div ref={itemsListRef}>
              <CheckItemsList />

              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={onNext} className="px-8">
                  {t('checkInput.nextButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </motion.div>
  );
}
