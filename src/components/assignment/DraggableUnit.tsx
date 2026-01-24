import {useDraggable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {formatCurrency} from '../../utils/formatters';
import {motion} from 'motion/react';
import {Bars2Icon} from '@heroicons/react/24/outline';

interface DraggableUnitProps {
  item: CheckItem;
  unitIndex: number;
  isShared?: boolean; // True if this unit is split among multiple people
}

export function DraggableUnit({item, unitIndex, isShared}: DraggableUnitProps) {
  const {t} = useTranslation();
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{scale: 1.02}}
      className={`bg-white rounded-lg shadow-md p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${isShared ? 'ring-2 ring-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {item.name}
            {showUnitIndex && (
              <span className="text-gray-500 font-normal ml-1">
                ({unitIndex + 1}/{item.quantity})
              </span>
            )}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
            <span className="font-medium text-gray-900">
              {formatCurrency(item.price)}
            </span>
            {isShared && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-amber-600 font-medium">
                  {t('common.shared')}
                </span>
              </>
            )}
          </div>
        </div>
        <Bars2Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
