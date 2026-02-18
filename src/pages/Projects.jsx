import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const Projects = () => {
    const navigate = useNavigate()

    // Initial data with all fields
    const defaultProjects = [
        {
            id: 1,
            name: 'SaaS Platform Outreach',
            type: 'Product',
            targetAudience: 'CTOs / Product Managers',
            description: 'Accelerating digital transformation for enterprise clients with our core SaaS infrastructure.',
            industry: 'B2B Software',
            totalLeads: 450,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Cloud Consulting Service',
            type: 'Service',
            targetAudience: 'Retail Businesses',
            description: 'Helping retail businesses transition to cloud-first operations and digital storefronts.',
            industry: 'Retail Tech',
            totalLeads: 210,
            status: 'Active'
        },
        {
            id: 3,
            name: 'Internal Talent Acquisition',
            type: 'Product',
            targetAudience: 'HR Leaders',
            description: 'Automated talent discovery and engagement platform for enterprise HR departments.',
            industry: 'HR Tech',
            totalLeads: 120,
            status: 'Archived'
        }
    ]

    // State management
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('cortex_projects')
        return saved ? JSON.parse(saved) : defaultProjects
    })

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [currentProject, setCurrentProject] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        type: 'Product',
        targetAudience: '',
        description: '',
        industry: ''
    })

    // Persistence
    useEffect(() => {
        localStorage.setItem('cortex_projects', JSON.stringify(projects))
    }, [projects])

    // Handlers
    const handleEditClick = (project) => {
        setCurrentProject(project)
        setFormData({
            name: project.name,
            type: project.type,
            targetAudience: project.targetAudience,
            description: project.description || '',
            industry: project.industry || ''
        })
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (project) => {
        setCurrentProject(project)
        setIsDeleteModalOpen(true)
    }

    const saveEdit = (e) => {
        e.preventDefault()
        setProjects(prev => prev.map(p =>
            p.id === currentProject.id ? { ...p, ...formData } : p
        ))
        setIsEditModalOpen(false)
    }

    const confirmDelete = () => {
        setProjects(prev => prev.filter(p => p.id !== currentProject.id))
        setIsDeleteModalOpen(false)
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
            cell: row => (
                <span className="text-sm font-medium text-slate-600">{row.type}</span>
            )
        },
        {
            name: 'Target Audience',
            selector: row => row.targetAudience,
            sortable: true,
            grow: 1.5,
            cell: row => (
                <span className="text-sm text-slate-500">{row.targetAudience}</span>
            )
        },
        {
            name: 'Total Leads',
            selector: row => row.totalLeads || 0,
            sortable: true,
            center: true,
            cell: row => <span className="font-bold text-slate-700">{row.totalLeads || 0}</span>
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            cell: row => (
                <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
                    {row.status}
                </Badge>
            )
        },
        {
            name: 'Actions',
            right: true,
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/dashboard/projects/${row.id}`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View Project"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Edit Project"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Project"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            )
        }
    ], [navigate])

    const customStyles = {
        table: {
            style: {
                backgroundColor: 'transparent',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottomWidth: '1px',
                borderBottomColor: '#f1f5f9',
                minHeight: '64px',
            },
        },
        headCells: {
            style: {
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
            },
        },
        rows: {
            style: {
                minHeight: '72px',
                '&:not(:last-child)': {
                    borderBottomWidth: '1px',
                    borderBottomColor: '#f8fafc',
                },
                '&:hover': {
                    backgroundColor: '#f8fafc',
                    transitionDuration: '0.15s',
                    transitionProperty: 'background-color',
                },
            },
        },
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

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={projects}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noHeader
                />
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Project Details"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={saveEdit}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Project Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Target Audience"
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        />
                        <Input
                            label="Industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Short Description</label>
                        <textarea
                            rows={4}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Project"
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-2xl" />
                    </div>
                    <p className="text-slate-600 font-medium">
                        Are you sure you want to delete <span className="font-bold text-slate-900">{currentProject?.name}</span>?
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    )
}

export default Projects

