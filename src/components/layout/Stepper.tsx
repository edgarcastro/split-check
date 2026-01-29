import {useTranslation} from 'react-i18next';
import {WorkflowStep} from '../../types';
import {motion} from 'motion/react';
import {Progress} from '@/components/ui/progress';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  BanknotesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface StepperProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

export function Stepper({currentStep, onStepClick}: StepperProps) {
  const {t} = useTranslation();

  const steps = [
    {key: WorkflowStep.INPUT, label: t('stepper.addItems'), icon: ClipboardDocumentListIcon},
    {key: WorkflowStep.PEOPLE, label: t('stepper.addPeople'), icon: UserGroupIcon},
    {key: WorkflowStep.ASSIGN, label: t('stepper.assignItems'), icon: CursorArrowRaysIcon},
    {key: WorkflowStep.SUMMARY, label: t('stepper.summary'), icon: BanknotesIcon},
  ];

  const currentIndex = steps.findIndex((step) => step.key === currentStep);
  const progressValue = (currentIndex / (steps.length - 1)) * 100;

  const handleStepClick = (step: WorkflowStep, index: number) => {
    if (index < currentIndex && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar background */}
          <div className="relative">
            {/* Progress bar - positioned behind the circles */}
            <div className="absolute top-6 left-0 right-0 px-6 -translate-y-1/2">
              <Progress
                value={progressValue}
                className="h-1 bg-gray-200 *:data-[slot=progress-indicator]:bg-green-500"
              />
            </div>

            {/* Steps */}
            <div className="relative flex items-start justify-between">
              {steps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                const isClickable = isCompleted && onStepClick;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    {/* Circle */}
                    <motion.button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleStepClick(step.key, index)}
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? '#10b981'
                          : isActive
                            ? '#0ea5e9'
                            : '#e5e7eb',
                      }}
                      whileHover={isClickable ? {scale: 1.15} : undefined}
                      whileTap={isClickable ? {scale: 0.95} : undefined}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        isCompleted || isActive ? 'text-white' : 'text-gray-400'
                      } shadow-md ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {isCompleted ? <CheckIcon className="size-6" /> : <step.icon className="size-6" />}
                    </motion.button>

                    {/* Label */}
                    <p
                      className={`mt-2 text-xs font-medium text-center ${
                        isActive
                          ? 'text-primary-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-400'
                      } ${isClickable ? 'cursor-pointer hover:underline' : ''}`}
                      onClick={() => handleStepClick(step.key, index)}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
