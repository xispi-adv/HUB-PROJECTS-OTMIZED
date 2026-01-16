
import React, { useState, useCallback, useMemo } from 'react';
import { useTaskManager } from '../context/TaskManagerContext';
import { useClients } from '../context/ClientContext';
import { Sparkles, Zap, ClipboardList } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface TaskModalProps {
    task?: Task | null;
    status?: TaskStatus; 
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, status, onClose }) => {
    const { addTask, updateTask, selectedProjectId, deleteTask, modules, projects } = useTaskManager();
    const { clients } = useClients();
    
    const projectModules = useMemo(() => modules.filter(m => m.projectId === (task?.projectId || selectedProjectId)), [modules, task, selectedProjectId]);
    const currentProject = useMemo(() => projects.find(p => p.id === (task?.projectId || selectedProjectId)), [projects, task, selectedProjectId]);

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'MEDIA',
        dueDate: task?.dueDate || '',
        assignee: task?.assignee || '',
        status: task?.status || status || 'A_FAZER',
        moduleId: task?.moduleId || projectModules[0]?.id || '',
        category: task?.category || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pid = task?.projectId || selectedProjectId;
        if (!pid) return;

        if (task) { 
            updateTask(task.id, {
                ...formData,
                priority: formData.priority as TaskPriority,
                status: formData.status as TaskStatus,
            });
        } else {
            addTask({
                ...formData,
                priority: formData.priority as TaskPriority,
                status: formData.status as TaskStatus,
                projectId: pid,
            });
        }
        onClose();
    };

    const handleDelete = useCallback(() => {
        if (task && window.confirm(`Excluir tarefa "${task.title}"?`)) {
            deleteTask(task.id);
            onClose();
        }
    }, [task, deleteTask, onClose]);

    const handleFastRegister = () => {
        // Implementação futura: Abrir ActivityDrawer com pré-preenchimento
        alert(`Registro Rápido acionado para:\nTarefa: ${formData.title}\nMódulo: ${projectModules.find(m => m.id === formData.moduleId)?.name}\nProjeto: ${currentProject?.name}`);
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
            <div className="bg-[#09090b] border border-white/10 w-full max-w-xl m-4 p-8 rounded-[2.5rem] shadow-2xl shadow-black flex flex-col relative overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 blur-[80px] pointer-events-none"></div>
                
                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                             <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-1 block">Task Orchestration</span>
                             <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{task ? 'Editar Entrega' : 'Nova Entrega'}</h2>
                        </div>
                        {task && (
                            <button type="button" onClick={handleDelete} className="text-white/20 hover:text-red-500 transition-colors p-2">
                                <Zap size={20} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="O que precisa ser entregue?"
                                className="w-full bg-transparent border-b-2 border-white/5 py-3 text-xl font-bold text-white placeholder-white/5 focus:outline-none focus:border-rose-500 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <div className="group">
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Módulo Vinculado</label>
                                <select
                                    name="moduleId"
                                    value={formData.moduleId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-b border-white/10 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer"
                                >
                                    {projectModules.map(m => <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>)}
                                    {projectModules.length === 0 && <option value="" className="bg-zinc-900">Sem módulos</option>}
                                </select>
                            </div>
                            <InputField label="Categoria (Tag)" name="category" value={formData.category} onChange={handleChange} placeholder="Ex: Criativos, Site..." />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <SelectField 
                                label="Prioridade" 
                                name="priority" 
                                value={formData.priority} 
                                onChange={handleChange}
                                options={[
                                    { value: 'URGENTE', label: 'Urgente' },
                                    { value: 'ALTA', label: 'Alta' },
                                    { value: 'MEDIA', label: 'Média' },
                                    { value: 'BAIXA', label: 'Baixa' },
                                ]}
                            />
                             <SelectField 
                                label="Status de Fluxo" 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange}
                                options={[
                                    { value: 'A_FAZER', label: 'Backlog' },
                                    { value: 'EM_ANDAMENTO', label: 'In Progress' },
                                    { value: 'CONCLUIDO', label: 'Review / Done' },
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                             <InputField label="Responsável" name="assignee" value={formData.assignee} onChange={handleChange} placeholder="Responsável" />
                             <InputField label="Data de Entrega" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                        </div>

                        <div className="relative">
                            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Escopo Detalhado</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Instruções e critérios de aceite..."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm text-white/80 placeholder-white/5 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all resize-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <button 
                            type="button" 
                            onClick={handleFastRegister}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
                        >
                            <ClipboardList size={14} />
                            <span>Registro Fácil</span>
                        </button>
                        
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Cancelar</button>
                            <button type="submit" className="px-10 py-3 rounded-xl bg-white text-black hover:bg-rose-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95">
                                {task ? 'Efetivar' : 'Lançar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: any, type?:string, required?: boolean, placeholder?: string}> = ({ label, name, value, onChange, type='text', required = false, placeholder }) => (
    <div className="group">
        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-sm font-bold text-white placeholder-white/5 focus:outline-none focus:border-rose-500 transition-colors"
        />
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({ label, name, value, onChange, options }) => (
    <div className="group">
        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-white/10 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer"
        >
            {options.map(opt => <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>)}
        </select>
    </div>
);

export default TaskModal;
