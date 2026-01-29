import {useTranslation} from 'react-i18next';
import {SplitSummary} from '../../types';
import {Card} from '../shared/Card';
import {MoneyInput} from '../shared/MoneyInput';
import {NumberStepper} from '../shared/NumberStepper';
import {formatCurrencyLocale} from '../../utils/formatters';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {useTheme} from '../../context/ThemeContext';
import {motion} from 'motion/react';

interface TotalBreakdownProps {
  summary: SplitSummary;
}

export function TotalBreakdown({summary}: TotalBreakdownProps) {
  const {t, i18n} = useTranslation();
  const {state, setTaxRate, setTipRate, setServiceCharges} = useCheckSplit();
  const {resolvedTheme} = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {t('summary.overallBreakdown')}
      </h3>

      <div className="space-y-6">
        {/* Adjustable rates */}
        <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <NumberStepper
            label={t('summary.tax')}
            value={state.taxRate}
            onChange={setTaxRate}
            min={0}
            max={30}
            step={0.5}
            suffix="%"
          />

          <NumberStepper
            label={t('summary.tip')}
            value={state.tipRate}
            onChange={setTipRate}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />

          <MoneyInput
            label={t('summary.serviceCharges')}
            value={state.serviceCharges === 0 ? '' : state.serviceCharges}
            onChange={(value) => setServiceCharges(value)}
            fullWidth
          />
        </div>

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('common.subtotal')}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrencyLocale(
                summary.totalBeforeTaxAndTip,
                i18n.language,
              )}
            </span>
          </div>

          {summary.totalTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('summary.totalTax', {rate: state.taxRate})}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrencyLocale(summary.totalTax, i18n.language)}
              </span>
            </div>
          )}

          {summary.totalTip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('summary.totalTip', {rate: state.tipRate})}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrencyLocale(summary.totalTip, i18n.language)}
              </span>
            </div>
          )}

          {summary.totalServiceCharges > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('summary.serviceCharge')}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrencyLocale(
                  summary.totalServiceCharges,
                  i18n.language,
                )}
              </span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {t('summary.grandTotal')}
              </span>
              <motion.span
                key={summary.grandTotal}
                initial={{scale: 1.2, color: '#8b5cf6'}}
                animate={{scale: 1, color: isDark ? '#ffffff' : '#111827'}}
                className="font-bold text-2xl text-gray-900 dark:text-white"
              >
                {formatCurrencyLocale(summary.grandTotal, i18n.language)}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
