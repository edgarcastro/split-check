import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { Person, CheckItem } from '../../types';
import { DraggableItem } from './DraggableItem';
import { formatCurrency } from '../../utils/formatters';
import { EmptyState } from '../shared/EmptyState';

interface PersonDropZoneProps {
  person: Person;
  items: CheckItem[];
  subtotal: number;
}

export function PersonDropZone({
  person,
  items,
  subtotal,
}: PersonDropZoneProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: person.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl p-4 min-h-[300px] border-2 transition-all ${
        isOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
      }`}
      style={{
        borderColor: isOver ? undefined : person.color,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: person.color }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {person.name}
          </h3>
          <p className="text-sm text-gray-600">
            {t('common.subtotal')}: {formatCurrency(subtotal)}
          </p>
        </div>
        <span className="text-sm text-gray-600">
          {items.length} {items.length === 1 ? t('common.item') : t('common.items')}
        </span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyState
            icon={<div className="text-4xl">👤</div>}
            title={t('assignment.noItemsYet')}
            description={t('assignment.dragItemsHere')}
          />
        ) : (
          items.map((item) => <DraggableItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
