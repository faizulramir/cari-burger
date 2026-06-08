import { useOnboarding } from '@onboardjs/react';
import { router } from '@inertiajs/react';
import { ShopWizardContext } from '@/components/onboarding/shop-wizard-steps';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState, useCallback } from 'react';

export default function ShopWizardFlow() {
    const {
        state,
        isCompleted,
        loading,
        next,
        previous,
        renderStep,
        currentStep,
    } = useOnboarding<ShopWizardContext>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = useCallback(() => {
        if (isSubmitting) return;
        const isLast = (state?.currentStepNumber ?? 0) === (state?.totalSteps ?? 1);
        if (isLast) {
            setIsSubmitting(true);
            const fd = state?.context?.flowData || {};
            const shopName = (fd.shop_name as any)?.name || '';
            const address = (fd.shop_address as any)?.address || '';
            const lat = (fd.shop_address as any)?.lat || 3.139;
            const lng = (fd.shop_address as any)?.lng || 101.6869;
            const phone = (fd.shop_details as any)?.phone || '';
            const description = (fd.shop_details as any)?.description || '';
            const openingHours = (fd.shop_hours as any)?.opening_hours || {};

            router.post('/owner/wizard/create', {
                name: shopName,
                address,
                lat,
                lng,
                phone,
                description,
                opening_hours: openingHours,
            } as any, {
                onSuccess: () => {
                    window.location.href = '/owner';
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
            return;
        }
        next();
    }, [next, state, isSubmitting]);

    if (!state) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-white">
                <div className="text-center">
                    <Spinner className="mx-auto h-8 w-8" />
                    <p className="mt-4 text-sm text-muted-foreground">Creating your shop...</p>
                </div>
            </div>
        );
    }

    const totalSteps = state.totalSteps ?? 1;
    const currentIndex = (state.currentStepNumber ?? 1) - 1;

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-8">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Step {state.currentStepNumber} of {totalSteps}</span>
                        <span>{(currentStep?.meta as any)?.title || ''}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-200">
                        <div
                            className="h-1.5 rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1">
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between gap-3">
                    <Button
                        variant="outline"
                        onClick={() => previous()}
                        disabled={currentIndex === 0 || loading.isAnyLoading}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={loading.isAnyLoading}
                        className="gap-2"
                    >
                        {loading.isAnyLoading && <Spinner className="h-4 w-4" />}
                        {currentIndex === totalSteps - 1 ? 'Create Shop' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
