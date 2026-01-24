import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { UnassignedPool } from './UnassignedPool';
import { PersonDropZone } from './PersonDropZone';
import { DraggableItem } from './DraggableItem';

export function AssignmentBoard() {
  const { t } = useTranslation();
  const { state, assignItemToPerson, unassignItemFromPerson } = useCheckSplit();

  const handleItemMove = (itemId: string, targetId: string | null) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    if (targetId === null) {
      // Move to unassigned - remove all assignments
      item.assignedTo.forEach((personId) => {
        unassignItemFromPerson(itemId, personId);
      });
    } else {
      // Check if already assigned to this person
      if (item.assignedTo.includes(targetId)) {
        // If already assigned, unassign (toggle behavior)
        unassignItemFromPerson(itemId, targetId);
      } else {
        // Assign to person
        assignItemToPerson(itemId, targetId);
      }
    }
  };

  const { sensors, activeId, handleDragStart, handleDragEnd, handleDragCancel } =
    useDragAndDrop({ onItemMove: handleItemMove });

  // Get unassigned items
  const unassignedItems = state.items.filter(
    (item) => item.assignedTo.length === 0
  );

  // Get active dragged item for overlay
  const activeItem = activeId
    ? state.items.find((item) => item.id === activeId)
    : null;

  // Calculate subtotals for each person
  const getPersonSubtotal = (personId: string): number => {
    const assignedItems = state.items.filter((item) =>
      item.assignedTo.includes(personId)
    );

    return assignedItems.reduce((sum, item) => {
      const splitCount = item.assignedTo.length;
      const itemTotal = item.price * item.quantity;
      return sum + itemTotal / splitCount;
    }, 0);
  };

  // Get items for a person
  const getItemsForPerson = (personId: string) => {
    return state.items.filter((item) => item.assignedTo.includes(personId));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            {t('assignment.tipMessage')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Unassigned pool */}
          <UnassignedPool items={unassignedItems} />

          {/* Person drop zones */}
          {state.people.map((person) => (
            <PersonDropZone
              key={person.id}
              person={person}
              items={getItemsForPerson(person.id)}
              subtotal={getPersonSubtotal(person.id)}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay for smoother dragging experience */}
      <DragOverlay>
        {activeItem ? <DraggableItem item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
