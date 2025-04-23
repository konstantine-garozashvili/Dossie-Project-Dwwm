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
  'Hardware Repair',
  'Software Troubleshooting',
  'Network Setup',
  'Data Recovery',
  'Mobile Device Repair',
  'Security Systems',
  'General IT Support'
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
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
            Join Our Team
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Become a Certified Technician
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join our network of skilled technicians and help customers solve their technical problems.
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
                <h3 className="text-lg font-semibold">Flexible Schedule</h3>
              </div>
              <p className="text-gray-400">Work on your own terms and choose your availability.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Award className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Professional Growth</h3>
              </div>
              <p className="text-gray-400">Access training and certification opportunities.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Star className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">Competitive Pay</h3>
              </div>
              <p className="text-gray-400">Earn competitive rates based on your expertise.</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      className="bg-slate-900 border-slate-700"
                      placeholder="Enter your full name"
                      value={formData.personalInfo.fullName}
                      onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Enter your email"
                      value={formData.personalInfo.email}
                      onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Enter your phone number"
                      value={formData.personalInfo.phone}
                      onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      className="bg-slate-900 border-slate-700"
                      placeholder="City, State"
                      value={formData.personalInfo.location}
                      onChange={(e) => updateFormData('personalInfo', 'location', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Specialization</Label>
                    <Select
                      value={formData.professionalInfo.specialization}
                      onValueChange={(value) => updateFormData('professionalInfo', 'specialization', value)}
                      required
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      className="bg-slate-900 border-slate-700"
                      placeholder="Years of experience"
                      value={formData.professionalInfo.yearsExperience}
                      onChange={(e) => updateFormData('professionalInfo', 'yearsExperience', e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Certifications</Label>
                    <Textarea
                      className="bg-slate-900 border-slate-700"
                      placeholder="List your relevant certifications"
                      value={formData.professionalInfo.certifications}
                      onChange={(e) => updateFormData('professionalInfo', 'certifications', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Background Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Background Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Education</Label>
                    <Textarea
                      className="bg-slate-900 border-slate-700"
                      placeholder="Describe your educational background"
                      value={formData.background.education}
                      onChange={(e) => updateFormData('background', 'education', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work History</Label>
                    <Textarea
                      className="bg-slate-900 border-slate-700"
                      placeholder="Summarize your relevant work experience"
                      value={formData.background.workHistory}
                      onChange={(e) => updateFormData('background', 'workHistory', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 mb-4">Documents</h2>
                
                {/* CV Upload */}
                <div className="space-y-2">
                  <Label>CV / Resume <span className="text-red-500">*</span></Label>
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
                  <Label>Diplomas and Certificates</Label>
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
                  <Label>Motivation Letter</Label>
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
                  {isSubmitting ? 'Envoi en cours...' : 'Submit Application'}
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