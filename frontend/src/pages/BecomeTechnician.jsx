import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Laptop, Scroll, Star, Wrench, Award, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Select from 'react-select';

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

// Regex patterns
const nameRegex = /^[A-Za-zÀ-ÿ' -]+$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const phoneRegex = /^0[1-9]\d{8}$/;
const phoneIntlRegex = /^\+33[1-9]\d{8}$/;

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
      specializations: [],
      yearsExperience: '',
      availability: '',
      toolsEquipment: '',
    },
    background: {
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
    motivationLetter: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    specializations: '',
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef(null);

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

  // Address autocomplete handler
  const handleAddressChange = async (e) => {
    const value = e.target.value;
    updateFormData('personalInfo', 'location', value);
    if (value.length > 3) {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=10`);
      const data = await res.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = (suggestion) => {
    updateFormData('personalInfo', 'location', suggestion.properties.label);
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Format phone to international on blur
  const formatPhoneToIntl = (value) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    // Only keep the first 10 digits
    digits = digits.slice(0, 10);
    if (digits.length === 10 && digits.startsWith('0')) {
      return `+33${digits.slice(1)}`;
    }
    return value;
  };

  // Handle phone input change (limit to 10 digits)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 10);
    updateFormData('personalInfo', 'phone', value);
  };

  // On blur, format to international if valid
  const handlePhoneBlur = (e) => {
    const formatted = formatPhoneToIntl(e.target.value);
    updateFormData('personalInfo', 'phone', formatted);
  };

  // Validation function
  const validateForm = () => {
    let valid = true;
    let errors = {};
    // Specializations validation
    if (!formData.professionalInfo.specializations || formData.professionalInfo.specializations.length === 0) {
      errors.specializations = 'Veuillez sélectionner au moins une spécialisation';
      valid = false;
    }
    // Accept either 10-digit French or +33 international
    const phoneVal = formData.personalInfo.phone;
    if (!(phoneRegex.test(phoneVal) || phoneIntlRegex.test(phoneVal))) {
      errors.phone = 'Numéro de téléphone français invalide (10 chiffres ou format international)';
      valid = false;
    }
    if (!nameRegex.test(formData.personalInfo.fullName)) {
      errors.fullName = 'Nom invalide (lettres, espaces, tirets uniquement)';
      valid = false;
    }
    if (!emailRegex.test(formData.personalInfo.email)) {
      errors.email = 'Email invalide';
      valid = false;
    }
    if (!formData.personalInfo.location) {
      errors.location = 'Adresse requise';
      valid = false;
    }
    setFileErrors(prev => ({ ...prev, ...errors }));
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Regex validation
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Check required files
    if (!documents.cv) {
      setFileErrors(prev => ({ ...prev, cv: 'Votre CV est requis' }));
      setIsSubmitting(false);
      return;
    }

    // Create form data for file upload
    const formDataToSend = new FormData();
    
    // Add form field data - ensure it's structured as expected by backend
    formDataToSend.append('data', JSON.stringify({
      personalInfo: {
        fullName: formData.personalInfo.fullName,
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        location: formData.personalInfo.location
      },
      professionalInfo: {
        specializations: formData.professionalInfo.specializations,
        yearsExperience: formData.professionalInfo.yearsExperience,
        availability: formData.professionalInfo.availability,
        toolsEquipment: formData.professionalInfo.toolsEquipment
      },
      background: {
        references: formData.background.references
      },
      additionalInfo: {
        skills: formData.additionalInfo.skills,
        languages: formData.additionalInfo.languages,
        transportAvailable: formData.additionalInfo.transportAvailable
      }
    }));
    
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
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
            Rejoignez Notre Équipe
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Devenez un Technicien Certifié
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Rejoignez notre réseau de techniciens qualifiés et aidez nos clients à résoudre leurs problèmes techniques.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Wrench className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Horaires Flexibles</h3>
              </div>
              <p className="text-gray-400">Travaillez selon vos conditions et choisissez votre disponibilité.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Award className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Évolution Professionnelle</h3>
              </div>
              <p className="text-gray-400">Accédez à des formations et opportunités de certification.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Star className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Rémunération Compétitive</h3>
              </div>
              <p className="text-gray-400">Gagnez des tarifs compétitifs basés sur votre expertise.</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Informations Personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom Complet</Label>
                    <Input
                      className="bg-slate-900 border-slate-700"
                      placeholder="Entrez votre nom complet"
                      value={formData.personalInfo.fullName}
                      onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                      required
                    />
                    {fileErrors.fullName && <div className="text-red-500 text-xs">{fileErrors.fullName}</div>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Entrez votre email"
                      value={formData.personalInfo.email}
                      onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                      required
                    />
                    {fileErrors.email && <div className="text-red-500 text-xs">{fileErrors.email}</div>}
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro de Téléphone</Label>
                    <Input
                      type="tel"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Entrez votre numéro de téléphone"
                      value={formData.personalInfo.phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      required
                      maxLength={13} // +33XXXXXXXXX is 12 chars, 10 for local
                    />
                    {fileErrors.phone && <div className="text-red-500 text-xs">{fileErrors.phone}</div>}
                  </div>
                  <div className="space-y-2 relative">
                    <Label>Adresse</Label>
                    <Input
                      ref={addressInputRef}
                      className="bg-slate-900 border-slate-700"
                      placeholder="Adresse, Ville, Code Postal"
                      value={formData.personalInfo.location}
                      onChange={handleAddressChange}
                      autoComplete="off"
                      required
                    />
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-10 bg-white text-black border border-gray-300 rounded shadow w-full max-h-48 overflow-auto">
                        {addressSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 hover:bg-cyan-100 cursor-pointer"
                            onClick={() => handleAddressSelect(suggestion)}
                          >
                            {suggestion.properties.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {fileErrors.location && <div className="text-red-500 text-xs">{fileErrors.location}</div>}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Informations Professionnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Spécialisations Principales</Label>
                    <Select
                      isMulti
                      options={specializations.map(spec => ({ value: spec, label: spec }))}
                      value={formData.professionalInfo.specializations.map(spec => ({ value: spec, label: spec }))}
                      onChange={selected => {
                        updateFormData('professionalInfo', 'specializations', selected.map(opt => opt.value));
                      }}
                      classNamePrefix="react-select"
                      placeholder="Sélectionnez une ou plusieurs spécialisations"
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: '#0f172a', // slate-900
                          borderColor: '#334155', // slate-700
                          color: 'white',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#22d3ee' }, // cyan-400
                        }),
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: '#1e293b', // slate-800
                          border: '1px solid #334155', // slate-700
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }),
                        option: (baseStyles, { isFocused, isSelected }) => ({
                          ...baseStyles,
                          backgroundColor: isSelected 
                            ? '#06b6d4' // cyan-500
                            : isFocused 
                              ? '#0e7490' // cyan-700
                              : undefined,
                          color: isSelected || isFocused ? 'white' : '#e2e8f0', // slate-200
                          cursor: 'pointer',
                          ':active': {
                            backgroundColor: '#0891b2' // cyan-600
                          }
                        }),
                        multiValue: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: '#0e7490', // cyan-700
                          borderRadius: '0.25rem'
                        }),
                        multiValueLabel: (baseStyles) => ({
                          ...baseStyles,
                          color: 'white',
                          fontWeight: 500
                        }),
                        multiValueRemove: (baseStyles) => ({
                          ...baseStyles,
                          color: '#e2e8f0',
                          ':hover': {
                            backgroundColor: '#0e7490', // cyan-700
                            color: 'white'
                          }
                        }),
                        input: (baseStyles) => ({
                          ...baseStyles,
                          color: 'white'
                        }),
                        placeholder: (baseStyles) => ({
                          ...baseStyles,
                          color: '#94a3b8' // slate-400
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: 'white'
                        }),
                      }}
                    />
                    {fileErrors.specializations && <div className="text-red-500 text-xs">{fileErrors.specializations}</div>}
                  </div>
                  <div className="space-y-2">
                    <Label>Années d'Expérience</Label>
                    <Input
                      type="number"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Années d'expérience"
                      value={formData.professionalInfo.yearsExperience}
                      onChange={(e) => updateFormData('professionalInfo', 'yearsExperience', e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Documents</h2>
                
                {/* CV Upload */}
                <div className="space-y-2">
                  <Label>CV / Curriculum Vitae <span className="text-red-500">*</span></Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.cv ? (
                        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-md">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm truncate">{documents.cv.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-500"
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
                            className="cursor-pointer flex flex-col items-center justify-center p-4 bg-slate-900 border border-dashed border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <span className="text-sm font-medium">Télécharger votre CV</span>
                            <span className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX (max. 5MB)</span>
                          </Label>
                        </div>
                      )}
                      {fileErrors.cv && (
                        <div className="flex items-center text-red-500 text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileErrors.cv}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Diplomas Upload */}
                <div className="space-y-2">
                  <Label>Diplômes et Certificats</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.diplomas.length > 0 && (
                        <div className="space-y-2">
                          {documents.diplomas.map((diploma, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-md">
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm truncate">{diploma.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-500"
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
                          className="cursor-pointer flex flex-col items-center justify-center p-4 bg-slate-900 border border-dashed border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-slate-400 mb-2" />
                          <span className="text-sm font-medium">Télécharger vos diplômes</span>
                          <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (max. 5MB chacun)</span>
                        </Label>
                      </div>
                      {fileErrors.diplomas && (
                        <div className="flex items-center text-red-500 text-sm mt-1">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileErrors.diplomas}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Motivation Letter Upload */}
                <div className="space-y-2">
                  <Label>Lettre de Motivation</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {documents.motivationLetter ? (
                        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-md">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm truncate">{documents.motivationLetter.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-500"
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
                            className="cursor-pointer flex flex-col items-center justify-center p-4 bg-slate-900 border border-dashed border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <span className="text-sm font-medium">Télécharger votre lettre de motivation</span>
                            <span className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX (max. 5MB)</span>
                          </Label>
                        </div>
                      )}
                      {fileErrors.motivationLetter && (
                        <div className="flex items-center text-red-500 text-sm mt-1">
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
                  className="bg-cyan-500 hover:bg-cyan-600" 
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