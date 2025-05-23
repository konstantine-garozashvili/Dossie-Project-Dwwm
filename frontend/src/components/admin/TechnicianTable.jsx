import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from 'lucide-react';

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'; // Assuming you have a success variant for Badge
    case 'inactive':
      return 'destructive';
    case 'pending_approval':
      return 'pending'; // Changed from 'outline' to 'pending'
    default:
      return 'secondary';
  }
};

const TechnicianTable = ({ technicians, onEdit, onDelete, onViewDetails }) => {
  if (!technicians || technicians.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Aucun technicien trouvé.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full bg-card border border-border rounded-md">
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/30">
            <TableHead className="text-muted-foreground">Nom</TableHead>
            <TableHead className="text-muted-foreground">Prénom</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Téléphone</TableHead>
            <TableHead className="text-muted-foreground">Spécialisation</TableHead>
            <TableHead className="text-muted-foreground">Statut</TableHead>
            <TableHead className="text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((technician) => (
            <TableRow key={technician.id} className="border-border hover:bg-muted/50">
              <TableCell className="text-foreground">{technician.name}</TableCell>
              <TableCell className="text-foreground">{technician.surname}</TableCell>
              <TableCell className="text-foreground">{technician.email}</TableCell>
              <TableCell className="text-foreground">{technician.phone_number || 'N/A'}</TableCell>
              <TableCell className="text-foreground">{technician.specialization || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(technician.status)} className="capitalize">
                  {technician.status ? technician.status.replace('_', ' ') : 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(technician)} className="text-primary hover:text-primary/80">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(technician)} className="text-secondary-foreground hover:text-secondary-foreground/80">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(technician.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TechnicianTable; 