import { useState, FormEvent } from 'react';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import {
  validatePrice,
  validateQuantity,
  validateItemName,
} from '../../utils/calculations';

export function CheckInputForm() {
  const { addItem } = useCheckSplit();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    quantity?: string;
  }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!validateItemName(name)) {
      newErrors.name = 'Item name is required (max 100 characters)';
    }

    if (!validatePrice(price)) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }

    if (!validateQuantity(quantity)) {
      newErrors.quantity = 'Please enter a valid quantity (1-99)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addItem({
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    });

    // Reset form
    setName('');
    setPrice('');
    setQuantity('1');
    setErrors({});
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Add Item Manually
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Item Name"
          type="text"
          placeholder="e.g., Burger, Pizza"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          error={errors.name}
          fullWidth
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors({ ...errors, price: undefined });
            }}
            error={errors.price}
            fullWidth
            required
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            max="99"
            placeholder="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity)
                setErrors({ ...errors, quantity: undefined });
            }}
            error={errors.quantity}
            fullWidth
            required
          />
        </div>

        <Button type="submit" variant="primary" fullWidth>
          Add Item
        </Button>
      </form>
    </Card>
  );
}
