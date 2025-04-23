import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, Tool, Calendar, User, UserCog, Settings, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  // Role-based access control
const [userRole, setUserRole] = useState('admin'); // In real app, this would come from auth context
const [rolePermissions] = useState({
  admin: ['view_all', 'assign_tech', 'manage_users', 'view_analytics'],
  support: ['view_assigned', 'update_status', 'contact_client'],
  technician: ['view_assigned', 'update_status', 'add_notes']
});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
const [filterPriority, setFilterPriority] = useState('all');
const [filterTechnician, setFilterTechnician] = useState('all');
const [searchQuery, setSearchQuery] = useState('');

// Workflow status options
const statusOptions = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' }
];

// Priority levels
const priorityLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

  // Mock data - In real app, this would come from your backend
  const requests = [
    {
      id: 'REQ-123456',
      clientName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      serviceType: 'Hardware Repair',
      deviceType: 'Laptop',
      deviceDetails: 'MacBook Pro 2021',
      issue: 'Screen flickering and battery issues',
      status: 'pending',
      submittedDate: '2024-01-15',
      scheduledDate: '2024-01-17',
      priority: 'high',
      assignedTech: null,
      notes: []
    },
    {
      id: 'REQ-123457',
      clientName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      serviceType: 'Software Issue',
      deviceType: 'Desktop',
      deviceDetails: 'Custom PC Build',
      issue: 'System crashes after recent update',
      status: 'inProgress',
      submittedDate: '2024-01-14',
      scheduledDate: '2024-01-16',
      priority: 'medium',
      assignedTech: 'Alice Smith',
      notes: ['Initial diagnosis completed', 'Backup created']
    },
    {
      id: 'REQ-123458',
      clientName: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567892',
      serviceType: 'Data Recovery',
      deviceType: 'External Drive',
      deviceDetails: 'Seagate 2TB',
      issue: 'Drive not recognized, important files needed',
      status: 'completed',
      submittedDate: '2024-01-13',
      scheduledDate: '2024-01-15',
      priority: 'high',
      assignedTech: 'Bob Wilson',
      notes: ['Successfully recovered 95% of files', 'Client notified']
    }
  ];

  const technicians = [
    {
      id: 1,
      name: 'Alice Smith',
      specialization: 'Hardware',
      status: 'available',
      currentTasks: 2,
      completedTasks: 145,
      rating: 4.8,
      expertise: ['Laptop Repair', 'Screen Replacement', 'Battery Service']
    },
    {
      id: 2,
      name: 'Bob Wilson',
      specialization: 'Software & Data',
      status: 'busy',
      currentTasks: 3,
      completedTasks: 167,
      rating: 4.9,
      expertise: ['Data Recovery', 'OS Installation', 'Virus Removal']
    },
    {
      id: 3,
      name: 'Carol Martinez',
      specialization: 'Networking',
      status: 'available',
      currentTasks: 1,
      completedTasks: 98,
      rating: 4.7,
      expertise: ['Network Setup', 'WiFi Configuration', 'Security Implementation']
    }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-500',
      inProgress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      rejected: 'bg-red-500'
    };
    return <Badge className={`${statusStyles[status]} text-white`}>{status}</Badge>;
  };

  const handleRequestAction = (request, action) => {
    // In a real app, this would make an API call
    console.log(`${action} request:`, request);
  };

  const handleAssignTechnician = (request, techId) => {
    // In a real app, this would make an API call
    console.log('Assigning technician:', techId, 'to request:', request.id);
  };

  // Filter and search requests
const filteredRequests = requests.filter(request => {
    // Status filter
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    
    // Priority filter
    if (filterPriority !== 'all' && request.priority !== filterPriority) return false;
    
    // Technician filter
    if (filterTechnician !== 'all' && request.assignedTech !== filterTechnician) return false;
    
    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        request.id.toLowerCase().includes(searchLower) ||
        request.clientName.toLowerCase().includes(searchLower) ||
        request.issue.toLowerCase().includes(searchLower) ||
        request.deviceType.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getRequestActionButtons = (request) => {
    switch (userRole) {
      case 'admin':
        return (
          <div className="flex items-center gap-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                  View Details
                </Button>
                {rolePermissions[userRole]?.includes('assign_tech') && (
                  <Select onValueChange={(techId) => handleAssignTechnician(request, techId)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Assign Tech" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedRequest?.id === request.id && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Status</Label>
                      <Select 
                        value={request.status} 
                        onValueChange={(status) => handleStatusUpdate(request, status)}
                        disabled={!rolePermissions[userRole]?.includes('update_status')}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {rolePermissions[userRole]?.includes('add_notes') && (
                      <div className="space-y-2">
                        <Label>Add Note</Label>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Add a note about this request..."
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                          />
                          <Button 
                            onClick={() => handleAddNote(request, document.querySelector('textarea').value)}
                            className="self-start"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {request.notes && request.notes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Notes History</Label>
                        <div className="space-y-2">
                          {request.notes.map((note, index) => (
                            <div key={index} className="text-sm text-gray-400 bg-slate-900 p-2 rounded">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
            <Select onValueChange={(techId) => handleAssignTechnician(request, techId)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assign Tech" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'support':
        return (
          <div className="flex items-center gap-2">
            {request.status === 'pending' && (
              <>
                <Button size="sm" className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleRequestAction(request, 'approve')}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive"
                  onClick={() => handleRequestAction(request, 'reject')}>
                  Reject
                </Button>
              </>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                  View Details
                </Button>
                {rolePermissions[userRole]?.includes('assign_tech') && (
                  <Select onValueChange={(techId) => handleAssignTechnician(request, techId)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Assign Tech" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedRequest?.id === request.id && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Status</Label>
                      <Select 
                        value={request.status} 
                        onValueChange={(status) => handleStatusUpdate(request, status)}
                        disabled={!rolePermissions[userRole]?.includes('update_status')}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {rolePermissions[userRole]?.includes('add_notes') && (
                      <div className="space-y-2">
                        <Label>Add Note</Label>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Add a note about this request..."
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                          />
                          <Button 
                            onClick={() => handleAddNote(request, document.querySelector('textarea').value)}
                            className="self-start"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {request.notes && request.notes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Notes History</Label>
                        <div className="space-y-2">
                          {request.notes.map((note, index) => (
                            <div key={index} className="text-sm text-gray-400 bg-slate-900 p-2 rounded">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      case 'technician':
        return (
          <div className="flex items-center gap-2">
            {request.status === 'inProgress' && (
              <Button size="sm" className="bg-green-500 hover:bg-green-600"
                onClick={() => handleRequestAction(request, 'complete')}>
                Mark Complete
              </Button>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                  View Details
                </Button>
                {rolePermissions[userRole]?.includes('assign_tech') && (
                  <Select onValueChange={(techId) => handleAssignTechnician(request, techId)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Assign Tech" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedRequest?.id === request.id && (
                <Card className="bg-slate-800 border-slate-700 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Status</Label>
                      <Select 
                        value={request.status} 
                        onValueChange={(status) => handleStatusUpdate(request, status)}
                        disabled={!rolePermissions[userRole]?.includes('update_status')}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {rolePermissions[userRole]?.includes('add_notes') && (
                      <div className="space-y-2">
                        <Label>Add Note</Label>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Add a note about this request..."
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                          />
                          <Button 
                            onClick={() => handleAddNote(request, document.querySelector('textarea').value)}
                            className="self-start"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {request.notes && request.notes.length > 0 && (
                      <div className="space-y-2">
                        <Label>Notes History</Label>
                        <div className="space-y-2">
                          {request.notes.map((note, index) => (
                            <div key={index} className="text-sm text-gray-400 bg-slate-900 p-2 rounded">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Handle status update
const handleStatusUpdate = (request, newStatus) => {
    // In a real app, this would make an API call
    console.log(`Updating status for request ${request.id} to ${newStatus}`);
  };

  // Handle adding notes
  const handleAddNote = (request, note) => {
    // In a real app, this would make an API call
    console.log(`Adding note to request ${request.id}: ${note}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Service Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-800 border-slate-700"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorityLevels.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              {userRole === 'admin' && (
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Total Requests</p>
                    <h3 className="text-2xl font-bold">{requests.length}</h3>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Pending Approval</p>
                    <h3 className="text-2xl font-bold">
                      {requests.filter(r => r.status === 'pending').length}
                    </h3>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">In Progress</p>
                    <h3 className="text-2xl font-bold">
                      {requests.filter(r => r.status === 'inProgress').length}
                    </h3>
                  </div>
                  <Tool className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Completed Today</p>
                    <h3 className="text-2xl font-bold">
                      {requests.filter(r => r.status === 'completed').length}
                    </h3>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Service Requests
              </TabsTrigger>
              <TabsTrigger value="technicians" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Technicians
              </TabsTrigger>
              {userRole === 'admin' && (
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <UserCog className="w-4 h-4" /> Analytics
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="requests">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Service Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">{request.clientName}</p>
                            {getStatusBadge(request.status)}
                            {request.priority === 'high' && (
                              <Badge variant="outline" className="border-red-500 text-red-500">High Priority</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-400">
                            <p>Service: {request.serviceType}</p>
                            <p>Device: {request.deviceType}</p>
                            <p>Submitted: {request.submittedDate}</p>
                            <p>Scheduled: {request.scheduledDate || 'Not scheduled'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          {getRequestActionButtons(request)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technicians">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Technician Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {technicians.map(tech => (
                      <div key={tech.id} className="p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-lg">{tech.name}</p>
                            <p className="text-sm text-gray-400">{tech.specialization}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={tech.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {tech.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">{tech.currentTasks} active tasks</p>
                              <p className="text-xs text-gray-400">{tech.completedTasks} completed</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tech.expertise.map((skill, index) => (
                            <Badge key={index} variant="outline" className="border-cyan-500 text-cyan-400">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        {userRole === 'admin' && (
                          <div className="flex justify-end mt-3">
                            <Button variant="outline" size="sm">
                              View Performance
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Request Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add charts/graphs here */}
                    <p className="text-gray-400">Analytics visualization coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;