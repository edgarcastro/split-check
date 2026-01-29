import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {Card} from '../shared/Card';
import {formatCurrencyLocale} from '../../utils/formatters';
import {motion} from 'motion/react';
import {TrashIcon} from '@heroicons/react/24/outline';

interface CheckItemCardProps {
  item: CheckItem;
  onRemove: (id: string) => void;
}

export function CheckItemCard({item, onRemove}: CheckItemCardProps) {
  const {t, i18n} = useTranslation();
  const itemTotal = item.price * item.quantity;

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.9}}
      animate={{opacity: 1, scale: 1}}
      exit={{opacity: 0, scale: 0.9}}
      layout
    >
      <Card padding="small" hover={false}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate dark:text-white">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span>
                {formatCurrencyLocale(item.price, i18n.language)} ×{' '}
                {item.quantity}
              </span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrencyLocale(itemTotal, i18n.language)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors shrink-0"
            aria-label={t('checkInput.removeItem')}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
