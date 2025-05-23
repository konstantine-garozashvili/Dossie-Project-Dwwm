import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TECHNICIAN_APPLICATION_ENDPOINTS } from '@/config/api';
import { useToast } from "@/components/ui/use-toast";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(TECHNICIAN_APPLICATION_ENDPOINTS.GET_ALL_APPLICATIONS);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidatures.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors du chargement des candidatures.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'reviewing': return 'outline';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'reviewing': return 'En cours d\'examen';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailsOpen(true);
  };

  const handleAction = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setAdminNotes('');
    setIsActionDialogOpen(true);
  };

  const submitAction = async () => {
    if (!selectedApplication) return;
    
    setIsSubmitting(true);
    try {
      const endpoint = actionType === 'approve' 
        ? TECHNICIAN_APPLICATION_ENDPOINTS.APPROVE_APPLICATION(selectedApplication.application_id)
        : TECHNICIAN_APPLICATION_ENDPOINTS.UPDATE_APPLICATION_STATUS(selectedApplication.application_id);
      
      const body = actionType === 'approve' 
        ? { notes: adminNotes }
        : { status: 'rejected', notes: adminNotes };
      
      const response = await fetch(endpoint, {
        method: actionType === 'approve' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: actionType === 'approve' ? "Candidature approuvée" : "Candidature refusée",
          description: actionType === 'approve' 
            ? "Le compte technicien a été créé avec succès."
            : "La candidature a été refusée.",
          variant: "success",
        });
        
        // Refresh applications list
        fetchApplications();
        setIsActionDialogOpen(false);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting action:', error);
      toast({
        title: "Erreur",
        description: "Erreur de connexion lors de l'action.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des candidatures...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Candidatures</h2>
        <Button onClick={fetchApplications} variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune candidature trouvée.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Spécialisation</TableHead>
                  <TableHead>Expérience</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.application_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {application.personal_info.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.personal_info.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {application.professional_info.specialization}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {application.professional_info.yearsExperience} ans
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(application.submitted_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(application, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(application, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Application Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom complet</Label>
                    <p className="text-foreground">{selectedApplication.personal_info.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-foreground">{selectedApplication.personal_info.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <p className="text-foreground">{selectedApplication.personal_info.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Localisation</Label>
                    <p className="text-foreground">{selectedApplication.personal_info.location}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Spécialisation</Label>
                      <p className="text-foreground">{selectedApplication.professional_info.specialization}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Années d'expérience</Label>
                      <p className="text-foreground">{selectedApplication.professional_info.yearsExperience} ans</p>
                    </div>
                  </div>
                  {selectedApplication.professional_info.certifications && (
                    <div>
                      <Label className="text-sm font-medium">Certifications</Label>
                      <p className="text-foreground">{selectedApplication.professional_info.certifications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedApplication.documents.cv && (
                    <div className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">CV</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.documents.cv.secure_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  )}
                  
                  {selectedApplication.documents.motivationLetter && (
                    <div className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Lettre de motivation</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedApplication.documents.motivationLetter.secure_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  )}
                  
                  {selectedApplication.documents.diplomas && selectedApplication.documents.diplomas.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Diplômes ({selectedApplication.documents.diplomas.length})</Label>
                      <div className="space-y-2">
                        {selectedApplication.documents.diplomas.map((diploma, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">Diplôme {index + 1}</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={diploma.secure_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {selectedApplication.admin_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes administratives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{selectedApplication.admin_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approuver la candidature' : 'Refuser la candidature'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {actionType === 'approve' 
                ? 'Êtes-vous sûr de vouloir approuver cette candidature ? Un compte technicien sera automatiquement créé.'
                : 'Êtes-vous sûr de vouloir refuser cette candidature ? Le candidat ne pourra plus se connecter.'
              }
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="admin-notes">
                {actionType === 'approve' ? 'Notes (optionnel)' : 'Raison du refus (requis)'}
              </Label>
              <Textarea
                id="admin-notes"
                placeholder={actionType === 'approve' 
                  ? 'Ajoutez des notes sur l\'approbation...'
                  : 'Expliquez pourquoi cette candidature est refusée...'
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                required={actionType === 'reject'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={submitAction}
              disabled={isSubmitting || (actionType === 'reject' && !adminNotes.trim())}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'approve' ? 'Approuver' : 'Refuser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationManagement; 