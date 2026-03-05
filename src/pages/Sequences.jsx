import TitleComponent from '../components/titleComponent/titleComponent'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const FollowUps = () => {
    /**
     * Product Rule: 
     * Follow-ups are ONLY sent to engaged (opened) leads.
     * Limit to a single follow-up step to reduce spam and focus on yield.
     */
    const followUps = [
        {
            id: 1,
            campaign: 'Jan SME Outreach',
            status: 'Active',
            eligibleLeads: 456,
            followUpsSent: 210,
            conversion: '12%',
            description: 'Conditional message for recipients who opened the initial email.'
        },
        {
            id: 2,
            campaign: 'Growth Series B',
            status: 'Draft',
            eligibleLeads: 0,
            followUpsSent: 0,
            conversion: '0%',
            description: 'Pending first email engagement signal.'
        }
    ]

    return (
        <div className="min-h-screen space-y-8 pb-12 text-slate-900">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold">
                        Follow-Ups
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Manage single-step follow-ups for leads who opened your initial email.
                    </TitleComponent>
                </div>
            </div>

            {/* Logical Rule Indicator */}
            <div className="p-6 bg-slate-900 rounded-[8px] text-white flex items-center gap-6 shadow-xl border border-slate-700">
                <div className="w-16 h-16 bg-indigo-600 rounded-[8px] flex items-center justify-center">
                    <i className="fas fa-microchip text-2xl" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Automated Logic Enabled</h3>
                    <p className="text-slate-400 text-sm">System only prepares follow-ups for leads who have provided an 'Open' signal. All other outreach is discarded.</p>
                </div>
            </div>

            {/* Follow-Ups List */}
            <div className="grid grid-cols-1 gap-4">
                {followUps.map((item) => (
                    <div key={item.id} className="bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-xl">{item.campaign}</h4>
                                    <Badge variant={item.status === 'Active' ? 'success' : 'default'}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <p className="text-slate-500 text-sm">{item.description}</p>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-center">
                                    <p className="text-xl font-bold">{item.eligibleLeads}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Eligible</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-indigo-600">{item.followUpsSent}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sent</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-emerald-600">{item.conversion}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yield</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="outline">Edit Content</Button>
                                <Button variant="primary">Manage Leads</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-indigo-50 rounded-[8px] border border-indigo-100">
                <div className="flex gap-6">
                    <i className="fas fa-info-circle text-indigo-600 text-2xl mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900 mb-1 leading-none">Why only one follow-up?</h4>
                        <p className="text-indigo-800 text-sm leading-relaxed max-w-2xl">
                            CortexReach focuses on high-intent signals. Recurrent multi-step dripping often leads to domain blacklisting and lower response quality. By focusing on a single, strong follow-up for engaged leads, we maximize your conversion yield.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FollowUps

