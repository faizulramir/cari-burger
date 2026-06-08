import { OnboardingProvider } from '@onboardjs/react';
import { wizardSteps, ShopWizardContext } from '@/components/onboarding/shop-wizard-steps';
import ShopWizardFlow from './wizard-flow';

export default function ShopWizard() {
    return (
        <OnboardingProvider<ShopWizardContext>
            steps={wizardSteps}
        >
            <ShopWizardFlow />
        </OnboardingProvider>
    );
}
