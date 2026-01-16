
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Project, Task, TaskStatus, TaskPriority, ProjectGroup, ProjectModule, ModuleCategory } from '../types';

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const MOCK_PROJECT_GROUPS: ProjectGroup[] = [
    { id: 'group-nubank', name: 'Campanhas Nubank', description: 'Performance e branding premium.', clientId: 'cli-1', isPinned: true },
    { id: 'group-mcd', name: 'Social McDonald\'s', description: 'Comunidade e sazonais.', clientId: 'cli-2' },
    { id: 'group-internal', name: 'Operação Interna', description: 'Desenvolvimento e cultura AdVerge.' },
];

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', groupId: 'group-nubank', name: 'Ultravioleta Q4', purpose: 'Adesão premium.', focus: 'Performance', client: 'Nubank', summary: 'Lançamento do novo benefício de cashback.', deadline: '2024-12-20', isPinned: true },
  { id: 'proj-2', groupId: 'group-internal', name: 'Nexus v2', purpose: 'Evolução do HUB.', focus: 'Engenharia', client: 'AdVerge', summary: 'Nova engine de sincronização contábil.', deadline: '2024-11-15' },
];

const MOCK_MODULES: ProjectModule[] = [
  { id: 'mod-1', projectId: 'proj-1', name: 'Criativos', description: 'Design e redação de anúncios.', priority: 'ALTA', createdBy: 'Carlos Teles', createdAt: '2024-10-01' },
  { id: 'mod-2', projectId: 'proj-1', name: 'Landing Pages', description: 'Desenvolvimento de páginas de conversão.', priority: 'MEDIA', createdBy: 'Carlos Teles', createdAt: '2024-10-02' },
  { id: 'mod-3', projectId: 'proj-2', name: 'Backend Sync', description: 'Lógica de integração bancária.', priority: 'URGENTE', createdBy: 'Carlos Teles', createdAt: '2024-10-05' },
];

const MOCK_TASKS: Task[] = [
  { id: 'task-1', projectId: 'proj-1', moduleId: 'mod-1', title: 'Banner Hero Facebook', description: 'Criar banner principal para FB Ads.', status: 'EM_ANDAMENTO', priority: 'ALTA', dueDate: '2024-11-10', assignee: 'Alice' },
  { id: 'task-2', projectId: 'proj-1', moduleId: 'mod-1', title: 'Copy Headlines', description: 'Redigir 5 variações de títulos.', status: 'CONCLUIDO', priority: 'MEDIA', dueDate: '2024-11-05', assignee: 'Bob' },
];

interface TaskManagerContextState {
  projectGroups: ProjectGroup[];
  projects: Project[];
  modules: ProjectModule[];
  moduleCategories: ModuleCategory[];
  tasks: Task[];
  selectedProjectId: string | null;
  selectedModuleId: string | null;
  selectProject: (projectId: string) => void;
  selectModule: (moduleId: string | null) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  addProjectGroup: (groupData: Omit<ProjectGroup, 'id'>) => void;
  updateProjectGroup: (groupId: string, groupData: Partial<Omit<ProjectGroup, 'id'>>) => void;
  addProject: (projectData: Omit<Project, 'id'>) => void;
  updateProject: (projectId: string, projectData: Partial<Omit<Project, 'id' | 'groupId'>>) => void;
  addModule: (moduleData: Omit<ProjectModule, 'id' | 'createdAt'>) => void;
  updateModule: (moduleId: string, moduleData: Partial<Omit<ProjectModule, 'id'>>) => void;
  moveModuleToCategory: (moduleId: string, categoryId: string | undefined) => void;
  deleteModule: (moduleId: string) => void;
  addModuleCategory: (catData: Omit<ModuleCategory, 'id'>) => void;
  addTask: (taskData: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, taskData: Partial<Omit<Task, 'id' | 'projectId'>>) => void;
  deleteTask: (taskId: string) => void;
  togglePinProject: (projectId: string) => void;
  togglePinProjectGroup: (groupId: string) => void;
}

const TaskManagerContext = createContext<TaskManagerContextState | undefined>(undefined);

export const TaskManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>(MOCK_PROJECT_GROUPS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [modules, setModules] = useState<ProjectModule[]>(MOCK_MODULES);
  const [moduleCategories, setModuleCategories] = useState<ModuleCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const selectProject = (id: string) => {
    setSelectedProjectId(id);
    setSelectedModuleId(null);
  };
  
  const selectModule = (id: string | null) => setSelectedModuleId(id);

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const addProjectGroup = (data: Omit<ProjectGroup, 'id'>) => {
    setProjectGroups(prev => [...prev, { ...data, id: generateId(), isPinned: false }]);
  };

  const updateProjectGroup = (id: string, data: Partial<ProjectGroup>) => {
    setProjectGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const addProject = (data: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...data, id: generateId(), isPinned: false }]);
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const addModule = (data: Omit<ProjectModule, 'id' | 'createdAt'>) => {
    setModules(prev => [...prev, { ...data, id: generateId(), createdAt: new Date().toISOString() }]);
  };

  const updateModule = (id: string, data: Partial<ProjectModule>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const moveModuleToCategory = (moduleId: string, categoryId: string | undefined) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, categoryId } : m));
  };

  const deleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    setTasks(prev => prev.filter(t => t.moduleId !== id));
  };

  const addModuleCategory = (data: Omit<ModuleCategory, 'id'>) => {
    setModuleCategories(prev => [...prev, { ...data, id: generateId() }]);
  };

  const togglePinProject = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  }, []);

  const togglePinProjectGroup = useCallback((id: string) => {
    setProjectGroups(prev => prev.map(g => g.id === id ? { ...g, isPinned: !g.isPinned } : g));
  }, []);

  const addTask = (data: Omit<Task, 'id'>) => setTasks(prev => [...prev, { ...data, id: generateId() }]);
  const updateTask = (id: string, data: Partial<Task>) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <TaskManagerContext.Provider value={{ 
        projectGroups, projects, modules, moduleCategories, tasks, selectedProjectId, selectedModuleId, selectProject, selectModule, updateTaskStatus,
        addProjectGroup, updateProjectGroup, addProject, updateProject, addTask, updateTask, deleteTask, togglePinProject, togglePinProjectGroup,
        addModule, updateModule, deleteModule, addModuleCategory, moveModuleToCategory
    }}>
      {children}
    </TaskManagerContext.Provider>
  );
};

export const useTaskManager = () => {
  const context = useContext(TaskManagerContext);
  if (!context) throw new Error('useTaskManager must be used within TaskManagerProvider');
  return context;
};
