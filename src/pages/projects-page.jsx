import { useMemo, useReducer, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/badge/badge'
import Button from '../components/ui/button/button'
import Modal from '../components/ui/modal/modal'
import Input from '../components/ui/input/input'
import { useAuth } from '../context/AuthContext'
import {
    getUserProjects,
    updateProject,
    deleteProject,
} from '../services/db'

const ACTIONS = {
    SET_DATA: 'SET_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_MODAL: 'SET_MODAL',
    UPDATE_FORM: 'UPDATE_FORM',
    SET_SAVING: 'SET_SAVING'
};

const projectsReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_DATA:
            return { ...state, projects: action.payload, dbLoading: false };
        case ACTIONS.SET_LOADING:
            return { ...state, dbLoading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, dbError: action.payload, dbLoading: false };
        case ACTIONS.SET_MODAL:
            return { ...state, ...action.payload };
        case ACTIONS.UPDATE_FORM:
            return { ...state, formData: { ...state.formData, ...action.payload } };
        case ACTIONS.SET_SAVING:
            return { ...state, saving: action.payload };
        default:
            return state;
    }
};

const ProjectsPage = () => {
    const navigate = useNavigate()
    const { currentUser } = useAuth()

    const [state, dispatch] = useReducer(projectsReducer, {
        projects: [],
        dbLoading: true,
        dbError: '',
        isEditModalOpen: false,
        isDeleteModalOpen: false,
        currentProject: null,
        formData: {
            name: '', type: 'Product', audiences: [''], description: '', features: ['']
        },
        saving: false,
        formError: ''
    });

    const {
        projects, dbLoading, dbError, isEditModalOpen, isDeleteModalOpen,
        currentProject, formData, saving, formError
    } = state;

    const loadProjects = useCallback(async () => {
        if (!currentUser) return
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const data = await getUserProjects(currentUser.uid)
            dispatch({ type: ACTIONS.SET_DATA, payload: data.sort((a, b) => b.createdAt - a.createdAt) });
        } catch (err) {
            console.error('[Projects] load error:', err)
            dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load projects. Please refresh.' });
        }
    }, [currentUser])

    useEffect(() => { loadProjects() }, [loadProjects])

    const handleEditClick = (project) => {
        dispatch({
            type: ACTIONS.SET_MODAL,
            payload: {
                currentProject: project,
                formData: {
                    name: project.name,
                    type: project.type || 'Product',
                    audiences: project.targetAudience ? project.targetAudience.split(', ').map(a => a.trim()) : [''],
                    description: project.description || '',
                    features: project.features ? project.features.split('\n').map(f => f.replace(/^• /, '').trim()) : [''],
                },
                formError: '',
                isEditModalOpen: true
            }
        });
    }

    const saveEdit = async (e) => {
        e.preventDefault()
        dispatch({ type: ACTIONS.SET_MODAL, payload: { formError: '' } });
        dispatch({ type: ACTIONS.SET_SAVING, payload: true });
        try {
            await updateProject(currentProject.id, {
                name: formData.name.trim(),
                type: formData.type,
                targetAudience: formData.audiences.filter(a => a.trim()).join(', '),
                description: formData.description,
                features: formData.features.filter(f => f.trim()).map(f => `• ${f.trim()}`).join('\n'),
            })
            dispatch({ type: ACTIONS.SET_MODAL, payload: { isEditModalOpen: false } });
            loadProjects();
        } catch (err) {
            dispatch({ type: ACTIONS.SET_MODAL, payload: { formError: err.message || 'Failed to save changes.' } });
        } finally {
            dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        }
    }

    const handleDeleteClick = (project) => {
        dispatch({ type: ACTIONS.SET_MODAL, payload: { currentProject: project, isDeleteModalOpen: true } });
    }

    const confirmDelete = async () => {
        try {
            await deleteProject(currentProject.id)
            loadProjects();
        } catch (err) {
            console.error('[Projects] delete error:', err)
        } finally {
            dispatch({ type: ACTIONS.SET_MODAL, payload: { isDeleteModalOpen: false } });
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
                    <TitleComponent type="h1" className="text-3xl font-bold font-idGrotesk bg-gradient-brand bg-clip-text text-transparent">
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

            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-3">
                    <i className="fas fa-exclamation-circle" />
                    {dbError}
                    <button onClick={loadProjects} className="ml-auto text-xs font-bold underline">Retry</button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
                {dbLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-indigo-100 border-t-indigo-600 rounded-lg animate-spin" />
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

            {!dbLoading && projects.length === 0 && !dbError && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <i className="fas fa-folder-open text-slate-200 text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No projects yet</h3>
                    <p className="text-slate-500 mb-6 font-medium">Create your first project to start outreach.</p>
                    <Link to="/dashboard/projects/create">
                        <Button variant="primary">Create Project</Button>
                    </Link>
                </div>
            )}

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => dispatch({ type: ACTIONS.SET_MODAL, payload: { isEditModalOpen: false } })}
                title="Edit Project Details"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => dispatch({ type: ACTIONS.SET_MODAL, payload: { isEditModalOpen: false } })} disabled={saving}>Cancel</Button>
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
                        <Input id="edit-project-name" label="Project Name" value={formData.name} onChange={e => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { name: e.target.value } })} />
                        <div className="space-y-2">
                            <label htmlFor="edit-project-type" className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Project Type</label>
                            <select
                                id="edit-project-type"
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
                                value={formData.type}
                                onChange={e => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { type: e.target.value } })}
                            >
                                <option value="Product">Product</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <fieldset className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <legend className="block text-xs font-black text-slate-400 uppercase tracking-widest">Targeted Audience</legend>
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { audiences: [...formData.audiences, ''] } })}
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
                                                aria-label={`Audience segment ${index + 1}`}
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm"
                                                placeholder="Enter audience segment..."
                                                value={audience}
                                                onChange={(e) => {
                                                    const newAudiences = [...formData.audiences]
                                                    newAudiences[index] = e.target.value
                                                    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { audiences: newAudiences } });
                                                }}
                                            />
                                        </div>
                                        {formData.audiences.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newAudiences = formData.audiences.filter((_, i) => i !== index)
                                                    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { audiences: newAudiences } });
                                                }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                title="Remove Audience"
                                            >
                                                <i className="fas fa-minus" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    <div className="space-y-4">
                        <fieldset className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <legend className="block text-xs font-black text-slate-400 uppercase tracking-widest">Key Features / Bullet Points</legend>
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: ACTIONS.UPDATE_FORM, payload: { features: [...formData.features, ''] } })}
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
                                                aria-label={`Feature ${index + 1}`}
                                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm"
                                                placeholder="Enter feature..."
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...formData.features]
                                                    newFeatures[index] = e.target.value
                                                    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { features: newFeatures } });
                                                }}
                                            />
                                        </div>
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFeatures = formData.features.filter((_, i) => i !== index)
                                                    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { features: newFeatures } });
                                                }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                title="Remove Feature"
                                            >
                                                <i className="fas fa-minus" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => dispatch({ type: ACTIONS.SET_MODAL, payload: { isDeleteModalOpen: false } })}
                title="Delete Project"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => dispatch({ type: ACTIONS.SET_MODAL, payload: { isDeleteModalOpen: false } })}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </>
                }
            >
                <div className="text-center space-y-4">
                    <div className="size-16 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
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

export default ProjectsPage
