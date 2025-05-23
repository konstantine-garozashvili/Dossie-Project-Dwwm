import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DetailItem = ({ label, value, isBadge, badgeVariant }) => (
  <div className="mb-3">
    <p className="text-sm text-muted-foreground font-medium">{label}</p>
    {isBadge ? (
      <Badge variant={badgeVariant} className="capitalize text-sm">{value ? value.replace('_',' ') : 'N/A'}</Badge>
    ) : (
      <p className="text-foreground text-sm">{value || 'N/A'}</p>
    )}
  </div>
);

const TechnicianDetailsDialog = ({ open, onOpenChange, technician }) => {
  if (!technician) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'destructive';
      case 'pending_approval': return 'outline';
      default: return 'secondary';
    }
  };

  const getInitials = (name, surname) => {
    const first = name ? name.charAt(0).toUpperCase() : '';
    const second = surname ? surname.charAt(0).toUpperCase() : '';
    return first + second || 'T';
  };

  // Generate default UI Avatar URL if no profile picture exists
  const getProfilePictureUrl = () => {
    if (technician.profile_picture_url) {
      return technician.profile_picture_url;
    }
    
    // Generate UI Avatars URL as fallback
    const fullName = `${technician.name || 'T'} ${technician.surname || ''}`.trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&size=128`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-primary text-xl flex items-center">
            <Avatar className="h-12 w-12 mr-3 border-2 border-primary">
              <AvatarImage 
                src={getProfilePictureUrl()} 
                alt={`${technician.name} ${technician.surname}`} 
              />
              <AvatarFallback className="text-xl bg-muted text-muted-foreground">
                {getInitials(technician.name, technician.surname)}
              </AvatarFallback>
            </Avatar>
            {technician.name} {technician.surname}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Détails complets du technicien.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <DetailItem label="ID" value={technician.id} />
            <DetailItem label="Email" value={technician.email} />
            <DetailItem label="Téléphone" value={technician.phone_number} />
            <DetailItem label="Spécialisation" value={technician.specialization} />
            <DetailItem 
                label="Statut" 
                value={technician.status} 
                isBadge 
                badgeVariant={getStatusVariant(technician.status)} 
            />
            <DetailItem label="Date de création" value={technician.created_at ? new Date(technician.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
            <DetailItem label="Dernière mise à jour" value={technician.updated_at ? new Date(technician.updated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
        </div>

        <DialogFooter className="pt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-border hover:bg-muted">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianDetailsDialog; 