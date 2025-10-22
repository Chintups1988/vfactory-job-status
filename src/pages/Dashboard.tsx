import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LogOut, Calendar, Building2, RefreshCw, Archive } from 'lucide-react';
import API from '../api';

interface User {
  username: string;
  token: string;
  role: 'admin' | 'viewer';
}

interface Unit {
  id: number;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';
  comment: string;
  start_date: string;
  end_date: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'Not Started' | 'Running' | 'Completed' | 'Blocked';
  units: Unit[];
  created_at: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [addingProject, setAddingProject] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  const fetchProjects = async () => {
    try {
      setError(''); // Clear any previous errors
      console.log('Fetching projects...', { showArchived });
      const response = await API.get(`/projects?archived=${showArchived}`);
      console.log('Projects fetched successfully:', response.data.length);
      setProjects(response.data);
    } catch (err: any) {
      console.error('Fetch projects error:', err);
      
      let errorMessage = 'Failed to fetch projects';
      
      if (err.message && err.message.includes('connect')) {
        errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 5001.';
      } else if (err.message && err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    setAddingProject(true);
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    
    console.log('Creating project:', newProject);
    
    try {
      const response = await API.post('/projects', newProject);
      console.log('Project creation response:', response.data);
      const createdProject = response.data;
      
      // Refresh the entire projects list to get the latest data
      await fetchProjects();
      
      setNewProject({ name: '', description: '' });
      setShowAddProject(false);
      
      // Show success message
      setSuccess('Project created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Project creation error:', err);
      
      let errorMessage = 'Failed to create project';
      
      if (err.message && err.message.includes('connect')) {
        errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 5001.';
      } else if (err.message && err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setAddingProject(false);
    }
  };

  const handleRestoreProject = async (projectId: number) => {
    try {
      await API.put(`/projects/${projectId}/archive`, { archived: false });
      
      // Refresh the projects list
      await fetchProjects();
      
      // Show success message
      setSuccess('Project restored successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to restore project');
    }
  };

  const calculateProjectStatus = (units: Unit[]): Project['status'] => {
    if (units.length === 0) return 'Not Started';
    
    if (units.some(unit => unit.status === 'In Progress')) {
      return 'Running';
    } else if (units.every(unit => unit.status === 'Completed')) {
      return 'Completed';
    } else if (units.some(unit => unit.status === 'Blocked')) {
      return 'Blocked';
    } else {
      return 'Not Started';
    }
  };

  const handleUpdateUnitStatus = async (projectId: number, unitId: number, newStatus: Unit['status']) => {
    try {
      await API.patch(`/units/${unitId}/status`, { status: newStatus });
      
      // Update local state immediately for better UX
      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          // Update the unit status
          const updatedUnits = project.units.map(unit => 
            unit.id === unitId ? { ...unit, status: newStatus } : unit
          );
          
          // Recalculate project status based on unit statuses
          const newProjectStatus = calculateProjectStatus(updatedUnits);
          
          return {
            ...project,
            units: updatedUnits,
            status: newProjectStatus
          };
        }
        return project;
      }));
      
      // Show success message
      setSuccess('Unit status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update unit status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCardGradient = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-orange-200 hover:border-orange-300';
      case 'Completed':
        return 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 hover:border-green-300';
      case 'Blocked':
        return 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-red-200 hover:border-red-300';
      default:
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 hover:border-blue-300';
    }
  };

  const getCardAccent = (status: string) => {
    switch (status) {
      case 'Running':
        return 'from-yellow-400 to-orange-500';
      case 'Completed':
        return 'from-green-400 to-emerald-500';
      case 'Blocked':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return '🟡';
      case 'Completed':
        return '🟢';
      case 'Blocked':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">VFactory Job Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.username} 
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {user.role === 'admin' ? '👨‍💼 Admin' : '👁️ Viewer'}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Project Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Project</span>
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your portfolio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="e.g., Flat 21 Artec"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Project description..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProject(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProject} disabled={addingProject}>
                    {addingProject ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Archive Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show Archived:</span>
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center space-x-2"
            >
              {showArchived ? (
                <>
                  <Archive className="h-4 w-4" />
                  <span>Archived</span>
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  <span>Active</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* Success Display */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 shadow-md ${getCardGradient(project.status)}`}
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <CardHeader className="pb-1 px-3 pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`text-sm font-semibold text-gray-800 truncate bg-gradient-to-r ${getCardAccent(project.status)} bg-clip-text text-transparent`}>
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {project.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-1">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold px-1.5 py-0.5 shadow-sm ${getStatusColor(project.status)} border`}
                    >
                      {getStatusIcon(project.status)} {project.status}
                    </Badge>
                    {showArchived && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreProject(project.id);
                        }}
                        className="flex items-center space-x-0.5 text-green-600 border-green-200 hover:bg-green-50 shadow-sm h-5 px-1.5 text-[10px]"
                      >
                        <Archive className="h-2.5 w-2.5" />
                        <span>Restore</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2 px-3 pb-3">
                {/* Project Info */}
                <div className={`flex items-center justify-between text-[10px] p-1.5 rounded ${project.status === 'Running' ? 'bg-orange-100/50 text-orange-700' : 
                  project.status === 'Completed' ? 'bg-green-100/50 text-green-700' :
                  project.status === 'Blocked' ? 'bg-red-100/50 text-red-700' :
                  'bg-blue-100/50 text-blue-700'}`}>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <Building2 className="h-2.5 w-2.5" />
                      <span className="font-medium">{project.units.length} units</span>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className={`p-2 rounded-md shadow-sm ${project.status === 'Running' ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 
                  project.status === 'Completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                  project.status === 'Blocked' ? 'bg-gradient-to-r from-red-50 to-pink-50' :
                  'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                  <div className={`text-[10px] font-semibold mb-1.5 block ${project.status === 'Running' ? 'text-orange-700' : 
                    project.status === 'Completed' ? 'text-green-700' :
                    project.status === 'Blocked' ? 'text-red-700' :
                    'text-blue-700'}`}>
                    📋 Units
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {project.units.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded px-2 py-1.5 border border-white/50 min-h-[28px] shadow-sm hover:bg-white/90 transition-colors">
                        <span className="text-[10px] text-gray-700 font-medium truncate flex-1 mr-1.5">{unit.name}</span>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {isAdmin ? (
                            <Select 
                              value={unit.status} 
                              onValueChange={(value) => handleUpdateUnitStatus(project.id, unit.id, value as Unit['status'])}
                            >
                              <SelectTrigger className={`h-5 w-24 text-[10px] border bg-white/90 shadow-sm hover:shadow-md transition-shadow ${project.status === 'Running' ? 'border-orange-200 hover:border-orange-300' : 
                                project.status === 'Completed' ? 'border-green-200 hover:border-green-300' :
                                project.status === 'Blocked' ? 'border-red-200 hover:border-red-300' :
                                'border-blue-200 hover:border-blue-300'}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Blocked">Blocked</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge 
                              variant="outline"
                              className={`h-5 text-[10px] px-2 ${
                                unit.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                unit.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                unit.status === 'Blocked' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {unit.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No archived projects' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showArchived 
                ? 'Archived projects will appear here once you archive completed projects'
                : 'Get started by creating your first project'
              }
            </p>
            {!showArchived && (
              <Button onClick={() => setShowAddProject(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
