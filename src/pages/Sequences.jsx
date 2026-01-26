import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const Sequences = () => {
    // Placeholder data
    const sequences = [
        {
            id: 1,
            name: 'Welcome Series',
            steps: 4,
            status: 'Active',
            enrolled: 245,
            completed: 89,
            description: 'Initial outreach and follow-up sequence for new leads'
        },
        {
            id: 2,
            name: 'Re-engagement Flow',
            steps: 3,
            status: 'Active',
            enrolled: 156,
            completed: 67,
            description: 'Win back cold leads with targeted messages'
        },
        {
            id: 3,
            name: 'Product Demo Follow-up',
            steps: 5,
            status: 'Draft',
            enrolled: 0,
            completed: 0,
            description: 'Nurture leads after product demonstration'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h2" className="text-gray-800">
                        Sequences
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-gray-600 mt-1">
                        Automate your follow-up emails with engagement-based sequences
                    </TitleComponent>
                </div>
                <Button variant="primary">
                    <i className="fas fa-plus mr-2"></i>
                    Create Sequence
                </Button>
            </div>

            {/* Sequences List */}
            <div className="space-y-4">
                {sequences.map((sequence) => (
                    <Card key={sequence.id} className="hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Sequence Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <TitleComponent type="h4" className="text-gray-900">
                                        {sequence.name}
                                    </TitleComponent>
                                    <Badge variant={sequence.status === 'Active' ? 'success' : 'default'}>
                                        {sequence.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        {sequence.steps} steps
                                    </span>
                                </div>
                                <TitleComponent type="p" size="base" className="text-gray-600">
                                    {sequence.description}
                                </TitleComponent>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <TitleComponent type="h5" className="text-gray-900">
                                        {sequence.enrolled}
                                    </TitleComponent>
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Enrolled
                                    </TitleComponent>
                                </div>
                                <div className="text-center">
                                    <TitleComponent type="h5" className="text-green-600">
                                        {sequence.completed}
                                    </TitleComponent>
                                    <TitleComponent type="p" size="small" className="text-gray-600">
                                        Completed
                                    </TitleComponent>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="small">
                                    <i className="fas fa-eye mr-2"></i>
                                    View
                                </Button>
                                <Button variant="outline" size="small">
                                    <i className="fas fa-edit mr-2"></i>
                                    Edit
                                </Button>
                            </div>
                        </div>

                        {/* Progress */}
                        {sequence.enrolled > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Completion Rate</span>
                                    <span>{((sequence.completed / sequence.enrolled) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${(sequence.completed / sequence.enrolled) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-lightbulb text-blue-600 text-xl"></i>
                        </div>
                    </div>
                    <div>
                        <TitleComponent type="h5" className="text-blue-900 mb-1">
                            What are sequences?
                        </TitleComponent>
                        <TitleComponent type="p" size="base" className="text-blue-800">
                            Sequences are automated email workflows triggered by lead engagement. Set up follow-up emails based on opens, clicks, and replies to nurture leads efficiently.
                        </TitleComponent>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Sequences
