
import React from 'react';
import type { Project, ProjectModule, Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Heart, CheckCircle2, AlertCircle, Clock, Users, Target, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProjectHealthWidgetProps {
    project: Project;
    modules: ProjectModule[];
    tasks: Task[];
    isExpanded: boolean;
    onToggle: () => void;
}

const StatRow: React.FC<{ label: string, value: string | number, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/[0.08] transition-all">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 shadow-inner`}>
                <Icon size={14} className={color} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors whitespace-nowrap">{label}</span>
        </div>
        <span className={`text-xs font-black tracking-tight ${color}`}>{value}</span>
    </div>
);

const ProjectHealthWidget: React.FC<ProjectHealthWidgetProps> = ({ project, modules, tasks, isExpanded, onToggle }) => {
    const { theme } = useTheme();

    const completedTasks = tasks.filter(t => t.status === 'CONCLUIDO').length;
    const overdueTasks = tasks.filter(t => t.status !== 'CONCLUIDO' && new Date(t.dueDate) < new Date()).length;
    const upcomingTasks = tasks.filter(t => t.status !== 'CONCLUIDO' && new Date(t.dueDate) >= new Date()).length;
    const completedModules = modules.filter(m => {
        const modTasks = tasks.filter(t => t.moduleId === m.id);
        return modTasks.length > 0 && modTasks.every(t => t.status === 'CONCLUIDO');
    }).length;

    const members = [
        { name: 'Alice', role: 'Design', completion: 85 },
        { name: 'Bob', role: 'Copy', completion: 60 },
        { name: 'Carlos', role: 'Dev', completion: 92 },
    ];

    const healthScore = tasks.length > 0 ? Math.round(((completedTasks / tasks.length) * 80) + ((completedModules / (modules.length || 1)) * 20)) : 0;

    return (
        <div 
            className={`
                rounded-[2.5rem] border backdrop-blur-xl transition-all duration-700 ease-in-out overflow-hidden shadow-2xl flex
                ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-black/40 border-white/5'}
                ${isExpanded ? 'w-[750px]' : 'w-72'} h-full
            `}
        >
            {/* Main Score Column (Always Visible) */}
            <div className="w-72 flex-shrink-0 p-8 flex flex-col items-center justify-between border-r border-white/5">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-lg animate-pulse mb-4">
                        <Heart size={24} />
                    </div>
                    <h3 className="text-lg font-black tracking-tighter text-white uppercase leading-none">Saúde</h3>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Live Status</p>
                </div>

                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <circle 
                            cx="50" cy="50" r="45" 
                            stroke="#10b981" 
                            strokeWidth="8" 
                            fill="transparent"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * healthScore) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{healthScore}%</span>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Global</span>
                    </div>
                </div>

                <button 
                    onClick={onToggle}
                    className={`
                        w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                        ${theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
                    `}
                >
                    {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    {isExpanded ? 'Recolher' : 'Análise Completa'}
                </button>
            </div>

            {/* Expansion Section (Visible when isExpanded) */}
            <div className={`flex-1 transition-opacity duration-700 flex overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full p-8 flex gap-8">
                    {/* Metrics Sub-column */}
                    <div className="flex-1 space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                             <Target size={12} /> Diagnóstico Técnico
                        </h4>
                        <StatRow label="Concluídas" value={completedTasks} icon={CheckCircle2} color="text-emerald-400" />
                        <StatRow label="Em Atraso" value={overdueTasks} icon={AlertCircle} color="text-rose-500" />
                        <StatRow label="A Vencer" value={upcomingTasks} icon={Clock} color="text-yellow-500" />
                        <StatRow label="Módulos OK" value={`${completedModules}/${modules.length}`} icon={Target} color="text-blue-400" />
                    </div>

                    {/* Team Sub-column */}
                    <div className="flex-1 border-l border-white/5 pl-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                            <Users size={12} /> Squad Velocity
                        </h4>
                        <div className="space-y-6">
                            {members.map(member => (
                                <div key={member.name} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">{member.name.substring(0,1)}</div>
                                            <div>
                                                <p className="text-xs font-bold text-white">{member.name}</p>
                                                <p className="text-[8px] font-black text-white/30 uppercase">{member.role}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-500">{member.completion}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${member.completion}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectHealthWidget;
