import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from 'lucide-react';

const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'pending_approval', label: 'En attente d\'approbation' },
];

// TODO: Consider fetching specializations from a shared config or API if they become dynamic
const specializationOptions = [
  'Réparation Matérielle',
  'Dépannage Logiciel',
  'Configuration Réseau',
  'Récupération de Données',
  'Réparation d\'Appareils Mobiles',
  'Systèmes de Sécurité',
  'Support Informatique Général',
  'Autre'
];

const TechnicianFormDialog = ({ open, onOpenChange, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        setFormData({
          name: initialData.name || '',
          surname: initialData.surname || '',
          email: initialData.email || '',
          phone_number: initialData.phone_number || '',
          specialization: initialData.specialization || '',
          status: initialData.status || 'active',
          profile_picture_url: initialData.profile_picture_url || '',
        });
      } else {
        // Default for new technician
        setFormData({
          name: '',
          surname: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone_number: '',
          specialization: '',
          status: 'pending_approval',
          profile_picture_url: '', // Ensure it's defined for non-edit mode too
        });
      }
      setErrors({}); // Clear errors when dialog opens or initialData changes
    }
  }, [open, initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Le nom est requis.";
    if (!formData.surname) newErrors.surname = "Le prénom est requis.";
    if (!formData.email) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'adresse email est invalide.";
    }
    if (!isEditMode && !formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } 
    if (formData.password && formData.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    if (!formData.status) newErrors.status = "Le statut est requis.";
    // Add more validations as needed (e.g., phone_number format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = { ...formData };
      if (!isEditMode) {
        delete dataToSubmit.confirmPassword; // Don't send confirmPassword to backend
      }
      if (isEditMode && !dataToSubmit.password) { // If password not changed in edit mode, don't send it
        delete dataToSubmit.password;
      }
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">{isEditMode ? 'Modifier le Technicien' : 'Ajouter un Technicien'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifiez les informations du technicien.' : 'Remplissez les informations pour ajouter un nouveau technicien.'}
          </DialogDescription>
        </DialogHeader>
        {isEditMode && initialData && (
          <div className="flex justify-center my-4">
            <Avatar className="w-24 h-24">
              {formData.profile_picture_url ? (
                <AvatarImage 
                  src={formData.profile_picture_url || null}
                  alt={`${formData.name || initialData.name} ${formData.surname || initialData.surname}`} 
                />
              ) : null}
              <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                {(initialData.name?.charAt(0) || '').toUpperCase()}
                {(initialData.surname?.charAt(0) || '').toUpperCase()}
                {!(initialData.name?.charAt(0)) && !(initialData.surname?.charAt(0)) && 'DG'} {/* Default Guest/Generic initials */}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="surname">Prénom</Label>
              <Input id="surname" name="surname" value={formData.surname || ''} onChange={handleChange} />
              {errors.surname && <p className="text-destructive text-sm mt-1">{errors.surname}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} />
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleChange} />
                {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}
          {isEditMode && (
             <div>
                <Label htmlFor="password">Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} placeholder="Minimum 6 caractères"/>
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="phone_number">Téléphone</Label>
            <Input id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
            {/* Add phone validation if needed */}
          </div>
          <div>
            <Label htmlFor="specialization">Spécialisation</Label>
            <Select name="specialization" value={formData.specialization || ''} onValueChange={(value) => handleSelectChange('specialization', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une spécialisation" />
              </SelectTrigger>
              <SelectContent>
                {specializationOptions.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select name="status" value={formData.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-destructive text-sm mt-1">{errors.status}</p>}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? 'Enregistrer' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianFormDialog; 