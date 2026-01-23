import { useState, FormEvent } from 'react';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { validatePersonName } from '../../utils/calculations';
import { getNextPersonColor } from '../../constants';

export function AddPersonForm() {
  const { addPerson, state } = useCheckSplit();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const existingNames = state.people.map((p) => p.name);
    const validation = validatePersonName(name, existingNames);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const color = getNextPersonColor(state.people);
    addPerson({
      name: name.trim(),
      color,
    });

    setName('');
    setError(undefined);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Person</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Person Name"
          type="text"
          placeholder="e.g., John, Sarah"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          fullWidth
          required
        />

        <Button type="submit" variant="primary" fullWidth>
          Add Person
        </Button>
      </form>
    </Card>
  );
}
