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
    return <p className="text-center text-slate-400 py-8">Aucun technicien trouvé.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full bg-slate-800 border border-slate-700 rounded-md">
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-700/30">
            <TableHead className="text-slate-300">Nom</TableHead>
            <TableHead className="text-slate-300">Prénom</TableHead>
            <TableHead className="text-slate-300">Email</TableHead>
            <TableHead className="text-slate-300">Téléphone</TableHead>
            <TableHead className="text-slate-300">Spécialisation</TableHead>
            <TableHead className="text-slate-300">Statut</TableHead>
            <TableHead className="text-slate-300 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technicians.map((technician) => (
            <TableRow key={technician.id} className="border-slate-700 hover:bg-slate-700/50">
              <TableCell>{technician.name}</TableCell>
              <TableCell>{technician.surname}</TableCell>
              <TableCell>{technician.email}</TableCell>
              <TableCell>{technician.phone_number || 'N/A'}</TableCell>
              <TableCell>{technician.specialization || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(technician.status)} className="capitalize">
                  {technician.status ? technician.status.replace('_', ' ') : 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                {onViewDetails && (
                  <Button variant="ghost" size="icon" onClick={() => onViewDetails(technician)} className="text-sky-400 hover:text-sky-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(technician)} className="text-amber-400 hover:text-amber-300">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(technician.id)} className="text-red-500 hover:text-red-400">
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