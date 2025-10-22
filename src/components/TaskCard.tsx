import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { Task } from './ProjectBoard';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  assignees: { id: string; name: string }[];
  userRole?: string;
}

export const TaskCard = ({ task, onUpdate, onDelete, assignees, userRole }: TaskCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDueDateDialogOpen, setIsDueDateDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromProp = useRef(false);

  // Local editable state
  const [editTitle, setEditTitle] = useState<string>(task.title);
  // Use timezone-safe date conversion for initial state
  const getInitialDueDate = () => {
    const dueDate = new Date(task.dueDate);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [editDueDate, setEditDueDate] = useState<string>(getInitialDueDate());
  const [editStatus, setEditStatus] = useState<string>(task.status);
  const [editAssignedTo, setEditAssignedTo] = useState<string>(task.assignedTo || 'unassigned');

  // Update local state when task prop changes
  useEffect(() => {
    isUpdatingFromProp.current = true;
    const dueDate = new Date(task.dueDate);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const newDueDate = `${year}-${month}-${day}`;
    
    setEditTitle(task.title);
    setEditDueDate(newDueDate);
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo || 'unassigned');
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingFromProp.current = false;
    }, 100);
  }, [task]);

  const getTaskStatus = (task: Task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate as any); // Defensive: always convert
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (task.status === 'completed') return 'completed';
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 2) return 'due-soon';
    return 'normal';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-success text-success-foreground',
          animation: '',
          label: 'Completed'
        };
      case 'overdue':
        return {
          color: 'bg-danger text-danger-foreground',
          animation: 'animate-blink-danger',
          label: 'Overdue'
        };
      case 'due-soon':
        return {
          color: 'bg-warning text-warning-foreground',
          animation: 'animate-blink-warning',
          label: 'Due Soon'
        };
      default:
        return {
          color: 'bg-secondary text-secondary-foreground',
          animation: '',
          label: 'In Progress'
        };
    }
  };

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const statusType = getTaskStatus(task);
  const statusConfig = getStatusConfig(editStatus);
  // Add blinking red animation for overdue tasks
  const isOverdue = statusType === 'overdue';
  const isDueSoon = statusType === 'due-soon' && editStatus !== 'completed';

  const formatDate = (date: Date | string) => {
    // Handle string dates (YYYY-MM-DD format) timezone-safely
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      // Create date in local timezone to avoid shifting
      const localDate = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(localDate);
    }
    
    // Handle Date objects
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save if we're updating from prop
    if (isUpdatingFromProp.current) return;
    
    setIsSaving(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      onUpdate({
        title: editTitle,
        dueDate: editDueDate, // Pass string directly to avoid timezone conversion
        status: editStatus as 'pending' | 'in-progress' | 'completed' | 'overdue',
        assignedTo: editAssignedTo
      });
      setIsSaving(false);
      setSaveFeedback(true);
    }, 1000); // 1 second debounce

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [editTitle, editDueDate, editStatus, editAssignedTo]);

  // Hide 'Saved!' after 1.5s
  useEffect(() => {
    if (saveFeedback) {
      const timer = setTimeout(() => setSaveFeedback(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);

  return (
    <Card className={cn(
      "p-0 rounded border shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer min-w-[240px] max-w-[320px]",
      statusConfig.animation,
      editStatus === 'completed'
        ? 'bg-green-100 border-green-400'
        : isDueSoon
          ? 'bg-orange-50 border-orange-400 animate-blink-warning'
          : isOverdue
            ? 'animate-blink-danger border-red-500 bg-blue-50'
            : (editStatus === 'pending' || editStatus === 'in-progress')
              ? 'bg-yellow-100 border-yellow-400'
              : 'border-blue-100 bg-blue-50'
    )}>
      <div className="space-y-0">
        {/* First line: Title and menu */}
        <div className="flex items-center justify-between min-w-0 mb-0 gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <input
                className={cn(
                  "font-semibold text-blue-900 text-[9px] leading-tight flex-1 truncate min-w-0 text-center border border-blue-200 rounded px-0.5 py-0 h-4",
                  canEdit ? "bg-transparent" : "bg-gray-100 cursor-not-allowed"
                )}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                disabled={!canEdit}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-blue-900 text-white text-xs max-w-xs">
              <p>{editTitle}</p>
            </TooltipContent>
          </Tooltip>
          {canEdit && (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 opacity-60 hover:opacity-100 text-blue-500 min-h-0 min-w-0 leading-none">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-blue-100 shadow-sm">
                <DropdownMenuItem onClick={onDelete} className="text-danger">Delete Task</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Second line: Status, assignee, date all in one row, evenly spaced */}
        <div className="flex flex-row items-center justify-between gap-1 min-w-0 mt-0 mb-0">
          <select
            className={cn(
              "text-[9px] font-semibold px-0.5 py-0 border border-blue-200 shadow-sm rounded h-4 w-[80px] flex-shrink-0",
              statusConfig.color,
              canEdit ? "bg-white text-blue-700" : "bg-gray-100 text-gray-500 cursor-not-allowed"
            )}
            value={editStatus}
            onChange={e => setEditStatus(e.target.value as string)}
            disabled={!canEdit}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <Select value={editAssignedTo} onValueChange={setEditAssignedTo} disabled={!canEdit}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger className={cn(
                  "h-4 w-20 text-[9px] px-0.5 py-0 border border-blue-200 rounded shadow-sm flex-shrink-0 truncate overflow-hidden justify-end min-h-0 min-w-0 leading-none",
                  canEdit ? "bg-white text-blue-700" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-900 text-white text-xs max-w-xs">
                <p>{assignees.find(a => a.id === editAssignedTo)?.name || 'Unassigned'}</p>
              </TooltipContent>
            </Tooltip>
            <SelectContent className="w-32 min-w-0 bg-white border-blue-100 shadow-lg">
              <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
              {assignees.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-[9px] text-blue-700 bg-white border border-blue-200 rounded px-0.5 py-0 shadow-sm h-4 w-[105px] flex-shrink-0 cursor-pointer"
                onClick={() => {
                  setIsDueDateDialogOpen(true);
                  setIsPasswordCorrect(false);
                  setAdminPassword('');
                  setNewDueDate(null);
                  setError('');
                }}
              >
                Due: {formatDate(editDueDate)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-blue-900 text-white text-xs max-w-xs">
              <p>Click to edit due date (admin only)</p>
              <p>Due: {formatDate(editDueDate)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Due Date Edit Dialog */}
        <Dialog open={isDueDateDialogOpen} onOpenChange={setIsDueDateDialogOpen}>
          <DialogContent className="bg-white border border-blue-100 shadow-md max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-blue-900 text-sm">Edit Due Date</DialogTitle>
            </DialogHeader>
            {!isPasswordCorrect ? (
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="text-xs"
                  autoFocus
                />
                {error && <div className="text-xs text-red-500">{error}</div>}
                <Button
                  size="sm"
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => {
                    if (adminPassword === 'admin123') {
                      setIsPasswordCorrect(true);
                      setNewDueDate(new Date(editDueDate));
                      setError('');
                    } else {
                      setError('Incorrect password');
                    }
                  }}
                >
                  Verify
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-900">Select new due date</span>
                </div>
                <Calendar
                  mode="single"
                  selected={newDueDate || undefined}
                  onSelect={date => setNewDueDate(date || null)}
                  initialFocus
                  className="p-2"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200"
                    onClick={() => setIsDueDateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                    disabled={!newDueDate}
                    onClick={() => {
                      if (newDueDate) {
                        // Use timezone-safe date conversion to avoid date shifting
                        const yearStr = newDueDate.getFullYear();
                        const monthStr = String(newDueDate.getMonth() + 1).padStart(2, '0');
                        const dayStr = String(newDueDate.getDate()).padStart(2, '0');
                        const newDateString = `${yearStr}-${monthStr}-${dayStr}`;
                        setEditDueDate(newDateString);
                        setIsDueDateDialogOpen(false);
                        
                        // Trigger immediate save by calling onUpdate directly
                        // Pass the date string directly to avoid timezone conversion
                        onUpdate({
                          title: editTitle,
                          dueDate: newDateString,
                          status: editStatus as 'pending' | 'in-progress' | 'completed' | 'overdue',
                          assignedTo: editAssignedTo
                        });
                      }
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <div className="flex justify-end mt-0 items-center gap-1 min-h-[1rem]">
          {isSaving && <span className="text-blue-500 text-[10px] ml-1">Saving...</span>}
          {!isSaving && saveFeedback && <span className="text-green-600 text-[10px] ml-1">Saved!</span>}
        </div>
      </div>
    </Card>
  );
};