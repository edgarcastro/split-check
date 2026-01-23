import { useTranslation } from 'react-i18next';
import { WorkflowStep } from '../../types';
import { motion } from 'motion/react';

interface StepperProps {
  currentStep: WorkflowStep;
}

export function Stepper({ currentStep }: StepperProps) {
  const { t } = useTranslation();

  const steps = [
    { key: WorkflowStep.INPUT, label: t('stepper.addItems'), icon: '📝' },
    { key: WorkflowStep.PEOPLE, label: t('stepper.addPeople'), icon: '👥' },
    { key: WorkflowStep.ASSIGN, label: t('stepper.assignItems'), icon: '🎯' },
    { key: WorkflowStep.SUMMARY, label: t('stepper.summary'), icon: '💰' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted
                        ? '#10b981'
                        : isActive
                        ? '#0ea5e9'
                        : '#e5e7eb',
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                    } shadow-md`}
                  >
                    {isCompleted ? '✓' : step.icon}
                  </motion.div>

                  {/* Label */}
                  <p
                    className={`mt-2 text-xs font-medium ${
                      isActive
                        ? 'text-primary-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 mb-8 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    <motion.div
                      initial={false}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
