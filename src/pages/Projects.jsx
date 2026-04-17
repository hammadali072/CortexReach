import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import {
    getUserProjects,
    updateProject,
    deleteProject,
} from '../services/db'

const Projects = () => {
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    // ── Data state ────────────────────────────────────────────────────────
    const [projects, setProjects] = useState([])
    const [dbLoading, setDbLoading] = useState(true)
    const [dbError, setDbError] = useState('')

    // ── Modal state ───────────────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [currentProject, setCurrentProject] = useState(null)
    const [formData, setFormData] = useState({
        name: '', type: 'Product', audiences: [''], description: '', features: ['']
    })
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const loadProjects = useCallback(async () => {
        if (!currentUser) return
        try {
            setDbLoading(true)
            setDbError('')
            const data = await getUserProjects(currentUser.uid)
            // Sort newest first
            setProjects(data.sort((a, b) => b.createdAt - a.createdAt))
        } catch (err) {
            console.error('[Projects] load error:', err)
            setDbError('Failed to load projects. Please refresh.')
        } finally {
            setDbLoading(false)
        }
    }, [currentUser])

    useEffect(() => { loadProjects() }, [loadProjects])

    const handleEditClick = (project) => {
        setCurrentProject(project)
        setFormData({
            name: project.name,
            type: project.type || 'Product',
            audiences: project.targetAudience ? project.targetAudience.split(', ').map(a => a.trim()) : [''],
            description: project.description || '',
            features: project.features ? project.features.split('\n').map(f => f.replace(/^• /, '').trim()) : [''],
        })
        setFormError('')
        setIsEditModalOpen(true)
    }

    const saveEdit = async (e) => {
        e.preventDefault()
        setFormError('')
        setSaving(true)
        try {
            await updateProject(currentProject.id, {
                name: formData.name.trim(),
                type: formData.type,
                targetAudience: formData.audiences.filter(a => a.trim()).join(', '),
                description: formData.description,
                features: formData.features.filter(f => f.trim()).map(f => `• ${f.trim()}`).join('\n'),
            })
            setProjects(prev => prev.map(p =>
                p.id === currentProject.id ? { ...p, ...formData } : p
            ))
            setIsEditModalOpen(false)
        } catch (err) {
            setFormError(err.message || 'Failed to save changes.')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteClick = (project) => {
        setCurrentProject(project)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        try {
            await deleteProject(currentProject.id)
            setProjects(prev => prev.filter(p => p.id !== currentProject.id))
        } catch (err) {
            console.error('[Projects] delete error:', err)
        } finally {
            setIsDeleteModalOpen(false)
        }
    }

    const columns = useMemo(() => [
        {
            name: 'Project Name',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <Link to={`/dashboard/projects/${row.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {row.name}
                </Link>
            ),
            grow: 2,
        },
        {
            name: 'Type',
            selector: row => row.type,
            sortable: true,
            cell: row => <span className="text-sm font-medium text-slate-600">{row.type}</span>
        },
        {
            name: 'Target Audience',
            selector: row => row.targetAudience,
            sortable: true,
            grow: 1.5,
            cell: row => <span className="text-sm text-slate-500">{row.targetAudience}</span>
        },
        {
            name: 'Total Leads',
            selector: row => row.stats?.totalLeads || 0,
            sortable: true,
            center: true,
            cell: row => <span className="font-bold text-slate-700">{row.stats?.totalLeads || 0}</span>
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge variant={row.status === 'active' ? 'success' : 'default'}>
                    {row.status === 'active' ? 'Active' : 'Archived'}
                </Badge>
            )
        },
        {
            name: 'Actions',
            right: true,
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleEditClick(row)
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Project"
                    >
                        <i className="fas fa-edit" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(row)
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Project"
                    >
                        <i className="fas fa-trash-alt" />
                    </button>
                </div>
            )
        }
    ], [])

    const customStyles = {
        table: { style: { backgroundColor: 'transparent' } },
        headRow: { style: { backgroundColor: '#f8fafc', borderBottomWidth: '1px', borderBottomColor: '#f1f5f9', minHeight: '64px' } },
        headCells: { style: { color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { cursor: 'pointer', minHeight: '72px', '&:not(:last-child)': { borderBottomWidth: '1px', borderBottomColor: '#f8fafc' }, '&:hover': { backgroundColor: '#f8fafc', transitionDuration: '0.15s', transitionProperty: 'background-color' } } },
    }

    return (
        <div className="min-h-screen space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-slate-900 text-3xl font-bold font-idGrotesk">
                        Business Projects
                    </TitleComponent>
                    <TitleComponent type="p" size="base" className="text-slate-500 mt-1">
                        Manage your products and services to drive relevant outreach.
                    </TitleComponent>
                </div>
                <Link to="/dashboard/projects/create">
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2" />
                        Create Project
                    </Button>
                </Link>
            </div>

            {/* Error banner */}
            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />
                    {dbError}
                    <button onClick={loadProjects} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading projects...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={projects}
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                        noHeader
                        onRowClicked={(row) => navigate(`/dashboard/projects/${row.id}`)}
                    />
                )}
            </div>

            {/* Empty state */}
            {!dbLoading && projects.length === 0 && !dbError && (
                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-slate-200">
                    <i className="fas fa-folder-open text-slate-200 text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No projects yet</h3>
                    <p className="text-slate-500 mb-6">Create your first project to start outreach.</p>
                    <Link to="/dashboard/projects/create">
                        <Button variant="primary">Create Project</Button>
                    </Link>
                </div>
            )}

            {/* ── Edit Modal ── */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Project Details"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={saving}>Cancel</Button>
                        <Button variant="primary" onClick={saveEdit} disabled={saving}>
                            {saving ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</> : 'Save Changes'}
                        </Button>
                    </>
                }
            >
                <form className="space-y-6" onSubmit={saveEdit}>
                    {formError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {formError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Project Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Project Type</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Product">Product</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Targeted Audience</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, audiences: [...formData.audiences, ''] })}
                                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <i className="fas fa-plus-circle" /> Add Audience
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.audiences.map((audience, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">
                                            <i className="fas fa-user-tag text-[8px]" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm"
                                            placeholder="Enter audience segment..."
                                            value={audience}
                                            onChange={(e) => {
                                                const newAudiences = [...formData.audiences]
                                                newAudiences[index] = e.target.value
                                                setFormData({ ...formData, audiences: newAudiences })
                                            }}
                                        />
                                    </div>
                                    {formData.audiences.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newAudiences = formData.audiences.filter((_, i) => i !== index)
                                                setFormData({ ...formData, audiences: newAudiences })
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <i className="fas fa-minus" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Key Features / Bullet Points</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <i className="fas fa-plus-circle" /> Add Bullet Point
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <i className="fas fa-circle text-[4px]" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm"
                                            placeholder="Enter feature..."
                                            value={feature}
                                            onChange={(e) => {
                                                const newFeatures = [...formData.features]
                                                newFeatures[index] = e.target.value
                                                setFormData({ ...formData, features: newFeatures })
                                            }}
                                        />
                                    </div>
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newFeatures = formData.features.filter((_, i) => i !== index)
                                                setFormData({ ...formData, features: newFeatures })
                                            }}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        >
                                            <i className="fas fa-minus" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>

            {/* ── Delete Modal ── */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Project"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </>
                }
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-2xl" />
                    </div>
                    <p className="text-slate-600 font-medium">
                        Are you sure you want to delete{' '}
                        <span className="font-bold text-slate-900">{currentProject?.name}</span>?
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    )
}

export default Projects
