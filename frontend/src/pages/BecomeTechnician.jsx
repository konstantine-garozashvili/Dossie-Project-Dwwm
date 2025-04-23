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
import { Laptop, Scroll, Star, Tool, Award } from 'lucide-react';

const specializations = [
  'Hardware Repair',
  'Software Troubleshooting',
  'Network Setup',
  'Data Recovery',
  'Mobile Device Repair',
  'Security Systems',
  'General IT Support'
];

export const BecomeTechnician = () => {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the application to your backend
    console.log('Submitting technician application:', formData);
    // Navigate to a confirmation page or show success message
    navigate('/application-submitted');
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
                  <Tool className="w-6 h-6 text-cyan-400" />
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      className="bg-slate-900 border-slate-700"
                      placeholder="City, State"
                      value={formData.personalInfo.location}
                      onChange={(e) => updateFormData('personalInfo', 'location', e.target.value)}
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

              <div className="flex justify-end pt-6">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  Submit Application
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