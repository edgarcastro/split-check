import {useState, FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {Input} from '../shared/Input';
import {MoneyInput} from '../shared/MoneyInput';
import {Button} from '../shared/Button';
import {Card} from '../shared/Card';
import {NumberStepper} from '../shared/NumberStepper';
import {validateItemName} from '../../utils/calculations';

export function CheckInputForm() {
  const {t} = useTranslation();
  const {addItem} = useCheckSplit();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(0);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
  }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!validateItemName(name)) {
      newErrors.name = t('errors.itemNameRequired');
    }

    // Validate price is a positive number
    if (typeof price !== 'number' || price <= 0) {
      newErrors.price = t('errors.invalidPrice');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addItem({
      name: name.trim(),
      price: price as number,
      quantity: quantity,
    });

    // Reset form
    setName('');
    setPrice(0);
    setQuantity(1);
    setErrors({});
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('checkInput.addItemManually')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('checkInput.itemName')}
          type="text"
          placeholder={t('checkInput.itemNamePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({...errors, name: undefined});
          }}
          error={errors.name}
          fullWidth
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <MoneyInput
            label={t('checkInput.itemPrice')}
            value={price}
            onChange={(value) => {
              setPrice(value);
              if (errors.price) setErrors({...errors, price: undefined});
            }}
            error={errors.price}
            fullWidth
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {t('checkInput.quantity')}
            </label>
            <NumberStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth>
          {t('checkInput.addItem')}
        </Button>
      </form>
    </Card>
  );
}
