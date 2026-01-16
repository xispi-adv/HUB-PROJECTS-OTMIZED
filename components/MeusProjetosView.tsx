
import React, { useState, useMemo } from 'react';
import { useTaskManager } from '../context/TaskManagerContext';
import { useTheme } from '../context/ThemeContext';
import type { ProjectGroup, Project } from '../types';
import ProjectModal from './ProjectModal';
import ProjectGroupModal from './ProjectGroupModal';
import ProjectCard from './ProjectCard';
import ProjectGroupCard from './ProjectGroupCard';
import ProjectModulesView from './projects/ProjectModulesView';
import { Plus, ChevronLeft, FolderPlus, Pin, ShieldCheck, Search, X } from 'lucide-react';

interface MeusProjetosViewProps {
    setActiveView: (view: string) => void;
    onSidebarCollapse: (collapsed: boolean) => void;
}

const MeusProjetosView: React.FC<MeusProjetosViewProps> = ({ setActiveView, onSidebarCollapse }) => {
    const { projectGroups, projects, selectProject, togglePinProject, togglePinProjectGroup, selectedProjectId } = useTaskManager();
    const { theme } = useTheme();
    const [selectedGroup, setSelectedGroup] = useState<ProjectGroup | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);

    const handleVisitProject = (projectId: string) => {
        selectProject(projectId);
    };

    const handleBackToProjects = () => {
        selectProject('');
        onSidebarCollapse(false);
    };

    const filteredGroups = useMemo(() => {
        if (!searchQuery) return projectGroups;
        const query = searchQuery.toLowerCase();
        return projectGroups.filter(group => {
            const groupMatch = group.name.toLowerCase().includes(query) || group.description?.toLowerCase().includes(query);
            const projectMatch = projects.some(p => p.groupId === group.id && (p.name.toLowerCase().includes(query) || p.summary.toLowerCase().includes(query)));
            return groupMatch || projectMatch;
        });
    }, [projectGroups, projects, searchQuery]);

    const groupListContent = useMemo(() => ({
        pinned: filteredGroups.filter(g => g.isPinned),
        regular: filteredGroups.filter(g => !g.isPinned)
    }), [filteredGroups]);

    const projectListContent = useMemo(() => {
        if (!selectedGroup) return { pinned: [], regular: [] };
        const query = searchQuery.toLowerCase();
        const filtered = projects.filter(p => {
            const isFromGroup = p.groupId === selectedGroup.id;
            if (!isFromGroup) return false;
            if (!query) return true;
            return p.name.toLowerCase().includes(query) || p.summary.toLowerCase().includes(query);
        });
        return {
            pinned: filtered.filter(p => p.isPinned),
            regular: filtered.filter(p => !p.isPinned)
        };
    }, [projects, selectedGroup, searchQuery]);

    // VIEW: Módulos do Projeto (Nova View Intermediária)
    if (selectedProjectId) {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            return (
                <ProjectModulesView 
                    project={project} 
                    onBack={handleBackToProjects} 
                    onNavigateToTasks={(moduleId) => setActiveView('Tarefas')} 
                    onSidebarCollapse={onSidebarCollapse}
                />
            );
        }
    }

    // VIEW: Projetos de um Grupo
    if (selectedGroup) {
        return (
            <div className="h-full flex flex-col animate-fade-in-up">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-[var(--border-color)] flex-shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => { setSelectedGroup(null); setSearchQuery(''); }} className={`p-3 transition-all rounded-2xl shadow-sm ${theme === 'light' ? 'bg-white text-slate-400 hover:text-rose-600 border border-slate-200' : 'bg-[var(--bg-elevation-2)] text-gray-500 hover:text-white border border-white/5'}`}>
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-rose-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">GRUPO ATIVO</span>
                            </div>
                            <h1 className={`text-5xl font-light tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedGroup.name}</h1>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-80">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar projetos..."
                                className={`w-full pl-11 pr-10 py-3.5 rounded-2xl border text-sm outline-none ${theme === 'light' ? 'bg-white border-slate-200 focus:border-blue-500' : 'bg-[var(--bg-elevation-1)] border-white/10 focus:border-[var(--accent-color)] text-white'}`}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        </div>
                        <button onClick={() => setIsProjectModalOpen(true)} className="bg-[var(--accent-color)] text-white px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                            <Plus size={20} /> Novo Projeto
                        </button>
                    </div>
                </header>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {projectListContent.pinned.map(p => (
                            <ProjectCard key={p.id} project={p} onVisit={handleVisitProject} onEdit={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }} onTogglePin={() => togglePinProject(p.id)} />
                        ))}
                        {projectListContent.regular.map(p => (
                            <ProjectCard key={p.id} project={p} onVisit={handleVisitProject} onEdit={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }} onTogglePin={() => togglePinProject(p.id)} />
                        ))}
                    </div>
                </div>
                {isProjectModalOpen && <ProjectModal groupId={selectedGroup.id} onClose={() => setIsProjectModalOpen(false)} />}
            </div>
        );
    }

    // VIEW: Grupos Principais
    return (
        <div className="h-full flex flex-col animate-fade-in-up">
             <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-[var(--border-color)] flex-shrink-0">
                <div>
                    <h1 className={`text-5xl font-light tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        Grupos de Projetos
                    </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-80">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar grupos..."
                            className={`w-full pl-11 pr-10 py-3.5 rounded-2xl border text-sm outline-none ${theme === 'light' ? 'bg-white border-slate-200 focus:border-blue-500' : 'bg-[var(--bg-elevation-1)] border-white/10 focus:border-[var(--accent-color)] text-white'}`}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                    </div>
                    <button onClick={() => setIsGroupModalOpen(true)} className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-8 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                        <FolderPlus size={20} /> Novo Grupo
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {groupListContent.pinned.map(group => (
                        <ProjectGroupCard key={group.id} group={group} onSelect={() => setSelectedGroup(group)} onEdit={() => { setEditingGroup(group); setIsGroupModalOpen(true); }} onTogglePin={() => togglePinProjectGroup(group.id)} />
                    ))}
                    {groupListContent.regular.map(group => (
                        <ProjectGroupCard key={group.id} group={group} onSelect={() => setSelectedGroup(group)} onEdit={() => { setEditingGroup(group); setIsGroupModalOpen(true); }} onTogglePin={() => togglePinProjectGroup(group.id)} />
                    ))}
                </div>
            </div>

            {isGroupModalOpen && <ProjectGroupModal onClose={() => { setIsGroupModalOpen(false); setEditingGroup(null); }} group={editingGroup} />}
        </div>
    );
};

export default MeusProjetosView;
