import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const ProjectCreate = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        type: 'Product',
        description: '',
        industry: '',
        audience: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        // No backend logic
        console.log('Project created:', formData)
        navigate('/projects')
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div>
                <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                    Define New Project
                </TitleComponent>
                <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                    Establish the context for your leads and outreach campaigns.
                </TitleComponent>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                        label="Project Name"
                        placeholder="e.g., Enterprise Cloud Suite"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Project Type</label>
                        <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Short Description</label>
                    <textarea
                        rows={4}
                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                        placeholder="What problem does this project solve?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                        label="Target Industry / Domain"
                        placeholder="e.g., Fintech, Healthcare"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                    <Input
                        label="Intended Audience"
                        placeholder="e.g., Marketing VPs, DevOps"
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    />
                </div>

                <div className="pt-6 flex justify-end gap-4">
                    <Button variant="outline" onClick={() => navigate('/projects')}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="px-12 bg-indigo-600 shadow-xl shadow-indigo-100">
                        Create Project
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ProjectCreate
