import { useState } from 'react';
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface DragInfo {
  itemId: string;
  unitIndex: number;
}

interface UseDragAndDropProps {
  onUnitMove: (
    itemId: string,
    unitIndex: number,
    targetId: string | null,
  ) => void;
}

// Parse drag ID format: "{itemId}:unit:{unitIndex}"
function parseDragId(id: string): DragInfo {
  const parts = id.split(':unit:');
  return {
    itemId: parts[0],
    unitIndex: parseInt(parts[1], 10),
  };
}

export function useDragAndDrop({ onUnitMove }: UseDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const dragId = active.id as string;
    const targetId = over.id as string;
    const { itemId, unitIndex } = parseDragId(dragId);

    // Handle drop logic
    onUnitMove(itemId, unitIndex, targetId === 'unassigned' ? null : targetId);

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
