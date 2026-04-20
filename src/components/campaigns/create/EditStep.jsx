import React from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import RichTextEditor from '../../ui/RichTextEditor';
import TemplateStylePicker from '../../ui/TemplateStylePicker';

const EditStep = ({ 
    formData, 
    onUpdate, 
    onApplyStyle, 
    onPreview, 
    submitting 
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Template style + accent color picker */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <TemplateStylePicker
                    selectedStyle={formData.templateStyle}
                    onStyleChange={style => onUpdate({ templateStyle: style })}
                    accentColor={formData.accentColor}
                    onAccentColorChange={color => onUpdate({ accentColor: color })}
                />
                {/* Apply Style button */}
                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                    <Button
                        variant="primary"
                        className="h-10 px-6 bg-primary font-bold text-sm"
                        onClick={onApplyStyle}
                        disabled={submitting}
                    >
                        {submitting
                            ? <><i className="fas fa-spinner fa-spin mr-2" />Applying...</>
                            : <><i className="fas fa-paint-brush mr-2" />Apply Style</>}
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 px-6 text-sm font-bold border-slate-200"
                        onClick={onPreview}
                    >
                        <i className="fas fa-eye mr-2" />Preview Email
                    </Button>
                </div>
            </div>

            {/* Subject line */}
            <Input
                id="edit-subject-input"
                label="Subject Line"
                value={formData.subject}
                onChange={e => onUpdate({ subject: e.target.value })}
                required
                className="bg-slate-50 border-slate-100 font-bold"
            />

            {/* Rich text editor for manual edits */}
            <RichTextEditor
                label="Email Body"
                value={formData.emailContent}
                onChange={content => onUpdate({ emailContent: content })}
            />
        </div>
    );
};

export default EditStep;
