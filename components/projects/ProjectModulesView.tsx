
import React, { useState, useMemo, useEffect } from 'react';
import { useTaskManager } from '../../context/TaskManagerContext';
import { useTheme } from '../../context/ThemeContext';
import type { Project, ProjectModule, ModuleCategory } from '../../types';
import ModuleCard from './ModuleCard';
import ProjectHealthWidget from './ProjectHealthWidget';
import ModuleModal from './ModuleModal';
import ModuleCategoryModal from './ModuleCategoryModal';
import ModuleDetailModal from './ModuleDetailModal';
import { Plus, ChevronLeft, Search, FolderPlus, Activity, List, LayoutGrid } from 'lucide-react';

interface ProjectModulesViewProps {
    project: Project;
    onBack: () => void;
    onNavigateToTasks: (moduleId: string) => void;
    onSidebarCollapse: (collapsed: boolean) => void;
}

const ProjectModulesView: React.FC<ProjectModulesViewProps> = ({ project, onBack, onNavigateToTasks, onSidebarCollapse }) => {
    const { modules, moduleCategories, tasks, deleteModule, selectModule, moveModuleToCategory } = useTaskManager();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [detailModuleId, setDetailModuleId] = useState<string | null>(null);
    const [dragOverCat, setDragOverCat] = useState<string | null>(null);
    const [isHealthExpanded, setIsHealthExpanded] = useState(false);

    const projectModules = useMemo(() => modules.filter(m => m.projectId === project.id), [modules, project.id]);
    const categories = useMemo(() => moduleCategories.filter(c => c.projectId === project.id), [moduleCategories, project.id]);

    const filteredModules = projectModules.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 1.1 - Sidebar recolhe ao expandir saúde
    // 1.2 - Visualização muda para lista ao expandir saúde
    useEffect(() => {
        if (isHealthExpanded) {
            onSidebarCollapse(true);
            setViewMode('list');
        } else {
            onSidebarCollapse(false);
            setViewMode('grid');
        }
    }, [isHealthExpanded, onSidebarCollapse]);

    const handleModuleSelect = (moduleId: string) => {
        selectModule(moduleId);
        onNavigateToTasks(moduleId);
    };

    const handleOpenDetail = (moduleId: string) => {
        setDetailModuleId(moduleId);
    };

    const handleDrop = (e: React.DragEvent, categoryId: string | undefined) => {
        e.preventDefault();
        const moduleId = e.dataTransfer.getData('moduleId');
        if (moduleId) {
            moveModuleToCategory(moduleId, categoryId);
        }
        setDragOverCat(null);
    };

    const handleDragOver = (e: React.DragEvent, categoryId: string | null) => {
        e.preventDefault();
        setDragOverCat(categoryId);
    };

    const detailModule = useMemo(() => 
        projectModules.find(m => m.id === detailModuleId), 
    [projectModules, detailModuleId]);

    const renderModules = (mods: ProjectModule[]) => (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
            {mods.map(m => (
                <ModuleCard 
                    key={m.id} 
                    module={m} 
                    tasks={tasks.filter(t => t.moduleId === m.id)} 
                    onSelect={() => handleModuleSelect(m.id)}
                    onExpand={() => handleOpenDetail(m.id)}
                    onDelete={() => { if(confirm('Excluir módulo?')) deleteModule(m.id) }}
                    viewMode={viewMode}
                />
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className={`p-3 transition-all rounded-2xl shadow-sm ${theme === 'light' ? 'bg-white text-slate-400 hover:text-rose-600 border border-slate-200' : 'bg-[var(--bg-elevation-2)] text-gray-500 hover:text-white border border-white/5'}`}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-rose-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">MÓDULOS DO PROJETO</span>
                        </div>
                        <h1 className={`text-4xl font-light tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{project.name}</h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar módulo..."
                            className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 focus:border-blue-500' : 'bg-[var(--bg-elevation-1)] border-white/10 focus:border-[var(--accent-color)] text-white'}`}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    </div>
                    
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button onClick={() => setIsCatModalOpen(true)} className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                        <FolderPlus size={18} /> Categoria
                    </button>
                    <button onClick={() => setIsModuleModalOpen(true)} className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Plus size={18} /> Novo Módulo
                    </button>
                </div>
            </header>

            <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
                <div className="flex-shrink-0">
                    <ProjectHealthWidget 
                        project={project} 
                        modules={projectModules} 
                        tasks={tasks}
                        isExpanded={isHealthExpanded}
                        onToggle={() => setIsHealthExpanded(!isHealthExpanded)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {categories.length > 0 ? (
                        <div className="space-y-10">
                            {categories.map(cat => {
                                const catModules = filteredModules.filter(m => m.categoryId === cat.id);
                                const isTarget = dragOverCat === cat.id;
                                return (
                                    <div 
                                        key={cat.id}
                                        onDragOver={(e) => handleDragOver(e, cat.id)}
                                        onDragLeave={() => setDragOverCat(null)}
                                        onDrop={(e) => handleDrop(e, cat.id)}
                                        className={`transition-all duration-300 rounded-[3rem] p-4 ${isTarget ? 'bg-rose-500/5 ring-2 ring-rose-500/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-px flex-1 bg-[var(--border-color)] opacity-20"></div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">{cat.name}</h3>
                                            <div className="h-px flex-1 bg-[var(--border-color)] opacity-20"></div>
                                        </div>
                                        {renderModules(catModules)}
                                    </div>
                                );
                            })}
                            {filteredModules.some(m => !m.categoryId) && (
                                <div 
                                    onDragOver={(e) => handleDragOver(e, 'default')}
                                    onDragLeave={() => setDragOverCat(null)}
                                    onDrop={(e) => handleDrop(e, undefined)}
                                    className={`transition-all duration-300 rounded-[3rem] p-4 ${dragOverCat === 'default' ? 'bg-blue-500/5 ring-2 ring-blue-500/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-px flex-1 bg-[var(--border-color)] opacity-20"></div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Sem Categoria</h3>
                                        <div className="h-px flex-1 bg-[var(--border-color)] opacity-20"></div>
                                    </div>
                                    {renderModules(filteredModules.filter(m => !m.categoryId))}
                                </div>
                            )}
                        </div>
                    ) : (
                        renderModules(filteredModules)
                    )}
                    {filteredModules.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                            <Activity size={48} className="mb-4" />
                            <p className="text-xl font-black uppercase tracking-widest">Nenhum módulo detectado</p>
                        </div>
                    )}
                </div>
            </div>

            {isModuleModalOpen && <ModuleModal projectId={project.id} onClose={() => setIsModuleModalOpen(false)} />}
            {isCatModalOpen && <ModuleCategoryModal projectId={project.id} onClose={() => setIsCatModalOpen(false)} />}
            {detailModule && (
                <ModuleDetailModal 
                    module={detailModule} 
                    tasks={tasks.filter(t => t.moduleId === detailModule.id)} 
                    onClose={() => setDetailModuleId(null)} 
                    onOpenBoard={() => handleModuleSelect(detailModule.id)}
                    onDelete={() => {
                        if(confirm('Excluir módulo?')) {
                            deleteModule(detailModule.id);
                            setDetailModuleId(null);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ProjectModulesView;
