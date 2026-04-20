import React from 'react';
import Button from '../../ui/Button';

const CreateNavigation = ({ 
    currentStep, 
    loading, 
    handlePrevious, 
    handleNext, 
    handleSaveDraft, 
    handleLaunchCampaign 
}) => {
    return (
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-10">
            <Button 
                variant="outline" 
                className="px-10 h-14 font-bold border-slate-200" 
                onClick={handlePrevious} 
                disabled={currentStep === 1 || loading.submitting || loading.launching}
            >
                Go Back
            </Button>
            <div className="flex gap-4">
                {currentStep < 7 ? (
                    <Button 
                        variant="primary" 
                        className="px-16 h-14 font-bold" 
                        onClick={handleNext}
                        disabled={loading.submitting}
                    >
                        Next Step
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            className="px-8 h-14 border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50"
                            onClick={handleSaveDraft}
                            disabled={loading.submitting || loading.launching}
                        >
                            {loading.submitting ? 'Saving...' : 'Save as Draft'}
                        </Button>
                        <Button
                            variant="primary"
                            className={`px-12 h-14 font-bold border-none transition-all ${
                                loading.launching ? 'bg-primary/60' : ''
                            }`}
                            onClick={handleLaunchCampaign}
                            disabled={loading.launching || loading.submitting}
                        >
                            {loading.launching ? (
                                <><i className="fas fa-spinner fa-spin mr-2" /> Sending...</>
                            ) : (
                                <><i className="fas fa-paper-plane mr-2" /> Launch Campaign</>
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateNavigation;
