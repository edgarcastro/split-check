import {useState, FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Card} from '../shared/Card';
import {validatePersonName} from '../../utils/calculations';
import {getNextPersonColor} from '../../constants';

export function AddPersonForm() {
  const {t} = useTranslation();
  const {addPerson, state} = useCheckSplit();
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
        {t('people.addPerson')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="person-name">{t('people.personName')}</Label>
          <Input
            id="person-name"
            type="text"
            placeholder={t('people.personNamePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(undefined);
            }}
            aria-invalid={!!error}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button type="submit" className="w-full">
          {t('people.addPerson')}
        </Button>
      </form>
    </Card>
  );
}
