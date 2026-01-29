import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {Button} from '../shared/Button';
import {ThemeToggle} from '../shared/ThemeToggle';
import {ArrowPathIcon, ReceiptPercentIcon} from '@heroicons/react/24/outline';

interface HeaderProps {
  onReset: () => void;
}

export function Header({onReset}: HeaderProps) {
  const {t} = useTranslation();
  const {resetCheck, state} = useCheckSplit();

  const handleReset = () => {
    if (state.items.length > 0 || state.people.length > 0) {
      if (window.confirm(t('confirmations.startOver'))) {
        onReset();
        resetCheck();
      }
    }
  };

  return (
    <header className="glass-subtle sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReceiptPercentIcon className="size-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('common.appName')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {(state.items.length > 0 || state.people.length > 0) && (
            <Button variant="secondary" onClick={handleReset}>
              <ArrowPathIcon className="size-4" />
              {t('common.startOver')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
