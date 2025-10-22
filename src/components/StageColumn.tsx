import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { Stage, Task } from './ProjectBoard';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import API from '../api';
import { useState } from 'react';
import { AddTaskDialog } from './AddTaskDialog';
import { cn } from '@/lib/utils';

interface StageColumnProps {
  stage: Stage;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditStage?: () => void;
  onDeleteStage?: () => void;
  isEditingStage?: boolean;
  editStageName?: string;
  setEditStageName?: (name: string) => void;
  onEditStageSave?: () => void;
  onEditStageCancel?: () => void;
  assignees: { id: string; name: string }[];
  isAlternate?: boolean;
  userRole?: string;
}

export const StageColumn = ({ stage, onAddTask, onUpdateTask, onDeleteTask, onEditStage, onDeleteStage, isEditingStage, editStageName, setEditStageName, onEditStageSave, onEditStageCancel, assignees, isAlternate, userRole }: StageColumnProps) => {
  const tasks = stage.tasks || [];
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const canEdit = userRole === 'admin' || userRole === 'manager';

  // Add this function to add a task using the backend
  const addTask = (task: Omit<Task, 'id'>) => {
    console.log('Adding task to stage:', stage.id, task);
    API.post(`/stages/${stage.id}/tasks`, {
      title: task.title,
      due_date: (task.dueDate instanceof Date)
        ? task.dueDate.toISOString().substring(0, 10)
        : task.dueDate,
      status: task.status,
      assigned_to: task.assignedTo
    })
      .then(res => {
        console.log('Task added successfully:', res.data);
        // Add the new task to the stage by calling onUpdateTask for the new task
        onUpdateTask(res.data.id, res.data);
        setIsAddTaskOpen(false);
      })
      .catch(error => {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
      });
  };



  return (
    <div className={cn("min-w-[260px] w-[280px] border-2 border-gray-200 rounded-lg bg-white", isAlternate && "bg-gray-50") }>
      {/* Stage Header */}
      <div className="mb-2 flex items-center justify-between">
        {isEditingStage ? (
          <Input
            value={editStageName || ''}
            onChange={e => setEditStageName && setEditStageName(e.target.value)}
            onBlur={onEditStageSave}
            onKeyDown={e => {
              if (e.key === 'Enter' && onEditStageSave) onEditStageSave();
              if (e.key === 'Escape' && onEditStageCancel) onEditStageCancel();
            }}
            className="font-semibold text-foreground text-xs mb-1 px-1 py-0 h-6"
            autoFocus
          />
        ) : (
          <>
            <h3 className="font-semibold text-foreground text-xs mb-1 px-1 flex-1 truncate text-center">
              {stage.name}
            </h3>
            {canEdit && (
              <div className="flex items-center gap-1">
                <button onClick={onEditStage} className="text-muted-foreground hover:text-blue-600 p-0.5"><Edit2 className="w-3 h-3" /></button>
                <button onClick={onDeleteStage} className="text-muted-foreground hover:text-red-600 p-0.5"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
        {canEdit && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsAddTaskOpen(true)}
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-0.5 min-h-[120px]">
        {tasks.map((task, index) => (
          <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <TaskCard
              task={task}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
              onDelete={() => onDeleteTask(task.id)}
              assignees={assignees}
              userRole={userRole}
            />
          </div>
        ))}
        
        {tasks.length === 0 && (
          <Card className="border-2 border-dashed border-border/50 bg-muted/20 h-32 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              {canEdit && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  className="text-primary hover:text-primary/80 p-0 h-auto"
                >
                  Add first task
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAdd={(backendTask) => {
          onAddTask({
            title: backendTask.title,
            dueDate: new Date(backendTask.due_date),
            status: backendTask.status as 'pending' | 'in-progress' | 'completed' | 'overdue',
            assignedTo: backendTask.assigned_to
          });
          setIsAddTaskOpen(false);
        }}
        stageName={stage.name}
        assignees={assignees}
      />
    </div>
  );
};