import {useState} from 'react';
import {AnimatePresence} from 'motion/react';
import {WorkflowStep} from './types';
import {Header} from './components/layout/Header';
import {Footer} from './components/layout/Footer';
import {Stepper} from './components/layout/Stepper';
import {CheckInputView} from './views/CheckInputView';
import {PeopleView} from './views/PeopleView';
import {AssignmentView} from './views/AssignmentView';
import {SummaryView} from './views/SummaryView';

function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(
    WorkflowStep.INPUT,
  );

  const renderStep = () => {
    switch (currentStep) {
      case WorkflowStep.INPUT:
        return (
          <CheckInputView
            key="input"
            onNext={() => setCurrentStep(WorkflowStep.PEOPLE)}
          />
        );
      case WorkflowStep.PEOPLE:
        return (
          <PeopleView
            key="people"
            onNext={() => setCurrentStep(WorkflowStep.ASSIGN)}
            onBack={() => setCurrentStep(WorkflowStep.INPUT)}
          />
        );
      case WorkflowStep.ASSIGN:
        return (
          <AssignmentView
            key="assign"
            onNext={() => setCurrentStep(WorkflowStep.SUMMARY)}
            onBack={() => setCurrentStep(WorkflowStep.PEOPLE)}
          />
        );
      case WorkflowStep.SUMMARY:
        return (
          <SummaryView
            key="summary"
            onBack={() => setCurrentStep(WorkflowStep.ASSIGN)}
            onReset={() => setCurrentStep(WorkflowStep.INPUT)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <Stepper currentStep={currentStep} />

      <main className="flex-1">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
