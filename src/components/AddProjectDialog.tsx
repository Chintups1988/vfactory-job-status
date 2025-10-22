import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, cloneProjectId?: string) => void;
  projects: { id: string; name: string }[];
}

export const AddProjectDialog = ({ open, onOpenChange, onAdd, projects }: AddProjectDialogProps) => {
  const [name, setName] = useState('');
  const [cloneProjectId, setCloneProjectId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      console.log('Creating project:', name.trim());
      console.log('Clone project ID:', cloneProjectId || 'none');
      onAdd(name.trim(), cloneProjectId || undefined);
      setName('');
      setCloneProjectId('');
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName('');
      setCloneProjectId('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border shadow-elegant">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new project to start tracking tasks across all stages.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-foreground">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="bg-background border-border focus:border-primary"
              autoFocus
            />
            <Label htmlFor="clone-project" className="text-foreground mt-2">Clone from existing project (optional)</Label>
            <select
              id="clone-project"
              value={cloneProjectId}
              onChange={e => {
                console.log('Clone selection changed to:', e.target.value);
                setCloneProjectId(e.target.value);
              }}
              className="w-full border border-border rounded px-2 py-1 mt-1"
            >
              <option value="">-- Do not clone --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
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
              disabled={!name.trim()}
              className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};