import { useDroppable } from '@dnd-kit/core';
import { CheckItem } from '../../types';
import { DraggableItem } from './DraggableItem';
import { EmptyState } from '../shared/EmptyState';

interface UnassignedPoolProps {
  items: CheckItem[];
}

export function UnassignedPool({ items }: UnassignedPoolProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-xl p-4 min-h-[300px] border-2 border-dashed transition-all ${
        isOver
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">📋</div>
        <h3 className="text-lg font-semibold text-gray-900">
          Unassigned Items
        </h3>
        <span className="ml-auto text-sm text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyState
            icon={<div className="text-4xl">✓</div>}
            title="All items assigned"
            description="Great! All items have been assigned to people"
          />
        ) : (
          items.map((item) => <DraggableItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
