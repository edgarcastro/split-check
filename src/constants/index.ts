import { Person } from '../types';

export const PERSON_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * Get the next available color for a new person
 */
export function getNextPersonColor(existingPeople: Person[]): string {
  const usedColors = new Set(existingPeople.map((p) => p.color));
  const availableColor = PERSON_COLORS.find((c) => !usedColors.has(c));
  return (
    availableColor ||
    PERSON_COLORS[existingPeople.length % PERSON_COLORS.length]
  );
}
