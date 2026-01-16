
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTaskManager } from '../context/TaskManagerContext';
import { useTheme } from '../context/ThemeContext';
import TaskBoard from './TaskBoard';
import TaskModal from './TaskModal';
import type { Task, TaskStatus } from '../types';

// --- Icons ---
const ChevronDownIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const LayersIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);
const FolderIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);
const ComponentIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
);
const TagIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

// --- Components ---

interface DropdownOption {
    id: string;
    label: string;
}

interface DropdownProps {
    label: string;
    value: string | null;
    options: DropdownOption[];
    onChange: (id: string) => void;
    placeholder: string;
    icon?: React.ReactNode;
}

const DropdownSelect: React.FC<DropdownProps> = ({ label, value, options, onChange, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative w-full sm:w-auto" ref={wrapperRef}>
            <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1.5 ml-1 opacity-60">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 w-full sm:min-w-[180px] justify-between
                    ${isOpen 
                        ? 'bg-[var(--bg-card)] border-[var(--accent-color)] text-[var(--text-primary)] shadow-xl' 
                        : 'bg-[var(--bg-elevation-1)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--text-muted)]'}
                `}
            >
                <div className="flex items-center gap-3 truncate">
                    {icon && <span className="text-[var(--text-muted)] opacity-50 scale-90">{icon}</span>}
                    <span className={`truncate text-xs font-bold tracking-tight ${selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDownIcon />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 mt-2 w-full min-w-[220px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up backdrop-blur-xl">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
                        {options.length > 0 ? (
                            options.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between group mb-1 last:mb-0
                                        ${value === option.id 
                                            ? 'bg-[var(--accent-color)] text-white' 
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevation-1)] hover:text-[var(--text-primary)]'}
                                    `}
                                >
                                    <span>{option.label}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-[10px] text-[var(--text-muted)] text-center font-bold italic">Vazio</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main View ---

const TarefasView: React.FC = () => {
    const { tasks, selectedProjectId, selectedModuleId, projects, projectGroups, modules, selectProject, selectModule } = useTaskManager();
    const { theme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | null>(null);
    
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    useEffect(() => {
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project) {
                setActiveGroupId(project.groupId);
            }
        }
    }, [selectedProjectId, projects]);

    const handleGroupChange = (groupId: string) => {
        setActiveGroupId(groupId);
        selectProject(''); 
        selectModule(null);
    };

    const handleProjectChange = (projectId: string) => {
        selectProject(projectId);
        selectModule(null);
    };

    const handleModuleChange = (moduleId: string) => {
        selectModule(moduleId === 'ALL_MODULES' ? null : moduleId);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setNewTaskStatus(null);
        setIsModalOpen(true);
    };

    const handleNewTask = (status: TaskStatus) => {
        setEditingTask(null);
        setNewTaskStatus(status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setNewTaskStatus(null);
    };

    const filteredProjects = useMemo(() => activeGroupId ? projects.filter(p => p.groupId === activeGroupId) : [], [activeGroupId, projects]);
    const filteredModules = useMemo(() => selectedProjectId ? modules.filter(m => m.projectId === selectedProjectId) : [], [selectedProjectId, modules]);
    
    const taskList = useMemo(() => {
        return tasks.filter(task => {
            const matchProject = task.projectId === selectedProjectId;
            const matchModule = !selectedModuleId || task.moduleId === selectedModuleId;
            const matchCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
            return matchProject && matchModule && matchCategory;
        });
    }, [tasks, selectedProjectId, selectedModuleId, selectedCategory]);

    const taskCategories = useMemo(() => {
        const cats = new Set<string>();
        taskList.forEach(t => { if(t.category) cats.add(t.category); });
        return Array.from(cats).map(c => ({ id: c, label: c }));
    }, [taskList]);

    const groupOptions = projectGroups.map(g => ({ id: g.id, label: g.name }));
    const projectOptions = filteredProjects.map(p => ({ id: p.id, label: p.name }));
    const moduleOptions = [{ id: 'ALL_MODULES', label: 'Todos os Módulos' }, ...filteredModules.map(m => ({ id: m.id, label: m.name }))];
    const categoryOptions = [{ id: 'ALL', label: 'Todas as Categorias' }, ...taskCategories];

    return (
        <div className="h-full flex flex-col animate-fade-in-up px-2 md:px-0">
            <header className="flex-shrink-0 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
                    
                    <div className="max-w-xl">
                        <h1 className={`text-4xl font-light tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            Workboard <span className="text-[var(--accent-color)] font-black">.Agile</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-3 w-full lg:w-auto">
                        <DropdownSelect 
                            label="Squad"
                            placeholder="Grupo"
                            options={groupOptions}
                            value={activeGroupId}
                            onChange={handleGroupChange}
                            icon={<LayersIcon />}
                        />
                        <DropdownSelect 
                            label="Projeto"
                            placeholder="Projeto"
                            options={projectOptions}
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                            icon={<FolderIcon />}
                        />
                        <div className={`transition-all duration-500 ${!selectedProjectId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <DropdownSelect 
                                label="Módulo"
                                placeholder="Selecione Módulo"
                                options={moduleOptions}
                                value={selectedModuleId || 'ALL_MODULES'}
                                onChange={handleModuleChange}
                                icon={<ComponentIcon />}
                            />
                        </div>
                        <div className={`transition-all duration-500 ${!selectedProjectId ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <DropdownSelect 
                                label="Filtro"
                                placeholder="Categoria"
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                icon={<TagIcon />}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col">
                {selectedProjectId ? (
                    <>
                        <div className="flex items-center justify-between mb-6 flex-shrink-0 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)]"></div>
                                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.4em]">
                                    Fluxo Ativo: {projects.find(p => p.id === selectedProjectId)?.name} 
                                    {selectedModuleId && ` / ${modules.find(m => m.id === selectedModuleId)?.name}`}
                                </span>
                            </div>
                        </div>
                        
                        <TaskBoard 
                            tasks={taskList} 
                            onEditTask={handleEditTask} 
                            onNewTask={handleNewTask} 
                        />
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center bg-black/5 border-2 border-dashed border-[var(--border-color)] rounded-[3rem] opacity-50">
                        <FolderIcon className="text-[var(--text-muted)] w-12 h-12 mb-4" />
                        <h3 className="text-xl font-light text-[var(--text-primary)] tracking-tight">Defina um Contexto Operacional</h3>
                        <p className="text-[var(--text-muted)] text-xs mt-1 uppercase tracking-widest font-bold">Squad > Projeto > Módulo</p>
                    </div>
                )}
            </div>

             {isModalOpen && <TaskModal task={editingTask} status={newTaskStatus || undefined} onClose={closeModal} />}
        </div>
    );
}

export default TarefasView;
