import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { UnassignedPool } from './UnassignedPool';
import { PersonDropZone } from './PersonDropZone';
import { DraggableUnit } from './DraggableUnit';

export function AssignmentBoard() {
  const { t } = useTranslation();
  const { state, assignUnitToPerson, unassignUnitFromPerson } = useCheckSplit();

  const handleUnitMove = (
    itemId: string,
    unitIndex: number,
    targetId: string | null,
  ) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    const unitAssignment = item.unitAssignments[unitIndex];
    if (!unitAssignment) return;

    if (targetId === null) {
      // Move to unassigned - remove all assignments for this unit
      unitAssignment.assignedTo.forEach((personId) => {
        unassignUnitFromPerson(itemId, unitIndex, personId);
      });
    } else {
      // Check if already assigned to this person
      if (unitAssignment.assignedTo.includes(targetId)) {
        // If already assigned, unassign (toggle behavior)
        unassignUnitFromPerson(itemId, unitIndex, targetId);
      } else {
        // Assign to person
        assignUnitToPerson(itemId, unitIndex, targetId);
      }
    }
  };

  const { sensors, activeId, handleDragStart, handleDragEnd, handleDragCancel } =
    useDragAndDrop({ onUnitMove: handleUnitMove });

  // Parse active drag ID to get item and unit info
  const getActiveUnit = () => {
    if (!activeId) return null;
    const parts = activeId.split(':unit:');
    if (parts.length !== 2) return null;
    const item = state.items.find((i) => i.id === parts[0]);
    if (!item) return null;
    const unitIndex = parseInt(parts[1], 10);
    const unitAssignment = item.unitAssignments[unitIndex];
    return {
      item,
      unitIndex,
      isShared: unitAssignment?.assignedTo.length > 1,
    };
  };

  const activeUnit = getActiveUnit();

  // Calculate subtotals for each person (based on unit assignments)
  const getPersonSubtotal = (personId: string): number => {
    let subtotal = 0;
    state.items.forEach((item) => {
      item.unitAssignments.forEach((ua) => {
        if (ua.assignedTo.includes(personId)) {
          const splitCount = ua.assignedTo.length;
          subtotal += item.price / splitCount;
        }
      });
    });
    return subtotal;
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
          <p className="text-sm text-blue-800">{t('assignment.tipMessage')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Unassigned pool - pass all items */}
          <UnassignedPool items={state.items} />

          {/* Person drop zones - pass all items */}
          {state.people.map((person) => (
            <PersonDropZone
              key={person.id}
              person={person}
              items={state.items}
              subtotal={getPersonSubtotal(person.id)}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay for smoother dragging experience */}
      <DragOverlay>
        {activeUnit ? (
          <DraggableUnit
            item={activeUnit.item}
            unitIndex={activeUnit.unitIndex}
            isShared={activeUnit.isShared}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
