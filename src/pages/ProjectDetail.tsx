import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Clock, Archive, ArchiveRestore, Plus, Edit2, Trash2 } from 'lucide-react';
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
  status: string;
  units: Unit[];
  created_at: string;
}

interface ProjectDetailProps {
  user: User;
  onLogout: () => void;
}

export default function ProjectDetail({ user, onLogout }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = user.role === 'admin';
  
  // Unit management states
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState({
    name: '',
    start_date: '',
    end_date: '',
    status: 'Not Started' as Unit['status'],
    comment: ''
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch all projects and find the selected one
        const response = await API.get('/projects');
        const allProjects = response.data || [];
        const selected = allProjects.find((p: Project) => String(p.id) === String(id));

        if (!selected) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setProject(selected);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching project data:', error);
        setError(error.response?.data?.error || 'Failed to fetch project data');
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const handleAddUnit = async () => {
    if (!newUnit.name.trim()) return;
    
    try {
      const response = await API.post(`/projects/${id}/units`, {
        name: newUnit.name,
        start_date: newUnit.start_date || null,
        end_date: newUnit.end_date || null,
        status: newUnit.status,
        comment: newUnit.comment
      });

      const addedUnit = response.data;
      
      // Update local state
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          units: [...prev.units, addedUnit]
        };
      });

      // Reset form and close dialog
      setNewUnit({
        name: '',
        start_date: '',
        end_date: '',
        status: 'Not Started',
        comment: ''
      });
      setShowAddUnit(false);
    } catch (error: any) {
      console.error('Error adding unit:', error);
      alert('Failed to add unit. Please try again.');
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnit) return;
    
    try {
      await API.put(`/units/${editingUnit.id}`, {
        status: editingUnit.status,
        comment: editingUnit.comment
      });

      // Update local state
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          units: prev.units.map(unit =>
            unit.id === editingUnit.id ? editingUnit : unit
          )
        };
      });

      setEditingUnit(null);
    } catch (error: any) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit. Please try again.');
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await API.delete(`/units/${unitId}`);
      
      // Update local state
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          units: prev.units.filter(unit => unit.id !== unitId)
        };
      });
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      alert('Failed to delete unit. Please try again.');
    }
  };

  const handleArchiveProject = async () => {
    if (!confirm('Are you sure you want to archive this project? Archived projects will be moved to the archived section.')) return;
    
    try {
      await API.put(`/projects/${id}/archive`, { archived: true });
      
      // Navigate back to dashboard after archiving
      navigate('/');
    } catch (error: any) {
      console.error('Error archiving project:', error);
      alert('Failed to archive project. Please try again.');
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

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{project.units.length} units</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              
              {/* Archive button - only show when project is completed */}
              {isAdmin && project.status === 'Completed' && (
                <Button
                  variant="outline"
                  onClick={handleArchiveProject}
                  className="flex items-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Archive className="h-4 w-4" />
                  <span>Archive Project</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      {project.description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{project.description}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Units */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Units</h2>
            <p className="text-gray-600">Manage the individual components of this project</p>
          </div>
          
          {isAdmin && (
            <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Unit</span>
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
                <DialogDescription>
                  Add a new unit to this project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="unit-name">Unit Name</Label>
                  <Input
                    id="unit-name"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    placeholder="e.g., Bedroom 1, Kitchen"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newUnit.start_date}
                      onChange={(e) => setNewUnit({ ...newUnit, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newUnit.end_date}
                      onChange={(e) => setNewUnit({ ...newUnit, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="unit-status">Status</Label>
                  <Select value={newUnit.status} onValueChange={(value: Unit['status']) => setNewUnit({ ...newUnit, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit-comment">Comment</Label>
                  <Textarea
                    id="unit-comment"
                    value={newUnit.comment}
                    onChange={(e) => setNewUnit({ ...newUnit, comment: e.target.value })}
                    placeholder="Add any notes or comments..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUnit(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUnit}>
                  Add Unit
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.units.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {unit.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getUnitStatusColor(unit.status)}>
                      {unit.status}
                    </Badge>
                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUnit({ ...unit })}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {unit.comment && (
                    <div className="text-sm text-gray-600">
                      <strong>Comment:</strong> {unit.comment}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <div className="font-medium">{formatDate(unit.start_date)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <div className="font-medium">{formatDate(unit.end_date)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {project.units.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No units yet</h3>
            <p className="text-gray-600">This project doesn't have any units defined yet.</p>
          </div>
        )}
      </div>

      {/* Edit Unit Dialog */}
      {editingUnit && (
        <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit: {editingUnit.name}</DialogTitle>
              <DialogDescription>
                Update the unit status and comments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-unit-status">Status</Label>
                <Select value={editingUnit.status} onValueChange={(value: Unit['status']) => setEditingUnit({ ...editingUnit, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-unit-comment">Comment</Label>
                <Textarea
                  id="edit-unit-comment"
                  value={editingUnit.comment}
                  onChange={(e) => setEditingUnit({ ...editingUnit, comment: e.target.value })}
                  placeholder="Add any notes or comments..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUnit(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUnit}>
                Update Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
