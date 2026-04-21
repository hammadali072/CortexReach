import { useReducer, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/button/button'
import Input from '../components/ui/input/input'
import Badge from '../components/ui/badge/badge'
import RichTextEditor from '../components/ui/richTextEditor/richTextEditor'
import { useAuth } from '../context/AuthContext'
import { getCampaign, updateCampaign, getProjectLeads, getCampaignAudienceIds, setCampaignAudience } from '../services/db'

const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_DATA: 'SET_DATA',
    SET_ERROR: 'SET_ERROR',
    UPDATE_FORM: 'UPDATE_FORM',
    SET_SUBMITTING: 'SET_SUBMITTING'
};

const editReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_DATA:
            return { 
                ...state, 
                loading: false, 
                dbLeads: action.payload.leads,
                formData: {
                    ...state.formData,
                    ...action.payload.formData
                }
            };
        case ACTIONS.UPDATE_FORM:
            return { ...state, formData: { ...state.formData, ...action.payload } };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, submitting: false, loading: false };
        case ACTIONS.SET_SUBMITTING:
            return { ...state, submitting: action.payload };
        default:
            return state;
    }
};

const CampaignEditPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const [state, dispatch] = useReducer(editReducer, {
        loading: true,
        submitting: false,
        error: '',
        dbLeads: [],
        formData: {
            name: '',
            subject: '',
            body: '',
            status: '',
            projectId: '',
            selectedRows: []
        }
    });

    const { loading, submitting, error, dbLeads, formData } = state;

    useEffect(() => {
        const loadCampaignData = async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const data = await getCampaign(id)
                if (!data) {
                    dispatch({ type: ACTIONS.SET_ERROR, payload: 'Campaign not found.' });
                    return
                }

                if (data.userId !== currentUser.uid) {
                    dispatch({ type: ACTIONS.SET_ERROR, payload: 'Unauthorized access.' });
                    return
                }

                if (data.status !== 'draft') {
                    dispatch({ type: ACTIONS.SET_ERROR, payload: 'Only draft campaigns can be edited.' });
                }

                const [leads, audienceIds] = await Promise.all([
                    getProjectLeads(data.projectId),
                    getCampaignAudienceIds(id)
                ])

                const selectedLeads = leads.filter(l => audienceIds.includes(l.id))

                dispatch({
                    type: ACTIONS.SET_DATA,
                    payload: {
                        leads,
                        formData: {
                            name: data.campaignName || data.name || '',
                            subject: data.subject || '',
                            body: data.emailContent || data.body || '',
                            status: data.status,
                            projectId: data.projectId,
                            selectedRows: selectedLeads
                        }
                    }
                });
            } catch (err) {
                console.error('[CampaignEdit] fetch error:', err)
                dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load campaign data.' });
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
        dispatch({ type: ACTIONS.UPDATE_FORM, payload: { selectedRows } });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.status !== 'draft') return

        if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'All fields are required.' });
            return
        }

        if (formData.selectedRows.length === 0) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Please select at least one lead.' });
            return
        }

        dispatch({ type: ACTIONS.SET_SUBMITTING, payload: true });
        dispatch({ type: ACTIONS.SET_ERROR, payload: '' });
        try {
            const leadIds = formData.selectedRows.map(row => row.id)

            await updateCampaign(id, {
                campaignName: formData.name.trim(),
                name: formData.name.trim(),
                subjectLine: formData.subject.trim(),
                subject: formData.subject.trim(),
                emailBodyHTML: formData.body.trim(),
                emailContent: formData.body.trim(),
                body: formData.body.trim(),
                selectedLeadIds: leadIds
            })

            await setCampaignAudience(formData.projectId, id, leadIds)
            navigate(`/dashboard/campaigns/${id}`)
        } catch (err) {
            console.error('[CampaignEdit] update error:', err)
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message || 'Failed to update campaign.' });
        } finally {
            dispatch({ type: ACTIONS.SET_SUBMITTING, payload: false });
        }
    }

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="size-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading campaign...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <TitleComponent type="h1" className="text-3xl font-bold font-idGrotesk bg-gradient-brand bg-clip-text text-transparent">
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
                    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-10 space-y-8">
                        <TitleComponent type="h3" className="text-slate-900 font-bold text-xl mb-4 border-l-4 border-indigo-600 pl-4">Campaign Details</TitleComponent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input
                                id="edit-camp-name"
                                label="Campaign Name"
                                value={formData.name}
                                onChange={(e) => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { name: e.target.value } })}
                                required
                                className="bg-slate-50 border-slate-100 font-bold"
                            />
                            <Input
                                id="edit-camp-sub"
                                label="Email Subject"
                                value={formData.subject}
                                onChange={(e) => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { subject: e.target.value } })}
                                required
                                className="bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>

                        <RichTextEditor
                            label="Email Content"
                            value={formData.body}
                            onChange={(content) => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { body: content } })}
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-10 space-y-6">
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
                    <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-lock text-3xl text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700">Campaign Locked</h3>
                    <div className="max-w-md mx-auto mt-2 mb-8">
                        <p className="text-slate-400">
                            This campaign has already transitions to <span className="text-slate-900 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-slate-100 rounded">{formData.status}</span> and cannot be edited to preserve data integrity.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)} className="px-10 border-slate-200">Go Back to List</Button>
                </div>
            )}
        </div>
    )
}

export default CampaignEditPage
