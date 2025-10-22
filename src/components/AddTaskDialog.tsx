import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from './ProjectBoard';

type BackendTask = {
  title: string;
  due_date: string;
  status: string;
  assigned_to: string | null;
};

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (task: BackendTask) => void;
  stageName: string;
  assignees: { id: string; name: string }[];
}

export const AddTaskDialog = ({ open, onOpenChange, onAdd, stageName, assignees = [] }: AddTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('unassigned');

  useEffect(() => {
    if (!open) setAssignedTo('unassigned');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && dueDate) {
      setErrorMsg('');
      try {
        console.log('Submitting:', { title, dueDate });
        await Promise.resolve(onAdd({
          title: title.trim(),
          due_date: dueDate.toISOString().substring(0, 10),
          status: 'pending',
          assigned_to: assignedTo === 'unassigned' ? null : assignedTo
        }));
        setTitle('');
        setDueDate(undefined);
        setAssignedTo('unassigned');
        onOpenChange(false);
      } catch (err: any) {
        setErrorMsg('Failed to add task: ' + (err?.message || err));
        console.error('Add task error:', err);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setDueDate(undefined);
      setIsCalendarOpen(false);
    }
    onOpenChange(newOpen);
  };

  const safeAssignees = assignees || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new task to <span className="font-medium text-primary">{stageName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-foreground">Task Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="bg-background border-border focus:border-primary"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Due Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border hover:bg-secondary",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border shadow-card" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-foreground">Assignee</Label>
            <select
              id="assignee"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full border border-border rounded px-2 py-1"
            >
              <option value="unassigned">Unassigned</option>
              {safeAssignees.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          
          {errorMsg && <div className="text-xs text-red-500">{errorMsg}</div>}

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!title.trim() || !dueDate}
              className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};