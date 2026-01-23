import { SplitSummary } from '../../types';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { formatCurrency } from '../../utils/formatters';
import { useCheckSplit } from '../../context/CheckSplitContext';
import { motion } from 'motion/react';

interface TotalBreakdownProps {
  summary: SplitSummary;
}

export function TotalBreakdown({ summary }: TotalBreakdownProps) {
  const { state, setTaxRate, setTipRate, setServiceCharges } = useCheckSplit();

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Breakdown</h3>

      <div className="space-y-6">
        {/* Adjustable rates */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <Input
            label="Tax Rate (%)"
            type="number"
            step="0.1"
            min="0"
            max="30"
            value={state.taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            fullWidth
          />

          <Input
            label="Tip Rate (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={state.tipRate}
            onChange={(e) => setTipRate(parseFloat(e.target.value) || 0)}
            fullWidth
          />

          <Input
            label="Service Charges ($)"
            type="number"
            step="0.01"
            min="0"
            value={state.serviceCharges}
            onChange={(e) => setServiceCharges(parseFloat(e.target.value) || 0)}
            fullWidth
          />
        </div>

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(summary.totalBeforeTaxAndTip)}
            </span>
          </div>

          {summary.totalTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Total Tax ({state.taxRate}%)
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.totalTax)}
              </span>
            </div>
          )}

          {summary.totalTip > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Total Tip ({state.tipRate}%)
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.totalTip)}
              </span>
            </div>
          )}

          {summary.totalServiceCharges > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charges</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.totalServiceCharges)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">
                Grand Total
              </span>
              <motion.span
                key={summary.grandTotal}
                initial={{ scale: 1.2, color: '#0ea5e9' }}
                animate={{ scale: 1, color: '#111827' }}
                className="font-bold text-2xl text-gray-900"
              >
                {formatCurrency(summary.grandTotal)}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
