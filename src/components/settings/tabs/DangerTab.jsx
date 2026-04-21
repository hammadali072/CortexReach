import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';

const DangerTab = ({ setModal }) => {
    const dangerActions = [
        {
            id: 'logout',
            title: 'Sign Out',
            desc: 'Disconnect from this device. Your data remains perfectly safe.',
            icon: LogOut,
            btnLabel: 'Sign Out',
            btnClass: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
            iconClass: 'bg-slate-50 text-slate-400 group-hover:bg-white-tint group-hover:text-primary',
            containerClass: 'bg-white border-slate-200'
        },
        {
            id: 'purge_leads',
            title: 'Purge All Leads',
            desc: 'Permanently deletes every lead from every project. Active campaigns will stop.',
            icon: Trash2,
            btnLabel: 'Purge Leads',
            btnClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-100',
            iconClass: 'bg-red-50 text-red-400 group-hover:bg-red-100 group-hover:text-red-500',
            containerClass: 'bg-red-50/20 border-red-100'
        },
        {
            id: 'delete_account',
            title: 'Delete Full Account',
            desc: 'Everything: projects, leads, campaigns and settings. This cannot be undone.',
            icon: Trash2,
            btnLabel: 'Delete Account',
            btnClass: 'bg-red-600 text-white hover:bg-red-700 shadow-red-100',
            iconClass: 'bg-white/20 text-white',
            containerClass: 'bg-red-600 text-white border-red-200'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="mb-4">
                <h3 className="text-xl font-black text-red-600">Danger Zone</h3>
                <p className="text-sm text-slate-500 mt-1">These actions are destructive and cannot be reversed.</p>
            </div>

            <div className="space-y-4">
                {dangerActions.map(action => (
                    <div 
                        key={action.id}
                        className={`p-6 md:p-8 border rounded-[16px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group ${action.containerClass}`}
                    >
                        <div className="flex items-start gap-5">
                            <div className={`size-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${action.iconClass}`}>
                                <action.icon size={24} />
                            </div>
                            <div>
                                <h4 className={`font-black text-lg ${action.id === 'delete_account' ? 'text-white' : 'text-slate-900'}`}>{action.title}</h4>
                                <p className={`text-sm font-medium mt-1 leading-relaxed ${action.id === 'delete_account' ? 'text-red-50' : action.id === 'logout' ? 'text-slate-500' : 'text-red-700/60'}`}>
                                    {action.desc}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setModal({ open: true, type: action.id })}
                            className={`h-14 px-8 rounded-[12px] font-black text-sm transition-all min-w-[160px] border ${action.btnClass}`}
                        >
                            {action.btnLabel}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DangerTab;


