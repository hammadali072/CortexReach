import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { getCampaign, updateCampaign } from '../services/db'

const CampaignEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: '',
        status: ''
    })

    useEffect(() => {
        const loadCampaign = async () => {
            try {
                const data = await getCampaign(id)
                if (!data) {
                    setError('Campaign not found.')
                    return
                }

                // Security check
                if (data.userId !== currentUser.uid) {
                    setError('Unauthorized access.')
                    return
                }

                // Phase 6: Editing only allowed if status is draft
                if (data.status !== 'draft') {
                    setError('Only draft campaigns can be edited.')
                }

                setFormData({
                    name: data.name || '',
                    subject: data.subject || '',
                    body: data.body || '',
                    status: data.status
                })
            } catch (err) {
                console.error('[CampaignEdit] fetch error:', err)
                setError('Failed to load campaign data.')
            } finally {
                setLoading(false)
            }
        }

        if (currentUser && id) loadCampaign()
    }, [id, currentUser])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.status !== 'draft') return

        setSubmitting(true)
        setError('')
        try {
            await updateCampaign(id, {
                name: formData.name.trim(),
                subject: formData.subject.trim(),
                body: formData.body.trim()
            })
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
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-[8px] animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Loading campaign...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                    Edit Campaign
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                    Modifying content for "{formData.name}"
                </TitleComponent>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-[8px] text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />
                    {error}
                </div>
            )}

            {formData.status === 'draft' ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="Campaign Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email Subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Body</label>
                        <textarea
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[8px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 min-h-[300px]"
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="px-12 bg-indigo-600">
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 p-10 text-center">
                    <i className="fas fa-lock text-slate-200 text-5xl mb-4 block" />
                    <h3 className="text-lg font-bold text-slate-700">Campaign Locked</h3>
                    <p className="text-slate-400 text-sm mb-6">This campaign is already {formData.status} and cannot be edited.</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            )}
        </div>
    )
}

export default CampaignEdit
