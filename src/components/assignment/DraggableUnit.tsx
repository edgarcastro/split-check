import {useState} from 'react';
import {useDraggable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {formatCurrencyLocale} from '../../utils/formatters';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {motion} from 'motion/react';
import {Bars2Icon} from '@heroicons/react/24/outline';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface DraggableUnitProps {
  item: CheckItem;
  unitIndex: number;
  isShared?: boolean; // True if this unit is split among multiple people
}

export function DraggableUnit({item, unitIndex, isShared}: DraggableUnitProps) {
  const {t, i18n} = useTranslation();
  const {state, assignUnitToPerson} = useCheckSplit();
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const dragId = `${item.id}:unit:${unitIndex}`;

  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: dragId,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const showUnitIndex = item.quantity > 1;

  // Get people who are not yet assigned to this unit (available for sharing)
  const assignedToThisUnit = item.unitAssignments[unitIndex]?.assignedTo ?? [];
  const availablePeople = state.people.filter(
    (person) => !assignedToThisUnit.includes(person.id),
  );

  const handleShareWith = (personId: string) => {
    assignUnitToPerson(item.id, unitIndex, personId);
    setSelectedPerson('');
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{scale: 1.02}}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${isShared ? 'ring-2 ring-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Drag handle area */}
        <div
          {...listeners}
          {...attributes}
          className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <Bars2Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {item.name}
              {showUnitIndex && (
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                  ({unitIndex + 1}/{item.quantity})
                </span>
              )}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600 dark:text-gray-400 ml-6">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrencyLocale(item.price, i18n.language)}
            </span>
            {isShared && (
              <>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {t('common.shared')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Select dropdown - not part of drag area */}
        {availablePeople.length > 0 && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Select value={selectedPerson} onValueChange={handleShareWith}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue
                  placeholder={t('assignment.shareWith', 'Share with')}
                />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{backgroundColor: person.color}}
                      />
                      <span className="truncate">{person.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </motion.div>
  );
}
