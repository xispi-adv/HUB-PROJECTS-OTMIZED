
import React, { useState } from 'react';
import { useTaskManager } from '../../context/TaskManagerContext';
import { X, FolderPlus } from 'lucide-react';

interface ModuleCategoryModalProps {
    projectId: string;
    onClose: () => void;
}

const ModuleCategoryModal: React.FC<ModuleCategoryModalProps> = ({ projectId, onClose }) => {
    const { addModuleCategory } = useTaskManager();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addModuleCategory({ name, projectId });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] animate-fade-in" onClick={onClose}>
            <div className="bg-[#09090b] border border-white/10 w-full max-w-sm m-4 p-8 rounded-[2.5rem] shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><FolderPlus size={20} /></div>
                        <h2 className="text-xl font-black tracking-tight text-white uppercase">Nova Categoria</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/20 hover:text-white"><X size={20} /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Nome da Categoria</label>
                        <input 
                            autoFocus 
                            required
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Ex: Branding, Social, Tech..." 
                            className="w-full bg-transparent border-b-2 border-white/10 py-3 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all placeholder-white/5" 
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white shadow-lg transition-all">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModuleCategoryModal;
