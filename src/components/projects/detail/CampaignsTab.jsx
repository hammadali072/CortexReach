import React from 'react';
import DataTable from 'react-data-table-component';

const CampaignsTab = ({ campaigns, columns, tableStyles }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Related Campaigns</h3>
                    <p className="text-sm text-slate-500 font-medium">Outreach sequences established for this project scope.</p>
                </div>
            </div>
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <DataTable
                    columns={columns}
                    data={campaigns}
                    customStyles={tableStyles}
                    highlightOnHover 
                    responsive 
                    noHeader
                    noDataComponent={
                        <div className="py-20 text-center">
                            <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                <i className="fas fa-bullhorn text-2xl" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">No campaigns yet</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default CampaignsTab;



