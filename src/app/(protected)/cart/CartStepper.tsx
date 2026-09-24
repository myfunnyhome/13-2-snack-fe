import { cn } from '@/utils/cn';

export type CartStep = 'cart' | 'order' | 'complete';
export type CartFlow = 'request' | 'instant';

type CartStepperProps = {
  currentStep: CartStep;
  flow?: CartFlow;
  className?: string;
};

const REQUEST_STEPS: readonly { id: CartStep; label: string }[] = [
  { id: 'cart', label: '1. Shopping Cart' },
  { id: 'order', label: '2. Order' },
  { id: 'complete', label: '3. Order Confirmed' },
];

const INSTANT_STEPS: readonly { id: CartStep; label: string }[] = [
  { id: 'cart', label: '1. Shopping Cart' },
  { id: 'complete', label: '2. Order Confirmed' },
];

export default function CartStepper({
  currentStep,
  flow = 'request',
  className,
}: CartStepperProps) {
  const steps = flow === 'instant' ? INSTANT_STEPS : REQUEST_STEPS;

  return (
    <ol
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-6 gap-y-2',
        className,
      )}
    >
      {steps.map((step) => {
        const isCurrent = step.id === currentStep;

        return (
          <li
            key={step.id}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              isCurrent
                ? 'text-16-bold text-primary-950'
                : 'text-16-regular text-primary-400',
            )}
          >
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
