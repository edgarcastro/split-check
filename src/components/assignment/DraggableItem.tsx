import { useDraggable } from '@dnd-kit/core';
import { CheckItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'motion/react';

interface DraggableItemProps {
  item: CheckItem;
}

export function DraggableItem({ item }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
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
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg shadow-md p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {item.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
            <span>
              {formatCurrency(item.price)} × {item.quantity}
            </span>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(itemTotal)}
            </span>
          </div>
        </div>
        <div className="text-gray-400 flex-shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
