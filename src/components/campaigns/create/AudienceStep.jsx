import React from 'react';
import DataTable from 'react-data-table-component';
import Badge from '../../ui/Badge';

const AudienceStep = ({ 
    projectName, 
    leads, 
    selectedRows, 
    onSelectionChange 
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Target Audience</h3>
                    <p className="text-xs text-slate-500">Only showing leads from project "{projectName}"</p>
                </div>
                <Badge variant="primary">{selectedRows.length} Leads Selected</Badge>
            </div>
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <DataTable
                    columns={[
                        {
                            name: 'Name',
                            selector: r => `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.name || 'N/A',
                            sortable: true,
                            cell: r => <span className="font-bold text-slate-800">{`${r.first_name || ''} ${r.last_name || ''}`.trim() || r.name || 'N/A'}</span>
                        },
                        { name: 'Company', selector: r => r.company_name || r.company || 'N/A', sortable: true },
                        { name: 'Email', selector: r => r.email }
                    ]}
                    data={leads}
                    selectableRows
                    onSelectedRowsChange={onSelectionChange}
                    selectableRowsVisibleOnly
                    highlightOnHover
                    responsive
                    noHeader
                    pagination
                />
            </div>
        </div>
    );
};

export default AudienceStep;
