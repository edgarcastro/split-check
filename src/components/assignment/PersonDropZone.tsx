import {useDroppable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {Person, CheckItem} from '../../types';
import {DraggableUnit} from './DraggableUnit';
import {formatCurrencyLocale} from '../../utils/formatters';
import {EmptyState} from '../shared/EmptyState';

interface PersonDropZoneProps {
  person: Person;
  items: CheckItem[]; // All items (to find units assigned to this person)
  subtotal: number;
}

interface AssignedUnit {
  item: CheckItem;
  unitIndex: number;
  isShared: boolean;
}

export function PersonDropZone({person, items, subtotal}: PersonDropZoneProps) {
  const {t, i18n} = useTranslation();
  const {setNodeRef, isOver} = useDroppable({
    id: person.id,
  });

  // Get all units assigned to this person
  const assignedUnits: AssignedUnit[] = [];
  items.forEach((item) => {
    item.unitAssignments.forEach((ua, unitIndex) => {
      if (ua.assignedTo.includes(person.id)) {
        assignedUnits.push({
          item,
          unitIndex,
          isShared: ua.assignedTo.length > 1,
        });
      }
    });
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
          style={{backgroundColor: person.color}}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-600">
            {t('common.subtotal')}: {formatCurrencyLocale(subtotal, i18n.language)}
          </p>
        </div>
        <span className="text-sm text-gray-600">
          {assignedUnits.length}{' '}
          {assignedUnits.length === 1 ? t('common.item') : t('common.items')}
        </span>
      </div>

      <div className="space-y-2">
        {assignedUnits.length === 0 ? (
          <EmptyState
            icon={<div className="text-4xl">👤</div>}
            title={t('assignment.noItemsYet')}
            description={t('assignment.dragItemsHere')}
          />
        ) : (
          assignedUnits.map(({item, unitIndex, isShared}) => (
            <DraggableUnit
              key={`${item.id}:unit:${unitIndex}`}
              item={item}
              unitIndex={unitIndex}
              isShared={isShared}
            />
          ))
        )}
      </div>
    </div>
  );
}
