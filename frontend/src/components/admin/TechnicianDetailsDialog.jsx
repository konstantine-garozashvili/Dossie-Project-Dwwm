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
    <p className="text-sm text-slate-400 font-medium">{label}</p>
    {isBadge ? (
      <Badge variant={badgeVariant} className="capitalize text-sm">{value ? value.replace('_',' ') : 'N/A'}</Badge>
    ) : (
      <p className="text-slate-200 text-sm">{value || 'N/A'}</p>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-850 border-slate-700 text-slate-200">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-cyan-400 text-xl flex items-center">
            <Avatar className="h-12 w-12 mr-3 border-2 border-cyan-500">
              <AvatarImage src={technician.profile_picture_url} alt={`${technician.name} ${technician.surname}`} />
              <AvatarFallback className="text-xl bg-slate-700">
                {getInitials(technician.name, technician.surname)}
              </AvatarFallback>
            </Avatar>
            {technician.name} {technician.surname}
          </DialogTitle>
          <DialogDescription>
            Détails complets du technicien.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-850">
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
            {/* Add more details here if fetched from a more comprehensive profile, e.g., from technician_applications data */}
        </div>

        <DialogFooter className="pt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-slate-600 hover:bg-slate-700">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianDetailsDialog; 