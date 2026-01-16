
import React from 'react';
import type { ProjectModule, Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Folder, Trash2, User, Clock, CheckCircle, Maximize2, MoreHorizontal } from 'lucide-react';

interface ModuleCardProps {
    module: ProjectModule;
    tasks: Task[];
    onSelect: () => void;
    onExpand: () => void;
    onDelete: () => void;
    viewMode?: 'grid' | 'list';
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, tasks, onSelect, onExpand, onDelete, viewMode = 'grid' }) => {
    const { theme } = useTheme();
    
    const completedTasksCount = tasks.filter(t => t.status === 'CONCLUIDO').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    const priorityColors = {
        URGENTE: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        ALTA: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        MEDIA: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        BAIXA: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('moduleId', module.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    if (viewMode === 'list') {
        return (
            <div 
                draggable
                onDragStart={handleDragStart}
                className={`
                    w-full flex items-center justify-between p-4 px-6 rounded-2xl border transition-all duration-300 group
                    ${theme === 'light' ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' : 'bg-[#1A1B23] border-white/5 hover:border-white/10 shadow-lg'}
                `}
            >
                <div className="flex items-center gap-5 flex-1 min-w-0" onClick={onExpand} style={{ cursor: 'pointer' }}>
                    <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-white/20'}`}>
                        <Folder size={20} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                        <h3 className={`text-base font-bold truncate tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {module.name}
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${progress === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {progress}% CONCLUSÃO
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-2">
                        <User size={12} className="text-white/20" />
                        <span className="text-[10px] font-bold text-white/40 uppercase">{module.createdBy}</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${priorityColors[module.priority]}`}>
                        {module.priority}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSelect(); }}
                            className="bg-white/5 hover:bg-white/10 text-white/60 p-2 rounded-lg transition-all"
                            title="Abrir Quadro"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onClick={onExpand}
            className={`
                group relative h-64 w-full cursor-pointer perspective-1000
                transition-all duration-500 active:scale-[0.98]
            `}
        >
            {/* Folder Body (Back/Reveal Layer) */}
            <div className={`
                absolute inset-0 rounded-[2.5rem] p-8 z-10 transition-all duration-500 opacity-0 group-hover:opacity-100
                flex flex-col justify-between
                ${theme === 'light' ? 'bg-slate-50' : 'bg-black/60 backdrop-blur-xl'}
            `}>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Diagnóstico Operacional</p>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tighter">Status: Ativo</h4>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onExpand(); }}
                            className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                            title="Ver Detalhes"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                            title="Remover Módulo"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/40 uppercase mb-1">Tarefas</p>
                            <p className="text-sm font-black text-white">{completedTasksCount}/{totalTasks}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-black text-white/40 uppercase mb-1">Conclusão</p>
                            <p className="text-sm font-black text-emerald-500">{progress}%</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-black text-white border-2 border-[var(--bg-main)]">
                            {module.createdBy.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Arquiteto</span>
                            <span className="text-[11px] font-bold text-white/80">{module.createdBy}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Folder Front Cover (Main Layer) */}
            <div className={`
                absolute inset-0 rounded-[2.5rem] border transition-all duration-500 z-20 overflow-hidden shadow-2xl
                ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-[#1A1B23] border-white/5'}
                group-hover:-translate-y-4 group-hover:rotate-x-6 group-hover:origin-bottom
            `}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${module.priority === 'URGENTE' ? 'from-rose-600 to-rose-400' : 'from-blue-600 to-cyan-400'}`}></div>
                
                <div className="p-7 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className={`p-3.5 rounded-2xl ${theme === 'light' ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-white/20 shadow-inner'}`}>
                            <Folder size={22} strokeWidth={1.5} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${priorityColors[module.priority]}`}>
                            {module.priority}
                        </span>
                    </div>

                    <div className="flex-grow flex flex-col justify-end mt-4">
                        <h3 className={`text-xl font-black tracking-tighter mb-2 truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {module.name}
                        </h3>
                        <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                            {module.description}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                         <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">{progress}% Concluído</span>
                         </div>
                         <div className={`p-1.5 rounded-lg ${theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/30'}`}>
                             <MoreHorizontal size={14} />
                         </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-6 { transform: rotateX(-15deg); }
            `}</style>
        </div>
    );
};

export default ModuleCard;
