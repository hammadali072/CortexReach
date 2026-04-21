import React from 'react';

const ProjectStats = ({ stats, leadsCount, campaignsCount }) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {[
                { label: 'Total Leads', value: leadsCount, icon: 'fa-users', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', subtext: 'text-indigo-500' },
                { label: 'CSV/XLSX', value: stats.csvCount || 0, icon: 'fa-file-import', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', subtext: 'text-emerald-500' },
                { label: 'Emails Sent', value: stats.totalSent || 0, icon: 'fa-paper-plane', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', subtext: 'text-purple-500' },
            ].map(stat => (
                <div key={stat.label} className={`p-4 ${stat.bg} border ${stat.border} rounded-lg shadow-sm transition-all hover:shadow-md`}>
                    <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
                    <p className={`text-[10px] font-bold ${stat.subtext} uppercase tracking-widest mt-1`}>{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default ProjectStats;



