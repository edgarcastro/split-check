import {useDraggable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {formatCurrencyLocale} from '../../utils/formatters';
import {motion} from 'motion/react';
import {Bars2Icon} from '@heroicons/react/24/outline';

interface DraggableUnitProps {
  item: CheckItem;
  unitIndex: number;
  isShared?: boolean; // True if this unit is split among multiple people
}

export function DraggableUnit({item, unitIndex, isShared}: DraggableUnitProps) {
  const {t, i18n} = useTranslation();
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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${isShared ? 'ring-2 ring-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {item.name}
            {showUnitIndex && (
              <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                ({unitIndex + 1}/{item.quantity})
              </span>
            )}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600 dark:text-gray-400">
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
        <Bars2Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
      </div>
    </motion.div>
  );
}
