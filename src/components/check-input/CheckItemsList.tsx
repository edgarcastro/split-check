import { useTranslation } from 'react-i18next';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { CheckItemCard } from './CheckItemCard';
import { EmptyState } from '../shared/EmptyState';
import { AnimatePresence } from 'motion/react';

export function CheckItemsList() {
  const { t } = useTranslation();
  const { state, removeItem } = useCheckSplit();

  if (state.items.length === 0) {
    return (
      <EmptyState
        icon={<div className="text-6xl">🍽️</div>}
        title={t('checkInput.noItems')}
        description={t('checkInput.noItemsDescription')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Items ({state.items.length})
      </h3>
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.items.map((item) => (
            <CheckItemCard
              key={item.id}
              item={item}
              onRemove={removeItem}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
