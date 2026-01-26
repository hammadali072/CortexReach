import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CampaignCreate = () => {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)

    // Form state - will be managed by form library in actual implementation
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        emailContent: '',
        selectedLeads: []
    })

    const steps = [
        { number: 1, title: 'Campaign Details', icon: 'fa-info-circle' },
        { number: 2, title: 'Email Content', icon: 'fa-edit' },
        { number: 3, title: 'Select Audience', icon: 'fa-users' },
        { number: 4, title: 'Review & Send', icon: 'fa-check-circle' }
    ]

    // Sample leads for audience selection
    const availableLeads = [
        { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@innovate.io', company: 'Innovate' },
        { id: 3, name: 'Michael Chen', email: 'mchen@growth.com', company: 'Growth Co.' },
        { id: 4, name: 'Emma Williams', email: 'emma@startup.tech', company: 'Startup Tech' },
        { id: 5, name: 'David Brown', email: 'dbrown@enterprise.com', company: 'Enterprise' }
    ]

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = () => {
        // TODO: Connect to backend API
        console.log('Campaign data:', formData)
        alert('Campaign created! (This will be replaced with actual API call)')
        navigate('/campaigns')
    }

    const toggleLeadSelection = (leadId) => {
        setFormData(prev => ({
            ...prev,
            selectedLeads: prev.selectedLeads.includes(leadId)
                ? prev.selectedLeads.filter(id => id !== leadId)
                : [...prev.selectedLeads, leadId]
        }))
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <TitleComponent type="h2" className="text-gray-800">
                    Create New Campaign
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
                    Set up your email outreach campaign in 4 simple steps
                </TitleComponent>
            </div>

            {/* Progress Steps */}
            <Card>
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.number
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    <i className={`fas ${step.icon}`}></i>
                                </div>
                                <TitleComponent
                                    type="p"
                                    size="small-medium"
                                    className={`mt-2 text-center ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                                        }`}
                                >
                                    {step.title}
                                </TitleComponent>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`hidden sm:block h-0.5 flex-1 mx-2 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Step Content */}
            <Card padding="large">
                {/* Step 1: Campaign Details */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <TitleComponent type="h4" className="text-gray-900">
                            Campaign Details
                        </TitleComponent>

                        <Input
                            label="Campaign Name"
                            placeholder="e.g., Q1 Outreach Campaign"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <Input
                            label="Email Subject Line"
                            placeholder="e.g., Quick question about your team"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Campaign Description
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Describe the purpose of this campaign..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Email Content */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <TitleComponent type="h4" className="text-gray-900">
                            Email Content
                        </TitleComponent>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Body
                                <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                {/* Placeholder for rich text editor */}
                                <div className="mb-4 border-b border-gray-200 pb-2">
                                    <div className="flex gap-2">
                                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <i className="fas fa-bold"></i>
                                        </button>
                                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <i className="fas fa-italic"></i>
                                        </button>
                                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <i className="fas fa-underline"></i>
                                        </button>
                                        <span className="border-r border-gray-300 mx-2"></span>
                                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <i className="fas fa-list-ul"></i>
                                        </button>
                                        <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <i className="fas fa-link"></i>
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    rows={12}
                                    placeholder="Hi {{FirstName}},

I noticed that {{Company}} has been...

Best regards,
Your Name"
                                    value={formData.emailContent}
                                    onChange={(e) => setFormData({ ...formData, emailContent: e.target.value })}
                                    className="w-full text-sm focus:outline-none resize-none"
                                />
                            </div>
                            <TitleComponent type="p" size="small" className="text-gray-500 mt-2">
                                You can use variables like {'{'}{'{'} FirstName {'}'}{'}'},  {'{'}{'{'} Company {'}'}{'}'},  {'{'}{'{'} Position {'}'}{'}'} for personalization
                            </TitleComponent>
                        </div>
                    </div>
                )}

                {/* Step 3: Select Audience */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TitleComponent type="h4" className="text-gray-900">
                                Select Recipients
                            </TitleComponent>
                            <TitleComponent type="p" size="small" className="text-gray-600">
                                Selected: {formData.selectedLeads.length} leads
                            </TitleComponent>
                        </div>

                        {/* Select All Checkbox */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={formData.selectedLeads.length === availableLeads.length}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        selectedLeads: e.target.checked ? availableLeads.map(l => l.id) : []
                                    })
                                }}
                                className="rounded"
                            />
                            <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Select All Leads
                            </label>
                        </div>

                        {/* Leads Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 w-12"></th>
                                        <th className="text-left py-3 px-4">
                                            <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                                Name
                                            </TitleComponent>
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                                Email
                                            </TitleComponent>
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            <TitleComponent type="p" size="small-semibold" className="text-gray-600">
                                                Company
                                            </TitleComponent>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableLeads.map((lead) => (
                                        <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedLeads.includes(lead.id)}
                                                    onChange={() => toggleLeadSelection(lead.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <TitleComponent type="p" size="base" className="text-gray-900">
                                                    {lead.name}
                                                </TitleComponent>
                                            </td>
                                            <td className="py-3 px-4">
                                                <TitleComponent type="p" size="base" className="text-gray-600">
                                                    {lead.email}
                                                </TitleComponent>
                                            </td>
                                            <td className="py-3 px-4">
                                                <TitleComponent type="p" size="base" className="text-gray-700">
                                                    {lead.company}
                                                </TitleComponent>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Send */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <TitleComponent type="h4" className="text-gray-900">
                            Review Your Campaign
                        </TitleComponent>

                        <div className="space-y-4">
                            {/* Campaign Details Review */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <TitleComponent type="p" size="small-semibold" className="text-gray-600 mb-2">
                                    Campaign Details
                                </TitleComponent>
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="text-sm text-gray-600 w-32">Name:</span>
                                        <span className="text-sm text-gray-900 font-medium">{formData.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-sm text-gray-600 w-32">Subject:</span>
                                        <span className="text-sm text-gray-900 font-medium">{formData.subject || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Content Preview */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <TitleComponent type="p" size="small-semibold" className="text-gray-600 mb-2">
                                    Email Content Preview
                                </TitleComponent>
                                <div className="p-4 bg-white rounded border border-gray-200">
                                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                                        {formData.emailContent || 'No content added'}
                                    </pre>
                                </div>
                            </div>

                            {/* Recipients Summary */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <TitleComponent type="p" size="small-semibold" className="text-gray-600 mb-2">
                                    Recipients
                                </TitleComponent>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-users text-blue-600"></i>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {formData.selectedLeads.length} leads selected
                                    </span>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex gap-3">
                                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
                                    <div>
                                        <TitleComponent type="p" size="small-semibold" className="text-yellow-800">
                                            Ready to send?
                                        </TitleComponent>
                                        <TitleComponent type="p" size="small" className="text-yellow-700 mt-1">
                                            Once you click "Send Campaign", emails will be queued for delivery. Review all details carefully.
                                        </TitleComponent>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Navigation Buttons */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handlePrevious}>
                                <i className="fas fa-arrow-left mr-2"></i>
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/campaigns')}
                        >
                            Save as Draft
                        </Button>

                        {currentStep < 4 ? (
                            <Button variant="primary" onClick={handleNext}>
                                Next Step
                                <i className="fas fa-arrow-right ml-2"></i>
                            </Button>
                        ) : (
                            <Button variant="success" onClick={handleSubmit}>
                                <i className="fas fa-paper-plane mr-2"></i>
                                Send Campaign
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CampaignCreate
