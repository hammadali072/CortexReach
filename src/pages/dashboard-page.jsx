import { useEffect, useReducer, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/badge/badge'
import { useAuth } from '../context/AuthContext'
import { getUserProjects, getUserCampaigns, getCampaignSends } from '../services/db'

const ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_DATA: 'SET_DATA',
    SET_HOVERED: 'SET_HOVERED'
};

const dashboardReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_DATA:
            return { ...state, ...action.payload, loading: false };
        case ACTIONS.SET_HOVERED:
            return { ...state, hoveredCard: action.payload };
        default:
            return state;
    }
};

const DashboardPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(dashboardReducer, {
        loading: true,
        projects: [],
        campaigns: [],
        hoveredCard: null
    });

    const { loading, projects, campaigns, hoveredCard } = state;

    useEffect(() => {
        if (!currentUser) return;

        const load = async () => {
            try {
                dispatch({ type: ACTIONS.SET_LOADING, payload: true });
                const [userProjects, userCampaigns] = await Promise.all([
                    getUserProjects(currentUser.uid),
                    getUserCampaigns(currentUser.uid)
                ]);

                const expandedCampaigns = await Promise.all(userCampaigns.map(async (c) => {
                    const sends = await getCampaignSends(c.id);
                    const opened = sends.filter(s => s.opened).length;
                    const totalSent = c.totalSent || sends.length;
                    return {
                        ...c,
                        totalSent,
                        opened,
                        notOpened: Math.max(0, totalSent - opened),
                        yieldVal: totalSent > 0 ? Math.round((opened / totalSent) * 100) : 0
                    };
                }));

                dispatch({
                    type: ACTIONS.SET_DATA,
                    payload: {
                        projects: userProjects,
                        campaigns: expandedCampaigns.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
                    }
                });
            } catch (err) {
                console.error('[Dashboard] load error:', err);
                dispatch({ type: ACTIONS.SET_LOADING, payload: false });
            }
        };

        load();
    }, [currentUser]);

    const aggregateStats = useMemo(() => {
        let sent = 0, opened = 0, replied = 0, leads = 0;
        projects.forEach(p => {
            if (p.stats) {
                sent += (p.stats.totalSent || 0);
                opened += (p.stats.totalOpened || 0);
                replied += (p.stats.totalReplied || 0);
                leads += (p.stats.totalLeads || 0);
            }
        });
        return { sent, opened, replied, leads, ratio: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0' };
    }, [projects]);

    const stats = [
        {
            id: 1,
            label: 'Eligible for Follow-up',
            value: aggregateStats.opened,
            description: 'Recipients who opened and await next step',
            icon: 'fa-user-check',
            gradient: 'from-blue-500 to-indigo-500',
            percentage: aggregateStats.sent > 0 ? (aggregateStats.opened / aggregateStats.sent) * 100 : 0
        },
        {
            id: 2,
            label: 'Outreach Stopped',
            value: aggregateStats.sent - aggregateStats.opened,
            description: 'Automatically halted (No initial open)',
            icon: 'fa-hand-paper',
            gradient: 'from-orange-500 to-red-500',
            percentage: aggregateStats.sent > 0 ? ((aggregateStats.sent - aggregateStats.opened) / aggregateStats.sent) * 100 : 0
        },
        {
            id: 3,
            label: 'Initial Open Ratio',
            value: `${aggregateStats.ratio}%`,
            description: 'Primary conversion signal',
            icon: 'fa-envelope-open-text',
            gradient: 'from-emerald-500 to-teal-500',
            percentage: parseFloat(aggregateStats.ratio)
        },
        {
            id: 4,
            label: 'Replied Leads',
            value: aggregateStats.replied,
            description: 'Conversations started',
            icon: 'fa-reply',
            gradient: 'from-purple-500 to-pink-500',
            percentage: aggregateStats.opened > 0 ? (aggregateStats.replied / aggregateStats.opened) * 100 : 0
        }
    ]

    const quickActions = [
        {
            id: 1,
            title: 'View Eligible Leads',
            description: 'Manage leads who engaged with your first email',
            icon: 'fa-users',
            gradient: 'from-indigo-500 to-purple-600',
            iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            path: '/dashboard/leads?filter=opened'
        },
        {
            id: 2,
            title: 'Start New Outreach',
            description: 'Send initial emails to new prospects',
            icon: 'fa-paper-plane',
            gradient: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            path: '/dashboard/campaigns/create'
        }
    ]

    return (
        <div className="min-h-screen space-y-8">
            {/* Page Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 lg:p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-brand opacity-10 blur-3xl -translate-y-1/2" />

                <div className="relative z-10">
                    <TitleComponent type="h1" className="text-white text-4xl font-bold mb-2 bg-gradient-brand bg-clip-text text-transparent">
                        Outreach Signals
                    </TitleComponent>
                    <TitleComponent type="p" size="lg" className="text-slate-400">
                        Monitor engagement-based outreach status and identified opportunities.
                    </TitleComponent>
                </div>
            </div>

            {/* Stats Grid - Focused on Decision Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-100 hover:shadow-xl transition-all duration-300"
                        onMouseEnter={() => dispatch({ type: ACTIONS.SET_HOVERED, payload: stat.id })}
                        onMouseLeave={() => dispatch({ type: ACTIONS.SET_HOVERED, payload: null })}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <TitleComponent type="p" size="small" className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                        {stat.label}
                                    </TitleComponent>
                                    <TitleComponent type="h2" className="text-slate-900 text-3xl font-bold">
                                        {stat.value}
                                    </TitleComponent>
                                </div>
                                <div className={`size-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                                    <i className={`fas ${stat.icon} text-white text-xl`} />
                                </div>
                            </div>
                            <TitleComponent type="p" size="small" className="text-slate-500 mb-4">
                                {stat.description}
                            </TitleComponent>
                            <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full bg-gradient-brand rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: hoveredCard === stat.id ? `${stat.percentage}%` : '50%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign Comparison Table */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-100">
                <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <TitleComponent type="h3" className="text-slate-900 text-xl font-bold">
                        Outreach Performance
                    </TitleComponent>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="border-b border-slate-200 text-left">
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Campaign</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Sent</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Opened (Eligible)</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase">Not Opened (Stopped)</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm uppercase text-right">Yield</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400">Loading campaign signals...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr><td colSpan="5" className="py-10 text-center text-slate-400">No campaigns launched yet.</td></tr>
                            ) : campaigns.map((campaign) => (
                                <tr
                                    key={campaign.id}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:bg-slate-50"
                                    onClick={() => navigate(`/dashboard/campaigns/` + campaign.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`/dashboard/campaigns/` + campaign.id);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <td className="py-4 px-6 font-medium text-slate-900">{campaign.name}</td>
                                    <td className="py-4 px-6 text-slate-600">{campaign.totalSent}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-emerald-600 font-semibold">{campaign.opened}</span>
                                            <Badge variant="success">Eligible</Badge>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-slate-500">{campaign.notOpened}</span>
                                            <Badge variant="default">Stopped</Badge>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                                        {campaign.yieldVal}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {quickActions.map((action) => (
                    <div
                        key={action.id}
                        onClick={() => navigate(action.path)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(action.path);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-premium hover:shadow-xl border border-slate-100 transition-all duration-300 cursor-pointer p-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <div className="flex items-center space-x-6">
                            <div className={`size-16 rounded-lg ${action.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                                <i className={`fas ${action.icon} text-white text-2xl`} />
                            </div>
                            <div className="flex-1">
                                <TitleComponent type="h3" className="text-slate-900 font-bold text-xl mb-1">
                                    {action.title}
                                </TitleComponent>
                                <TitleComponent type="p" size="base" className="text-slate-500">
                                    {action.description}
                                </TitleComponent>
                            </div>
                            <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DashboardPage;
