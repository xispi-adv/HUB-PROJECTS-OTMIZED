
import React, { useMemo } from 'react';
import type { ProjectModule, Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
// Added Activity to the lucide-react imports
import { X, Layout, Clock, User, Trash2, ExternalLink, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

interface ModuleDetailModalProps {
    module: ProjectModule;
    tasks: Task[];
    onClose: () => void;
    onOpenBoard: () => void;
    onDelete: () => void;
}

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ module, tasks, onClose, onOpenBoard, onDelete }) => {
    const { theme } = useTheme();

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'CONCLUIDO').length;
        const overdue = tasks.filter(t => t.status !== 'CONCLUIDO' && new Date(t.dueDate) < new Date()).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, overdue, progress };
    }, [tasks]);

    const priorityColors = {
        URGENTE: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        ALTA: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        MEDIA: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        BAIXA: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[80] animate-fade-in" onClick={onClose}>
            <div className="bg-[#09090b] border border-white/10 w-full max-w-2xl m-4 rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${module.priority === 'URGENTE' ? 'from-rose-600 to-rose-400' : 'from-blue-600 to-blue-400'}`}></div>
                
                <header className="p-8 pb-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-white/5 text-white/20 border-white/5'}`}>
                            <Layout size={24} strokeWidth={2} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Módulo Estratégico</span>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{module.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Tarefas" value={stats.total} icon={<Clock size={16} />} />
                        <StatCard label="Concluídas" value={stats.completed} icon={<CheckCircle2 size={16} />} color="text-emerald-500" />
                        <StatCard label="Em Atraso" value={stats.overdue} icon={<AlertCircle size={16} />} color={stats.overdue > 0 ? "text-rose-500" : "text-white/20"} />
                        {/* icon is now available because of the added import above */}
                        <StatCard label="Conclusão" value={`${stats.progress}%`} icon={<Activity size={16} />} color="text-blue-500" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Escopo do Módulo</label>
                             <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                <p className="text-white/70 leading-relaxed text-sm font-medium">{module.description}</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Arquiteto</label>
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-black text-white">
                                        {module.createdBy.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-white/80">{module.createdBy}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Prioridade</label>
                                <div className={`flex items-center justify-center h-full p-4 rounded-2xl border font-black text-xs uppercase tracking-widest ${priorityColors[module.priority]}`}>
                                    {module.priority}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <button 
                        onClick={onDelete}
                        className="p-3 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                        <Trash2 size={16} /> Apagar Módulo
                    </button>
                    
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">Cancelar</button>
                        <button 
                            onClick={onOpenBoard}
                            className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:bg-rose-500 hover:text-white transform active:scale-95"
                        >
                            Acessar Quadro <ExternalLink size={14} />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: any, color?: string }> = ({ label, value, icon, color = "text-white" }) => (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-white/20 mb-1">
            {icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-xl font-black tracking-tighter ${color}`}>{value}</span>
    </div>
);

export default ModuleDetailModal;
