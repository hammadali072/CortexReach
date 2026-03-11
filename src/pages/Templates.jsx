import { useMemo } from 'react'
import TitleComponent from '../components/titleComponent/titleComponent'
import Badge from '../components/ui/Badge'
import { ALL_TEMPLATES } from '../emails'

const Templates = () => {
    const templates = useMemo(() => ALL_TEMPLATES, [])

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <TitleComponent type="h1" className="text-3xl font-bold">Email Templates</TitleComponent>
                    <p className="text-slate-500 mt-1">High-converting outreach sequences powered by React Email.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                        <div className="p-8 flex-grow">
                            <div className="flex justify-between items-start mb-6">
                                <Badge variant="secondary" className={`${t.color} border-none`}>
                                    {t.name}
                                </Badge>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <i className={`fas ${t.icon}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{t.name}</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Capabilities</p>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4">{t.description}</p>
                                </div>
                                <div className="pt-4 flex flex-wrap gap-2">
                                    <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Personalization</span>
                                    <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Responsive</span>
                                    <span className="text-[8px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Optimized</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50/50 px-8 py-4 flex justify-between items-center border-t border-slate-50">
                            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase flex items-center gap-2">
                                <i className="fas fa-check-circle text-[10px]" /> System Ready
                            </span>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <i className="fas fa-magic text-[8px] text-indigo-500" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <i className="fas fa-bolt text-[8px] text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Templates
