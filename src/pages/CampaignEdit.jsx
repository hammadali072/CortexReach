import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import RichTextEditor from '../components/ui/RichTextEditor'
import { useAuth } from '../context/AuthContext'
import { getCampaign, updateCampaign, getProjectLeads, getCampaignAudienceIds, setCampaignAudience } from '../services/db'

const CampaignEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [dbLeads, setDbLeads] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        status: '',
        projectId: '',
        selectedRows: []
    })

    useEffect(() => {
        const loadCampaignData = async () => {
            try {
                const data = await getCampaign(id)
                if (!data) {
                    setError('Campaign not found.')
                    return
                }

                if (data.userId !== currentUser.uid) {
                    setError('Unauthorized access.')
                    return
                }

                if (data.status !== 'draft') {
                    setError('Only draft campaigns can be edited.')
                }

                // Fetch project leads and current audience
                const [leads, audienceIds] = await Promise.all([
                    getProjectLeads(data.projectId),
                    getCampaignAudienceIds(id)
                ])

                setDbLeads(leads)

                // Map audienceIds back to lead objects for DataTable
                const selectedLeads = leads.filter(l => audienceIds.includes(l.id))

                setFormData({
                    name: data.campaignName || data.name || '',
                    subject: data.subject || '',
                    body: data.emailContent || data.body || '',
                    status: data.status,
                    projectId: data.projectId,
                    selectedRows: selectedLeads
                })
            } catch (err) {
                console.error('[CampaignEdit] fetch error:', err)
                setError('Failed to load campaign data.')
            } finally {
                setLoading(false)
            }
        }

        if (currentUser && id) loadCampaignData()
    }, [id, currentUser])

    const columns = useMemo(() => [
        {
            name: 'Contact',
            selector: row => `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.name || 'N/A',
            sortable: true,
            cell: row => (
                <div className="py-2">
                    <div className="text-sm font-bold text-slate-900">{`${row.first_name || ''} ${row.last_name || ''}`.trim() || row.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{row.email}</div>
                </div>
            )
        },
        {
            name: 'Company',
            selector: row => row.company_name || row.company || 'N/A',
            sortable: true,
            cell: row => <span className="text-sm text-slate-600 font-medium">{row.company_name || row.company || 'N/A'}</span>
        },
        {
            name: 'Industry',
            selector: row => row.industry,
            sortable: true,
            cell: row => <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{row.industry || 'N/A'}</Badge>
        }
    ], [])

    const handleSelectedRowsChange = ({ selectedRows }) => {
        setFormData(prev => ({ ...prev, selectedRows }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.status !== 'draft') return

        if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
            setError('All fields are required.')
            return
        }

        if (formData.selectedRows.length === 0) {
            setError('Please select at least one lead.')
            return
        }

        setSubmitting(true)
        setError('')
        try {
            const leadIds = formData.selectedRows.map(row => row.id)

            // 1. Update Campaign Record
            await updateCampaign(id, {
                campaignName: formData.name.trim(),
                name: formData.name.trim(), // Keep for compatibility
                subjectLine: formData.subject.trim(),
                subject: formData.subject.trim(), // Keep for compatibility
                emailBodyHTML: formData.body.trim(),
                emailContent: formData.body.trim(), // Keep for compatibility
                body: formData.body.trim(), // Keep for compatibility
                selectedLeadIds: leadIds
            })

            // 2. Update Audience Mapping
            await setCampaignAudience(formData.projectId, id, leadIds)

            navigate(`/dashboard/campaigns/${id}`)
        } catch (err) {
            console.error('[CampaignEdit] update error:', err)
            setError(err.message || 'Failed to update campaign.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading campaign...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                        Edit Campaign
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Modify outreach content and audience for "{formData.name}"
                    </TitleComponent>
                </div>
                <Badge variant="warning" className="px-4 py-2 uppercase tracking-widest text-[10px] font-black">Draft Mode</Badge>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-3 animate-in shake">
                    <i className="fas fa-exclamation-circle" />
                    {error}
                </div>
            )}

            {formData.status === 'draft' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-10 space-y-8">
                        <TitleComponent type="h3" className="text-slate-900 font-bold text-xl mb-4 border-l-4 border-indigo-600 pl-4">Campaign Details</TitleComponent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input
                                label="Campaign Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-100 font-bold"
                            />
                            <Input
                                label="Email Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>

                        <RichTextEditor
                            label="Email Content"
                            value={formData.body}
                            onChange={(content) => setFormData({ ...formData, body: content })}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-10 space-y-6">
                        <div className="flex justify-between items-center">
                            <TitleComponent type="h3" className="text-slate-900 font-bold text-xl border-l-4 border-emerald-500 pl-4">Manage Audience</TitleComponent>
                            <Badge variant="success">{formData.selectedRows.length} Leads Selected</Badge>
                        </div>
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={dbLeads}
                                selectableRows
                                selectableRowSelected={row => formData.selectedRows.some(s => s.id === row.id)}
                                onSelectedRowsChange={handleSelectedRowsChange}
                                highlightOnHover
                                responsive
                                noHeader
                                persistTableHead
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" type="button" onClick={() => navigate(-1)} className="px-10 h-14 border-slate-200 text-slate-500">
                            Cancel Changes
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="px-16 h-14 bg-indigo-600 shadow-xl shadow-indigo-100 font-bold text-lg">
                            {submitting ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</> : 'Update Campaign'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-lock text-3xl text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700">Campaign Locked</h3>
                    <p className="text-slate-400 max-w-md mx-auto mt-2 mb-8">This campaign has already transition to <span className="text-slate-900 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-slate-100 rounded">{formData.status}</span> and cannot be edited to preserve data integrity.</p>
                    <Button variant="outline" onClick={() => navigate(-1)} className="px-10 border-slate-200">Go Back to List</Button>
                </div>
            )}
        </div>
    )
}

export default CampaignEdit

