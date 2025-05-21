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
      if (isEditMode) {
        setFormData({
          name: initialData.name || '',
          surname: initialData.surname || '',
          email: initialData.email || '',
          phone_number: initialData.phone_number || '',
          specialization: initialData.specialization || '',
          status: initialData.status || 'active',
          // Password is not pre-filled for editing for security
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
      <DialogContent className="sm:max-w-lg bg-slate-850 border-slate-700 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">{isEditMode ? 'Modifier le Technicien' : 'Ajouter un Technicien'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifiez les informations du technicien.' : 'Remplissez les informations pour ajouter un nouveau technicien.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-400">Nom</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="surname" className="text-slate-400">Prénom</Label>
              <Input id="surname" name="surname" value={formData.surname || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-slate-400">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-slate-400">Mot de passe</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-400">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}
          {isEditMode && (
             <div>
                <Label htmlFor="password" className="text-slate-400">Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" placeholder="Minimum 6 caractères"/>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="phone_number" className="text-slate-400">Téléphone</Label>
            <Input id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="bg-slate-800 border-slate-600" />
            {/* Add phone validation if needed */}
          </div>
          <div>
            <Label htmlFor="specialization" className="text-slate-400">Spécialisation</Label>
            <Select name="specialization" value={formData.specialization || ''} onValueChange={(value) => handleSelectChange('specialization', value)}>
              <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                <SelectValue placeholder="Sélectionner une spécialisation" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {specializationOptions.map(spec => (
                  <SelectItem key={spec} value={spec} className="hover:bg-slate-700 focus:bg-slate-700">{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" className="text-slate-400">Statut</Label>
            <Select name="status" value={formData.status || ''} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="hover:bg-slate-700 focus:bg-slate-700">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-slate-600 hover:bg-slate-700">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? 'Enregistrer' : 'Ajouter')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianFormDialog; 