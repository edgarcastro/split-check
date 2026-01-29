import {MinusIcon, PlusIcon} from '@heroicons/react/24/outline';
import {Button} from '@/components/ui/button';

interface NumberStepperProps {
  label?: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberStepper({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
}: NumberStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(Number(newValue.toFixed(2)));
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(Number(newValue.toFixed(2)));
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex items-center justify-between">
      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-base font-medium text-gray-900 dark:text-white">{label}</span>
          )}
          {sublabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{sublabel}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className="rounded-full"
          aria-label="Decrease"
        >
          <MinusIcon className="size-5" />
        </Button>

        <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[3rem] text-center tabular-nums">
          {value}
          {suffix}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className="rounded-full"
          aria-label="Increase"
        >
          <PlusIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
