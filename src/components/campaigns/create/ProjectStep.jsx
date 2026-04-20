import React from 'react';
import Button from '../../ui/Button';

const ProjectStep = ({ 
    dbProjects, 
    loading, 
    error, 
    selectedProjectId, 
    onProjectChange 
}) => {
    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-lg animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching your projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                    <i className="fas fa-exclamation-triangle text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Connection Error</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-xs">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
            </div>
        );
    }

    if (dbProjects.length === 0) {
        return (
            <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                    <i className="fas fa-folder-open text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-xs">You need at least one project to launch a campaign.</p>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard/projects/create'}>Create Project</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pt-4">
            <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 font-idGrotesk uppercase tracking-tight">Select Project</h2>
                <p className="text-slate-500 mt-2 italic text-sm">Target one of your existing workspaces.</p>
            </div>

            <div className="max-w-xl mx-auto space-y-10">
                <div className="space-y-3">
                    <label 
                        htmlFor="project-select" 
                        className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1"
                    >
                        Project Workspace
                    </label>
                    <div className="relative">
                        <select
                            id="project-select"
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-700 text-lg shadow-inner appearance-none cursor-pointer"
                            value={selectedProjectId}
                            onChange={(e) => onProjectChange(e.target.value)}
                        >
                            <option value="">Select a project from the list...</option>
                            {dbProjects.map(p => (
                                <option key={`proj-opt-${p.id}`} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <i className="fas fa-chevron-down" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStep;
