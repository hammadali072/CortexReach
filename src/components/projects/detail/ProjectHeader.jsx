import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../ui/Badge';
import TitleComponent from '../../titleComponent/titleComponent';
import Button from '../../ui/Button';

const ProjectHeader = ({ project, id }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4">
            <div>
                <div className="flex items-center gap-3 mb-2 px-1">
                    <Badge variant="primary">WORKSPACE</Badge>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{project.type}</span>
                </div>
                <TitleComponent type="h1" className="text-slate-900 text-5xl font-black font-idGrotesk uppercase tracking-tighter leading-none">
                    {project.name}
                </TitleComponent>
            </div>
            <Link to={`/dashboard/campaigns/create?projectId=${id}`}>
                <Button variant="primary" className="h-auto py-5 px-10 text-lg font-bold rounded-2xl group">
                    Launch Project Campaign
                    <i className="fas fa-arrow-right ml-3 text-xs opacity-50 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
        </div>
    );
};

export default ProjectHeader;
