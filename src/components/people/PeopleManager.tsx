import { AddPersonForm } from './AddPersonForm';
import { PersonList } from './PersonList';

export function PeopleManager() {
  return (
    <div className="space-y-6">
      <AddPersonForm />
      <PersonList />
    </div>
  );
}
