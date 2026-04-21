import React from 'react';
import TitleComponent from '../../titleComponent/titleComponent';

const CreateHeader = () => {
    return (
        <div className="flex justify-between items-start">
            <div>
                <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                    Create New Campaign
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                    Guided template-based outreach workflow.
                </TitleComponent>
            </div>
        </div>
    );
};

export default CreateHeader;



