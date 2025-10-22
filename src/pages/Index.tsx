import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBoard, Project } from '../components/ProjectBoard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import API from '../api';


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

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    startDate: new Date().toISOString().substring(0, 10),
    stages: INITIAL_STAGES.map((stageName, index) => ({
      id: `stage-${index + 1}`,
      name: stageName,
      tasks: []
    }))
  },
  {
    id: '2',
    name: 'Mobile App Development',
    startDate: new Date().toISOString().substring(0, 10),
    stages: INITIAL_STAGES.map((stageName, index) => ({
      id: `stage-${index + 1}-2`,
      name: stageName,
      tasks: []
    }))
  },
  {
    id: '3',
    name: 'Marketing Campaign Launch',
    startDate: new Date().toISOString().substring(0, 10),
    stages: INITIAL_STAGES.map((stageName, index) => ({
      id: `stage-${index + 1}-3`,
      name: stageName,
      tasks: []
    }))
  }
];

interface IndexPageProps {
  userRole: string;
}

export default function IndexPage({ userRole }: IndexPageProps) {
  const [dashboardView, setDashboardView] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([]);
  const [newAssignee, setNewAssignee] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set the page title aggressively
    document.title = 'VFactory Job Status';
    
    // Also set it after a small delay to ensure it takes effect
    const timer = setTimeout(() => {
      document.title = 'VFactory Job Status';
      console.log('Title set to:', document.title);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, assigneesRes] = await Promise.all([
          API.get(`/projects?archived=${showArchived}`),
          API.get('/assignees')
        ]);
        // Fetch stages and tasks for each project
        const projectsWithStagesAndTasks = await Promise.all(projectsRes.data.map(async (p: any) => {
          const stagesRes = await API.get(`/projects/${p.id}/stages`);
          const stagesWithTasks = await Promise.all((stagesRes.data || []).map(async (stage: any) => {
            const tasksRes = await API.get(`/stages/${stage.id}/tasks`);
            // Map backend fields to frontend fields
            const tasks = (tasksRes.data || []).map((t: any) => ({
              ...t,
              dueDate: t.due_date,
              assignedTo: t.assigned_to
            }));
            return { ...stage, tasks };
          }));
          return { ...p, startDate: p.start_date, stages: stagesWithTasks };
        }));
        const assigneesList = assigneesRes.data.map((a: any) => typeof a === 'string' ? { id: a, name: a } : a);
        setProjects(projectsWithStagesAndTasks);
        setAssignees(assigneesList);
        setLoading(false);
      } catch (err: any) {
        alert('Error loading data: ' + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [showArchived]);

  if (loading) return <div>Loading...</div>;

  // Helper to get all due/overdue tasks grouped by project
  const getDueTasksByProject = () => {
    const result: { projectName: string; tasks: { title: string; dueDate: Date | string; status: string }[] }[] = [];
    for (const project of projects) {
      const dueTasks = project.stages.flatMap(stage =>
        stage.tasks.filter(task => {
          const dueDate = new Date(task.dueDate as any);
          const now = new Date();
          const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          // Exclude completed tasks
          if (task.status === 'completed') return false;
          return task.status === 'overdue' || daysDiff <= 2;
        })
      );
      if (dueTasks.length > 0) {
        result.push({ projectName: project.name, tasks: dueTasks });
      }
    }
    return result;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button onClick={() => setDashboardView(v => !v)} variant="outline">
            {dashboardView ? 'Back to Board' : 'Dashboard View'}
          </Button>
          <Button 
            onClick={() => setShowArchived(v => !v)} 
            variant={showArchived ? "default" : "outline"}
            className={showArchived ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>
        <Button onClick={() => setAdminPanelOpen(true)} variant="secondary">
          Admin Panel
        </Button>
      </div>
      {/* Admin Panel Dialog */}
      <Dialog open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
        <DialogContent className="bg-white border border-blue-100 shadow-md max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-blue-900 text-sm">Manage Assignees</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            <ul className="mb-2">
              {assignees.map((name, idx) => (
                <li key={name.id} className="flex items-center justify-between text-xs py-1">
                  <span>{name.name}</span>
                  <Button size="sm" variant="ghost" className="text-red-500 p-1" onClick={() => {
                    const assigneeToDelete = assignees[idx];
                    API.delete(`/assignees/${assigneeToDelete.id}`)
                      .then(() => setAssignees(assignees.filter((_, i) => i !== idx)));
                  }}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                placeholder="Add assignee"
                className="text-xs"
              />
              <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" disabled={!newAssignee.trim() || assignees.some(a => a.name === newAssignee.trim())} onClick={() => {
                API.post('/assignees', { name: newAssignee.trim() })
                  .then(res => setAssignees(prev => [...prev, res.data]));
                setNewAssignee('');
              }}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {dashboardView ? (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-900 flex items-center gap-2">
            <span>📊</span> Due & Due-Nearing Tasks
          </h2>
          {getDueTasksByProject().length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No due or due-nearing tasks. 🎉</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {getDueTasksByProject().map(group => (
                <div key={group.projectName} className="bg-white border-l-4 border-blue-400 rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-800">{group.projectName}</h3>
                    <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                      {group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {group.tasks.map((task, idx) => {
                      const dueDate = new Date(task.dueDate as any);
                      const now = new Date();
                      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      const isOverdue = daysDiff < 0;
                      const isDueSoon = !isOverdue && daysDiff <= 2;
                      return (
                        <li key={idx} className={
                          `flex items-center gap-3 text-sm p-2 rounded transition ` +
                          (isOverdue
                            ? 'bg-red-50 border border-red-200'
                            : isDueSoon
                              ? 'bg-yellow-50 border border-yellow-200'
                              : 'bg-blue-50 border border-blue-100')
                        }>
                          <span className="font-medium text-blue-900 flex-1">{task.title}</span>
                          <span className="text-xs text-blue-700">Due: {dueDate.toLocaleDateString()}</span>
                          {isOverdue ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">⚠️ Overdue</span>
                          ) : isDueSoon ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">⏰ Due Soon</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <ProjectBoard projects={projects} setProjects={setProjects} assignees={assignees} userRole={userRole} />
      )}
    </div>
  );
}
