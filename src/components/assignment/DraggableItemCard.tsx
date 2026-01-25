import {useState} from 'react';
import {useDraggable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {formatCurrency} from '../../utils/formatters';
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

interface DraggableItemCardProps {
  item: CheckItem;
  unassignedIndices: number[]; // Indices of unassigned units
}

export function DraggableItemCard({
  item,
  unassignedIndices,
}: DraggableItemCardProps) {
  const {t} = useTranslation();
  const {state, assignUnitToPerson} = useCheckSplit();

  // Use the first unassigned unit index for dragging
  const firstUnassignedIndex = unassignedIndices[0];
  const dragId = `${item.id}:unit:${firstUnassignedIndex}`;
  const unassignedCount = unassignedIndices.length;

  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: dragId,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const itemTotal = item.price * unassignedCount;

  const [selectedPerson, setSelectedPerson] = useState<string>('');

  const handleAssign = (personId: string) => {
    // Assign the first unassigned unit to the selected person
    assignUnitToPerson(item.id, firstUnassignedIndex, personId);
    // Reset the select to show placeholder again
    setSelectedPerson('');
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{scale: 1.02}}
      className={`bg-white rounded-lg shadow-md p-3 transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Drag handle area */}
        <div
          {...listeners}
          {...attributes}
          className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <Bars2Icon className="w-4 h-4 text-gray-400 shrink-0" />
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {item.name}
            </h4>
            {unassignedCount > 1 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                x{unassignedCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600 ml-6">
            <span>
              {formatCurrency(item.price)}
              {unassignedCount > 1 && ` ${t('common.each')}`}
            </span>
            {unassignedCount > 1 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(itemTotal)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Select dropdown - not part of drag area */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <Select value={selectedPerson} onValueChange={handleAssign}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue
                placeholder={t('assignment.assignTo', 'Assign to')}
              />
            </SelectTrigger>
            <SelectContent>
              {state.people.map((person) => (
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
      </div>
    </motion.div>
  );
}
