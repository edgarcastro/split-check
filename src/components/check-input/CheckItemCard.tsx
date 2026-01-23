import { CheckItem } from "../../types";
import { Card } from "../shared/Card";
import { formatCurrency } from "../../utils/formatters";
import { motion } from "motion/react";

interface CheckItemCardProps {
  item: CheckItem;
  onRemove: (id: string) => void;
}

export function CheckItemCard({ item, onRemove }: CheckItemCardProps) {
  const itemTotal = item.price * item.quantity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card padding="small" hover={false}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span>
                {formatCurrency(item.price)} × {item.quantity}
              </span>
              <span className="text-gray-400">•</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(itemTotal)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
            aria-label="Remove item"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
