import { Person } from '../../types';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { motion } from 'motion/react';
import { TrashIcon } from '@heroicons/react/24/outline';

interface PersonCardProps {
  person: Person;
  onRemove: (id: string) => void;
}

export function PersonCard({ person, onRemove }: PersonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card padding="small" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: person.color }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {person.name}
              </h4>
              <Badge color={person.color} className="mt-1">
                {person.color}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => onRemove(person.id)}
            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
            aria-label="Remove person"
          >
<TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
