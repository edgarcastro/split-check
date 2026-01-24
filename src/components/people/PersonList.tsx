import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {PersonCard} from './PersonCard';
import {EmptyState} from '../shared/EmptyState';
import {AnimatePresence} from 'motion/react';

export function PersonList() {
  const {t} = useTranslation();
  const {state, removePerson} = useCheckSplit();

  if (state.people.length === 0) {
    return (
      <EmptyState
        icon={<div className="text-6xl">👥</div>}
        title={t('people.noPeople')}
        description={t('people.noPeopleDescription')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        People ({state.people.length})
      </h3>
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onRemove={removePerson}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
