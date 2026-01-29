import {useDraggable} from '@dnd-kit/core';
import {useTranslation} from 'react-i18next';
import {CheckItem} from '../../types';
import {formatCurrencyLocale} from '../../utils/formatters';
import {motion} from 'motion/react';
import {Bars2Icon} from '@heroicons/react/24/outline';

interface DraggableItemProps {
  item: CheckItem;
}

export function DraggableItem({item}: DraggableItemProps) {
  const {i18n} = useTranslation();
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: item.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const itemTotal = item.price * item.quantity;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{scale: 1.02}}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {item.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600 dark:text-gray-400">
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
        <Bars2Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
      </div>
    </motion.div>
  );
}
