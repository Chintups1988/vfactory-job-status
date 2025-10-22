import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MoreHorizontal, Trash2, Edit2, Calendar, Clock, Archive, ArchiveRestore } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { StageColumn } from './StageColumn';
import { AddTaskDialog } from './AddTaskDialog';
import { Project, Task, Stage } from './ProjectBoard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import API from '../api';

interface ProjectRowProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: () => void;
  onArchive?: (archived: boolean) => void;
  isAlternate?: boolean;
  assignees: { id: string; name: string }[];
  userRole?: string;
}

export const ProjectRow = ({ project, onUpdate, onDelete, onArchive, isAlternate = false, assignees, userRole }: ProjectRowProps) => {
  const canEdit = userRole === 'admin' || userRole === 'manager';
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [editStartDate, setEditStartDate] = useState(project.startDate);
  const [addTaskStageId, setAddTaskStageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [addStageDialogOpen, setAddStageDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [editStageName, setEditStageName] = useState('');
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  const handleNameSave = () => {
    if (editName.trim() && editName.trim() !== project.name) {
      API.put(`/projects/${project.id}`, { name: editName.trim() })
        .then(() => {
          onUpdate({ ...project, name: editName.trim() });
          setIsEditing(false);
        });
    } else {
      setIsEditing(false);
    }
  };

  const handleStartDateSave = () => {
    console.log('handleStartDateSave called');
    console.log('editStartDate:', editStartDate);
    console.log('project.startDate:', project.startDate);
    console.log('project.id:', project.id);
    
    if (editStartDate && editStartDate !== project.startDate && editStartDate.trim() !== '') {
      console.log('Sending API request to update start date');
      console.log('Project ID type:', typeof project.id);
      console.log('Project ID value:', project.id);
      
      // Ensure project ID is a string
      const projectId = String(project.id);
      console.log('Formatted project ID:', projectId);
      
      // Ensure date is in YYYY-MM-DD format
      const formattedDate = editStartDate.split('T')[0]; // Remove time part if present
      console.log('Formatted date for API:', formattedDate);
      
      API.put(`/projects/${projectId}`, { start_date: formattedDate })
        .then((response) => {
          console.log('API response:', response);
          console.log('Calling onUpdate with new startDate:', editStartDate);
          onUpdate({ ...project, startDate: editStartDate });
          setIsEditingStartDate(false);
          console.log('Start date updated successfully');
        })
        .catch((error) => {
          console.error('Error updating start date:', error);
          console.error('Error response:', error.response);
          alert('Failed to update start date. Please try again.');
          setEditStartDate(project.startDate); // Revert to original
          setIsEditingStartDate(false);
        });
    } else {
      console.log('No changes to save or invalid date');
      setIsEditingStartDate(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditName(project.name);
      setIsEditing(false);
    }
  };

  const handleStartDateKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartDateSave();
    } else if (e.key === 'Escape') {
      setEditStartDate(project.startDate);
      setIsEditingStartDate(false);
    }
  };

  const addTask = (stageId: string, task: Omit<Task, 'id'>) => {
    console.log('Creating task for stage:', stageId, task);
    API.post(`/stages/${stageId}/tasks`, {
      title: task.title,
      due_date: (task.dueDate instanceof Date)
        ? task.dueDate.toISOString().substring(0, 10)
        : task.dueDate,
      status: task.status,
      assigned_to: task.assignedTo
    })
      .then((res) => {
        console.log('Task created successfully:', res.data);
        // Re-fetch tasks for this stage
        API.get(`/stages/${stageId}/tasks`).then(res => {
          // Map backend fields to frontend fields
          const tasks = res.data.map((t: any) => ({
            ...t,
            dueDate: t.due_date,
            assignedTo: t.assigned_to
          }));
          const updatedStages = project.stages.map(stage =>
            stage.id === stageId
              ? { ...stage, tasks }
              : stage
          );
          onUpdate({ ...project, stages: updatedStages });
        });
      })
      .catch(error => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
      });
  };

  const updateTask = (stageId: string, taskId: string, updates: Partial<Task>) => {
    console.log('Updating task:', taskId, 'in stage:', stageId, updates);
    
    // Handle date conversion properly - use timezone-safe conversion
    let due_date = null;
    if (updates.dueDate) {
      if (updates.dueDate instanceof Date) {
        // Use timezone-safe conversion to avoid date shifting
        const year = updates.dueDate.getFullYear();
        const month = String(updates.dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(updates.dueDate.getDate()).padStart(2, '0');
        due_date = `${year}-${month}-${day}`;
      } else if (typeof updates.dueDate === 'string') {
        due_date = updates.dueDate;
      } else {
        // For other date formats, create a Date object and convert safely
        const date = new Date(updates.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        due_date = `${year}-${month}-${day}`;
      }
    }
    
    API.put(`/tasks/${taskId}`, {
      title: updates.title,
      due_date: due_date,
      status: updates.status,
      assigned_to: updates.assignedTo === 'unassigned' ? null : updates.assignedTo
    })
      .then(() => {
        const updatedStages = project.stages.map(stage =>
          stage.id === stageId
            ? {
                ...stage,
                tasks: stage.tasks.map(task =>
                  task.id === taskId ? { 
                    ...task, 
                    ...updates,
                    // Convert string date back to Date object for local state
                    dueDate: updates.dueDate && typeof updates.dueDate === 'string' 
                      ? new Date(updates.dueDate + 'T00:00:00') 
                      : updates.dueDate || task.dueDate
                  } : task
                )
              }
            : stage
        );
        onUpdate({ ...project, stages: updatedStages });
      })
      .catch(error => {
        console.error('Error updating task:', error);
        console.error('Error response:', error.response?.data);
        alert('Failed to update task. Please try again.');
      });
  };

  const deleteTask = (stageId: string, taskId: string) => {
    console.log('Deleting task:', taskId, 'from stage:', stageId);
    API.delete(`/tasks/${taskId}`)
      .then(() => {
        const updatedStages = project.stages.map(stage =>
          stage.id === stageId
            ? { ...stage, tasks: stage.tasks.filter(task => task.id !== taskId) }
            : stage
        );
        onUpdate({ ...project, stages: updatedStages });
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      });
  };

  const addStage = (name: string) => {
    if (!name.trim()) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('User not logged in. Please log in first.');
      return;
    }
    
    console.log('Creating stage:', name.trim(), 'for project:', project.id);
    API.post('/stages', { name: name.trim(), project_id: project.id })
      .then(res => {
        console.log('Stage created successfully:', res.data);
        onUpdate({
          ...project,
          stages: [...project.stages, { ...res.data, tasks: [] }]
        });
      })
      .catch(error => {
        console.error('Error creating stage:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMessage = 'Failed to create stage. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      });
  };

  const editStage = (stageId: string, name: string) => {
    if (!name.trim()) return;
    console.log('Editing stage:', stageId, 'to name:', name.trim());
    API.put(`/stages/${stageId}`, { name: name.trim() })
      .then(() => {
        const updatedStages = project.stages.map(stage =>
          stage.id === stageId ? { ...stage, name: name.trim() } : stage
        );
        onUpdate({ ...project, stages: updatedStages });
      })
      .catch(error => {
        console.error('Error editing stage:', error);
        alert('Failed to edit stage. Please try again.');
      });
  };

  const deleteStage = (stageId: string) => {
    console.log('Deleting stage:', stageId);
    API.delete(`/stages/${stageId}`)
      .then(() => {
        const updatedStages = project.stages.filter(stage => stage.id !== stageId);
        onUpdate({ ...project, stages: updatedStages });
      })
      .catch(error => {
        console.error('Error deleting stage:', error);
        alert('Failed to delete stage. Please try again.');
      });
  };

  return (
    <div className="p-0.5">
      {/* Project Header */}
      <div className={`
        rounded p-0.5 mb-0.5 border transition-all duration-300
        ${isAlternate 
          ? 'bg-accent-light border-accent/20' 
          : 'bg-primary-light border-primary/20'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-1.5 h-4 rounded ${isAlternate ? 'bg-accent' : 'bg-primary'}`} />
            
            {/* Project Name */}
            <div className="flex flex-col items-center min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleKeyPress}
                  className="text-[10px] font-semibold bg-transparent border-none focus:border-none shadow-none p-0 h-auto text-foreground text-center"
                  autoFocus
                />
              ) : (
                              <h2 
                className={cn(
                  "text-[10px] font-semibold text-foreground text-center w-full truncate",
                  canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""
                )}
                onClick={() => canEdit && setIsEditing(true)}
              >
                {project.name}
              </h2>
            )}
            {canEdit && (
              <Edit2 
                className="w-2.5 h-2.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors mt-0.25"
                onClick={() => setIsEditing(true)}
              />
            )}
            </div>
            
            {/* Start Date */}
            <div className="flex items-center gap-1">
              <Calendar className="w-2 h-2 text-muted-foreground" />
              {isEditingStartDate ? (
                <Input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => {
                    console.log('Date input changed to:', e.target.value);
                    setEditStartDate(e.target.value);
                  }}
                  onBlur={handleStartDateSave}
                  onKeyDown={handleStartDateKeyPress}
                  className="text-[8px] bg-transparent border-none focus:border-none shadow-none p-0 h-auto text-muted-foreground w-16"
                  autoFocus
                />
              ) : (
                <span 
                  className={cn(
                    "text-[8px] text-muted-foreground",
                    canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""
                  )}
                  onClick={() => canEdit && setIsEditingStartDate(true)}
                  title={canEdit ? "Click to edit start date" : ""}
                >
                  {new Date(project.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              )}
            </div>
            
            {/* Days Count */}
            <div className="flex items-center gap-1">
              <Clock className="w-2 h-2 text-muted-foreground" />
              {(() => {
                const startDate = new Date(project.startDate);
                const today = new Date();
                const timeDiff = today.getTime() - startDate.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                const days = daysDiff >= 0 ? daysDiff : 0;
                
                // Color coding based on project duration
                let colorClass = "text-[8px] text-muted-foreground";
                if (days === 0) colorClass = "text-[8px] text-green-600 font-medium";
                else if (days <= 7) colorClass = "text-[8px] text-blue-600 font-medium";
                else if (days <= 30) colorClass = "text-[8px] text-orange-600 font-medium";
                else colorClass = "text-[8px] text-red-600 font-medium";
                
                return (
                  <span className={colorClass}>
                    {days === 1 ? `${days}d` : `${days}d`}
                  </span>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="text-[9px] text-muted-foreground bg-card/50 px-0.5 py-0.25 rounded">
              <span className="font-medium">
                {(project.stages || []).reduce((total, stage) => total + ((stage.tasks || []).length), 0)} tasks
              </span>
            </div>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-card/50 p-0.25">
                    <MoreHorizontal className="w-2.5 h-2.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border shadow-card">
                  {onArchive && (
                    <DropdownMenuItem 
                      onClick={() => {
                        console.log('Archive button clicked for project:', project.id, 'current archived state:', project.archived);
                        onArchive(!project.archived);
                      }}
                      className="hover:bg-accent focus:bg-accent"
                    >
                      {project.archived ? (
                        <>
                          <ArchiveRestore className="w-3 h-3 mr-1" />
                          Restore Project
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3 mr-1" />
                          Archive Project
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-danger hover:bg-danger-light focus:bg-danger-light focus:text-danger"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="w-full relative">
        {/* Scroll indicator hint */}
        <div className="text-[9px] text-muted-foreground mb-0.25 flex items-center gap-0.5">
          <span>Scroll right to see all stages →</span>
          <span className="text-[8px] bg-muted px-0.25 py-0.25 rounded">
            {(project.stages || []).length} stages
          </span>
        </div>
        
        <div className="w-full overflow-x-auto overflow-y-visible">
          <div className="flex gap-4 pb-2 pr-4" style={{ width: `${(project.stages || []).length * 320 + 120}px` }}>
            {(project.stages || []).map((stage, index) => (
              <div key={stage.id} className="animate-slide-in flex-shrink-0" style={{ animationDelay: `${index * 50}ms` }}>
                <StageColumn
                  isAlternate={index % 2 === 0}
                  stage={stage}
                  onAddTask={(task) => addTask(stage.id, task)}
                  onUpdateTask={(taskId, updates) => updateTask(stage.id, taskId, updates)}
                  onDeleteTask={(taskId) => deleteTask(stage.id, taskId)}
                  onEditStage={() => {
                    setEditStageId(stage.id);
                    setEditStageName(stage.name);
                  }}
                  onDeleteStage={() => setDeleteStageId(stage.id)}
                  isEditingStage={editStageId === stage.id}
                  editStageName={editStageName}
                  setEditStageName={setEditStageName}
                  onEditStageSave={() => {
                    if (editStageId) editStage(editStageId, editStageName);
                    setEditStageId(null);
                  }}
                  onEditStageCancel={() => setEditStageId(null)}
                  assignees={assignees}
                  userRole={userRole}
                />
              </div>
            ))}
            {/* Add Stage Button */}
            {canEdit && (
              <div className="flex flex-col justify-center items-center min-w-[200px] w-52">
                <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => setAddStageDialogOpen(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Add Stage
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={addTaskStageId !== null}
        onOpenChange={(open) => !open && setAddTaskStageId(null)}
        onAdd={(backendTask) => {
          if (addTaskStageId) {
            // Map backendTask (snake_case) to Omit<Task, 'id'> (camelCase) for addTask
            addTask(addTaskStageId, {
              title: backendTask.title,
              dueDate: new Date(backendTask.due_date),
              status: backendTask.status as 'pending' | 'in-progress' | 'completed' | 'overdue',
              assignedTo: backendTask.assigned_to
            });
            setAddTaskStageId(null);
          }
        }}
        stageName={
          addTaskStageId 
            ? (project.stages || []).find(s => s.id === addTaskStageId)?.name || ''
            : ''
        }
        assignees={assignees}
      />
      {/* Add Stage Dialog */}
      <Dialog open={addStageDialogOpen} onOpenChange={setAddStageDialogOpen}>
        <DialogContent className="bg-white border border-blue-100 shadow-md max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-blue-900 text-sm">Add Stage</DialogTitle>
          </DialogHeader>
          <Input
            value={newStageName}
            onChange={e => setNewStageName(e.target.value)}
            placeholder="Stage name"
            className="mb-2 text-xs"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="border-blue-200" onClick={() => setAddStageDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" disabled={!newStageName.trim()} onClick={() => { addStage(newStageName); setNewStageName(''); setAddStageDialogOpen(false); }}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Stage Dialog */}
      <Dialog open={!!deleteStageId} onOpenChange={open => !open && setDeleteStageId(null)}>
        <DialogContent className="bg-white border border-blue-100 shadow-md max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-blue-900 text-sm">Delete Stage</DialogTitle>
          </DialogHeader>
          <div className="mb-2 text-xs">Are you sure you want to delete this stage? All tasks in this stage will be lost.</div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" className="border-blue-200" onClick={() => setDeleteStageId(null)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => { if (deleteStageId) deleteStage(deleteStageId); setDeleteStageId(null); }}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};