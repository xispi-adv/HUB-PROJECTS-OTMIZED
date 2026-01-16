
import React, { useState } from 'react';
import { useTaskManager } from '../../context/TaskManagerContext';
import { useTheme } from '../../context/ThemeContext';
import { X, Send, Target, Layout } from 'lucide-react';
import type { TaskPriority } from '../../types';

interface ModuleModalProps {
    projectId: string;
    onClose: () => void;
}

const ModuleModal: React.FC<ModuleModalProps> = ({ projectId, onClose }) => {
    const { addModule, moduleCategories } = useTaskManager();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priority: 'MEDIA' as TaskPriority,
        categoryId: '',
    });

    const categories = moduleCategories.filter(c => c.projectId === projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addModule({
            ...formData,
            projectId,
            createdBy: 'Carlos Teles', // Mock user
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] animate-fade-in" onClick={onClose}>
            <div className="bg-[#09090b] border border-white/10 w-full max-w-lg m-4 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-900 to-rose-600"></div>
                
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500"><Layout size={24} strokeWidth={2.5} /></div>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Novo Módulo</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors"><X size={24} /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="group">
                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Identificação do Módulo</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Ex: Identidade Visual"
                            className="w-full bg-transparent border-b-2 border-white/5 py-3 text-xl font-bold text-white focus:border-rose-500 outline-none transition-all placeholder-white/5"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                         <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Vincular Categoria</label>
                            <select 
                                value={formData.categoryId}
                                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-rose-500 cursor-pointer"
                            >
                                <option value="" className="bg-black">Geral</option>
                                {categories.map(c => <option key={c.id} value={c.id} className="bg-black">{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Prioridade</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-rose-500 cursor-pointer"
                            >
                                <option value="URGENTE" className="bg-black">Urgente</option>
                                <option value="ALTA" className="bg-black">Alta</option>
                                <option value="MEDIA" className="bg-black">Média</option>
                                <option value="BAIXA" className="bg-black">Baixa</option>
                            </select>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Escopo do Módulo</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            placeholder="Descreva o propósito e frentes deste módulo..."
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm font-medium text-white/70 focus:border-rose-500 outline-none resize-none transition-all shadow-inner"
                        />
                    </div>
                    
                    <footer className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Abortar</button>
                        <button type="submit" className="bg-white text-black hover:bg-rose-500 hover:text-white px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 flex items-center gap-2">
                            <Send size={14} /> Ativar Módulo
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ModuleModal;
