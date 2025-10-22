import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ProjectRow } from './ProjectRow';
import { AddProjectDialog } from './AddProjectDialog';
import { Dispatch, SetStateAction } from 'react';
import API from '../api';

export interface Task {
  id: string;
  title: string;
  dueDate: Date | string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string; // Name or ID of assigned person
}

export interface Stage {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  stages: Stage[];
  archived?: boolean;
}

export interface ProjectBoardProps {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  assignees: { id: string; name: string }[];
  userRole?: string;
}

const INITIAL_STAGES = [
  'Stage 1 Initiation',
  'Stage 2 Preparation', 
  'Stage 3 Vendor Works',
  'Stage 4 Final Order',
  'Stage 5 Cutlist to Factory',
  'Stage 6 Factory Delivery',
  'Stage 7 Execution',
  'Stage 8 Handover'
];

export const ProjectBoard = ({ projects, setProjects, assignees, userRole }: ProjectBoardProps) => {
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const addProject = async (name: string, cloneProjectId?: string) => {
    try {
      console.log('Starting project creation...');
      console.log('Project name:', name);
      console.log('Clone project ID:', cloneProjectId);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not logged in. Please log in first.');
      }
      console.log('User token found:', token.substring(0, 20) + '...');
      
      if (!cloneProjectId) {
        // Create new project without cloning
        console.log('Creating new project without cloning...');
        const res = await API.post('/projects', { name });
        console.log('Project created successfully:', res.data);
        setProjects([...projects, { ...res.data, startDate: res.data.start_date, stages: [] }]);
      } else {
        // Clone existing project
        console.log('Cloning project:', cloneProjectId);
        
        // First, create the new project
        const newProjectRes = await API.post('/projects', { name });
        const newProjectId = newProjectRes.data.id;
        console.log('Created new project with ID:', newProjectId);
        
        // Fetch stages from the project to clone
        console.log('Fetching stages for project:', cloneProjectId);
        const stagesRes = await API.get(`/projects/${cloneProjectId}/stages`);
        const stagesToClone = stagesRes.data || [];
        console.log('Stages to clone:', stagesToClone);
        
        if (stagesToClone.length === 0) {
          console.log('No stages found to clone');
        }
        
        // Clone each stage (without tasks)
        for (const stage of stagesToClone) {
          console.log('Creating stage:', stage.name, 'for project:', newProjectId);
          try {
            const stageRes = await API.post('/stages', { name: stage.name, project_id: newProjectId });
            console.log('Stage created:', stageRes.data);
          } catch (error) {
            console.error('Error creating stage:', stage.name, error);
            throw new Error(`Failed to create stage: ${stage.name}`);
          }
        }
        
        // Fetch the newly created stages for the new project
        const newStagesRes = await API.get(`/projects/${newProjectId}/stages`);
        console.log('New project stages:', newStagesRes.data);
        
        // Add the new project to the state
        setProjects([...projects, { 
          ...newProjectRes.data, 
          startDate: newProjectRes.data.start_date, 
          stages: newStagesRes.data || [] 
        }]);
      }
    } catch (error) {
      console.error('Error creating/cloning project:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create project. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId: string) => {
    API.delete(`/projects/${projectId}`)
      .then(() => setProjects(projects.filter(p => p.id !== projectId)));
  };

  const archiveProject = (projectId: string, archived: boolean) => {
    console.log('Archiving project:', projectId, 'archived:', archived);
    API.put(`/projects/${projectId}/archive`, { archived })
      .then(() => {
        console.log('Project archived successfully, removing from current view');
        // Remove the project from the current view immediately
        setProjects(projects.filter(p => p.id !== projectId));
      })
      .catch(error => {
        console.error('Error archiving project:', error);
        alert('Failed to archive project. Please try again.');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-section shadow-section border-b border-border-light px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  VFactory Job Status
                </h1>
              </div>
              {canEdit && (
                <Button 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300 text-lg px-6 py-3 h-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="p-6">
          <div className="max-w-full mx-auto space-y-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`animate-fade-in ${
                  index % 2 === 0 ? 'ml-0' : 'ml-8'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`
                  rounded-xl shadow-section border transition-all duration-300 hover:shadow-elegant
                  ${index % 2 === 0 
                    ? 'bg-gradient-card border-border' 
                    : 'bg-gradient-card-alt border-border-light'
                  }
                `}>
                  <ProjectRow 
                    project={project} 
                    onUpdate={updateProject}
                    onDelete={() => deleteProject(project.id)}
                    onArchive={(archived) => archiveProject(project.id, archived)}
                    isAlternate={index % 2 !== 0}
                    assignees={assignees}
                    userRole={userRole}
                  />
                </div>
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="bg-gradient-card shadow-section border border-border rounded-xl p-16 text-center max-w-2xl mx-auto">
                <div className="text-muted-foreground">
                  <Plus className="w-20 h-20 mx-auto mb-6 opacity-40" />
                  <h3 className="text-2xl font-semibold mb-3">No projects yet</h3>
                  <p className="mb-6 text-lg">Create your first project to get started with tracking tasks</p>
                  {canEdit && (
                    <Button 
                      onClick={() => setIsAddProjectOpen(true)}
                      variant="outline"
                      className="text-lg px-6 py-3 h-auto border-border hover:bg-secondary"
                    >
                      Create Project
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AddProjectDialog
          open={isAddProjectOpen}
          onOpenChange={setIsAddProjectOpen}
          onAdd={addProject}
          projects={projects.map(p => ({ id: p.id, name: p.name }))}
        />
      </div>
    </div>
  );
};