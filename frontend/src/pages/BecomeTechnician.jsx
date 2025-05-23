import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Laptop, Scroll, Star, Wrench, Award, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const specializations = [
  'Réparation Matérielle',
  'Dépannage Logiciel',
  'Configuration Réseau',
  'Récupération de Données',
  'Réparation d\'Appareils Mobiles',
  'Systèmes de Sécurité',
  'Support Informatique Général'
];

const allowedFileTypes = {
  cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  diplomas: ['application/pdf', 'image/jpeg', 'image/png'],
  motivationLetter: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const maxFileSize = 5 * 1024 * 1024; // 5MB

export const BecomeTechnician = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
    },
    professionalInfo: {
      specialization: '',
      yearsExperience: '',
      certifications: '',
      availability: '',
      toolsEquipment: '',
    },
    background: {
      education: '',
      workHistory: '',
      references: '',
    },
    additionalInfo: {
      skills: '',
      languages: '',
      transportAvailable: false,
    }
  });

  const [documents, setDocuments] = useState({
    cv: null,
    diplomas: [],
    motivationLetter: null
  });

  const [fileErrors, setFileErrors] = useState({
    cv: '',
    diplomas: '',
    motivationLetter: ''
  });

  const validateFile = (file, type) => {
    if (!file) return '';
    
    if (!allowedFileTypes[type].includes(file.type)) {
      return `Format de fichier non pris en charge. Formats acceptés: ${allowedFileTypes[type].join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `Le fichier est trop volumineux. Taille maximale: 5MB`;
    }
    
    return '';
  };

  const handleFileChange = (e, type) => {
    const files = e.target.files;
    
    if (type === 'diplomas') {
      // Handle multiple files for diplomas
      const newDiplomas = [...documents.diplomas];
      let hasError = false;
      
      Array.from(files).forEach(file => {
        const error = validateFile(file, type);
        if (error) {
          setFileErrors(prev => ({ ...prev, [type]: error }));
          hasError = true;
          return;
        }
        newDiplomas.push(file);
      });
      
      if (!hasError) {
        setDocuments(prev => ({ ...prev, [type]: newDiplomas }));
        setFileErrors(prev => ({ ...prev, [type]: '' }));
      }
    } else {
      // Handle single file for CV and motivation letter
      const file = files[0];
      const error = validateFile(file, type);
      
      if (error) {
        setFileErrors(prev => ({ ...prev, [type]: error }));
        return;
      }
      
      setDocuments(prev => ({ ...prev, [type]: file }));
      setFileErrors(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeFile = (type, index) => {
    if (type === 'diplomas') {
      const newDiplomas = [...documents.diplomas];
      newDiplomas.splice(index, 1);
      setDocuments(prev => ({ ...prev, diplomas: newDiplomas }));
    } else {
      setDocuments(prev => ({ ...prev, [type]: null }));
    }
    setFileErrors(prev => ({ ...prev, [type]: '' }));
  };

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check required files
    if (!documents.cv) {
      setFileErrors(prev => ({ ...prev, cv: 'Votre CV est requis' }));
      setIsSubmitting(false);
      return;
    }

    // Create form data for file upload
    const formDataToSend = new FormData();
    
    // Add form field data
    formDataToSend.append('data', JSON.stringify(formData));
    
    // Add files
    formDataToSend.append('cv', documents.cv);
    documents.diplomas.forEach((diploma, index) => {
      formDataToSend.append(`diploma_${index}`, diploma);
    });
    if (documents.motivationLetter) {
      formDataToSend.append('motivationLetter', documents.motivationLetter);
    }

    try {
      const response = await fetch('http://localhost:8000/api/technician-applications', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue lors de l\'envoi de votre candidature');
      }

      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès. Nous vous contacterons prochainement.",
        variant: "success",
      });

      // Navigate to a confirmation page
      navigate('/application-submitted');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-3 py-1 bg-primary/20 text-primary border-primary inline-flex w-auto">
            Rejoignez Notre Équipe
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Devenez un Technicien Certifié
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rejoignez notre réseau de techniciens qualifiés et aidez nos clients à résoudre leurs problèmes techniques.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Horaires Flexibles</h3>
              </div>
              <p className="text-muted-foreground">Travaillez selon vos conditions et choisissez votre disponibilité.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Évolution Professionnelle</h3>
              </div>
              <p className="text-muted-foreground">Accédez à des formations et opportunités de certification.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Rémunération Compétitive</h3>
              </div>
              <p className="text-muted-foreground">Gagnez des tarifs compétitifs basés sur votre expertise.</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary mb-4">Informations Personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Nom Complet</Label>
                    <Input
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Entrez votre nom complet"
                      value={formData.personalInfo.fullName}
                      onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Email</Label>
                    <Input
                      type="email"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Entrez votre email"
                      value={formData.personalInfo.email}
                      onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Numéro de Téléphone</Label>
                    <Input
                      type="tel"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Entrez votre numéro de téléphone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Localisation</Label>
                    <Input
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Ville, Région"
                      value={formData.personalInfo.location}
                      onChange={(e) => updateFormData('personalInfo', 'location', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary mb-4">Informations Professionnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Spécialisation Principale</Label>
                    <Select
                      value={formData.professionalInfo.specialization}
                      onValueChange={(value) => updateFormData('professionalInfo', 'specialization', value)}
                      required
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Sélectionnez votre spécialisation" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Années d'Expérience</Label>
                    <Input
                      type="number"
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Années d'expérience"
                      value={formData.professionalInfo.yearsExperience}
                      onChange={(e) => updateFormData('professionalInfo', 'yearsExperience', e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-foreground">Certifications</Label>
                    <Textarea
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Listez vos certifications pertinentes"
                      value={formData.professionalInfo.certifications}
                      onChange={(e) => updateFormData('professionalInfo', 'certifications', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Background Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary mb-4">Informations Contextuelles</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Formation</Label>
                    <Textarea
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Décrivez votre parcours éducatif"
                      value={formData.background.education}
                      onChange={(e) => updateFormData('background', 'education', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Expérience Professionnelle</Label>
                    <Textarea
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      placeholder="Résumez votre expérience professionnelle pertinente"
                      value={formData.background.workHistory}
                      onChange={(e) => updateFormData('background', 'workHistory', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary mb-4">Documents</h2>
                
                {/* CV Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">CV / Curriculum Vitae <span className="text-destructive">*</span></Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.cv ? (
                        <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-md">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm truncate text-foreground">{documents.cv.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => removeFile('cv')}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            id="cv-upload"
                            className="hidden"
                            accept={allowedFileTypes.cv.join(',')}
                            onChange={(e) => handleFileChange(e, 'cv')}
                          />
                          <Label
                            htmlFor="cv-upload"
                            className="cursor-pointer flex flex-col items-center justify-center p-4 bg-muted border border-dashed border-border rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium text-foreground">Télécharger votre CV</span>
                            <span className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (max. 5MB)</span>
                          </Label>
                        </div>
                      )}
                      {fileErrors.cv && (
                        <div className="flex items-center text-destructive text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileErrors.cv}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Diplomas Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">Diplômes et Certificats</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.diplomas.length > 0 && (
                        <div className="space-y-2">
                          {documents.diplomas.map((diploma, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted border border-border rounded-md">
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm truncate text-foreground">{diploma.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => removeFile('diplomas', index)}
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="relative">
                        <Input
                          type="file"
                          id="diplomas-upload"
                          className="hidden"
                          accept={allowedFileTypes.diplomas.join(',')}
                          onChange={(e) => handleFileChange(e, 'diplomas')}
                          multiple
                        />
                        <Label
                          htmlFor="diplomas-upload"
                          className="cursor-pointer flex flex-col items-center justify-center p-4 bg-muted border border-dashed border-border rounded-md hover:bg-muted/80 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium text-foreground">Télécharger vos diplômes</span>
                          <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max. 5MB chacun)</span>
                        </Label>
                      </div>
                      {fileErrors.diplomas && (
                        <div className="flex items-center text-destructive text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileErrors.diplomas}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Motivation Letter Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground">Lettre de Motivation</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.motivationLetter ? (
                        <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-md">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm truncate text-foreground">{documents.motivationLetter.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => removeFile('motivationLetter')}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            type="file"
                            id="motivation-letter-upload"
                            className="hidden"
                            accept={allowedFileTypes.motivationLetter.join(',')}
                            onChange={(e) => handleFileChange(e, 'motivationLetter')}
                          />
                          <Label
                            htmlFor="motivation-letter-upload"
                            className="cursor-pointer flex flex-col items-center justify-center p-4 bg-muted border border-dashed border-border rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium text-foreground">Télécharger votre lettre de motivation</span>
                            <span className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (max. 5MB)</span>
                          </Label>
                        </div>
                      )}
                      {fileErrors.motivationLetter && (
                        <div className="flex items-center text-destructive text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileErrors.motivationLetter}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Soumettre la Candidature'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BecomeTechnician;