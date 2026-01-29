import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

const Projects = () => {
    const navigate = useNavigate()

    const projects = [
        {
            id: 1,
            name: 'SaaS Platform Outreach',
            type: 'Product',
            targetAudience: 'CTOs / Product Managers',
            totalLeads: 450,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Cloud Consulting Service',
            type: 'Service',
            targetAudience: 'Retail Businesses',
            totalLeads: 210,
            status: 'Active'
        },
        {
            id: 3,
            name: 'Internal Talent Acquisition',
            type: 'Product',
            targetAudience: 'HR Leaders',
            totalLeads: 120,
            status: 'Archived'
        }
    ]

    const columns = useMemo(() => [
        {
            name: 'Project Name',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <Link to={`/projects/${row.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
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
            selector: row => row.totalLeads,
            sortable: true,
            center: true,
            cell: row => <span className="font-bold text-slate-700">{row.totalLeads}</span>
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
                        onClick={() => navigate(`/projects/${row.id}`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View Project"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors" title="Archive">
                        <i className="fas fa-archive"></i>
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
                <Link to="/projects/create">
                    <Button variant="primary">
                        <i className="fas fa-plus mr-2"></i>
                        Create Project
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
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
        </div>
    )
}

export default Projects
