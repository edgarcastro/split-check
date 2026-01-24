import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PersonTotal as PersonTotalType } from '../../types';
import { Card } from '../shared/Card';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'motion/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

interface PersonTotalProps {
  personTotal: PersonTotalType;
  color: string;
}

export function PersonTotal({ personTotal, color }: PersonTotalProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: color }}
          >
            {personTotal.personName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {personTotal.personName}
            </h3>
            <p className="text-sm text-gray-600">{t('summary.totalBreakdown')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('common.subtotal')}</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(personTotal.subtotal)}
            </span>
          </div>

          {/* Collapsible item details */}
          {personTotal.items.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
                <span>
                  {isOpen ? t('summary.hideDetails') : t('summary.viewDetails')}
                </span>
                <span className="text-gray-500">
                  ({personTotal.items.length}{' '}
                  {personTotal.items.length === 1
                    ? t('common.item')
                    : t('common.items')}
                  )
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 ml-1 pl-3 border-l-2 border-gray-200 space-y-1.5">
                  {personTotal.items.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex justify-between text-xs text-gray-600"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[150px]">{item.itemName}</span>
                        {item.unitsAssigned > 1 && (
                          <span className="text-gray-400">x{item.unitsAssigned}</span>
                        )}
                        {item.isShared && (
                          <span className="text-amber-600 text-[10px] font-medium">
                            ({t('common.shared')})
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {personTotal.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('summary.tax')}</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(personTotal.tax)}
              </span>
            </div>
          )}

          {personTotal.tip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('summary.tip')}</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(personTotal.tip)}
              </span>
            </div>
          )}

          {personTotal.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('summary.serviceCharge')}</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(personTotal.serviceCharge)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">{t('common.total')}</span>
              <motion.span
                key={personTotal.total}
                initial={{ scale: 1.2, color: color }}
                animate={{ scale: 1, color: '#111827' }}
                className="font-bold text-xl text-gray-900"
              >
                {formatCurrency(personTotal.total)}
              </motion.span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
