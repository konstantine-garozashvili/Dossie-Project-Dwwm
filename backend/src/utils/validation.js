/**
 * Validation utilities for the IT13 application
 */

/**
 * Formats French phone number to international format with +33
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number with +33 prefix
 */
export const formatFrenchPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }

  // Remove all spaces, dots, dashes, and parentheses
  let cleanPhone = phoneNumber.replace(/[\s\.\-\(\)]/g, '');

  // If it starts with +33, keep as is but reformat
  if (cleanPhone.startsWith('+33')) {
    cleanPhone = cleanPhone.substring(3);
  }
  // If it starts with 33, remove it
  else if (cleanPhone.startsWith('33') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(2);
  }
  // If it starts with 0, remove the leading 0
  else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Validate the remaining 9 digits
  if (!/^[1-9]\d{8}$/.test(cleanPhone)) {
    return phoneNumber; // Return original if invalid
  }

  // Format as +33 X XX XX XX XX
  const formatted = `+33 ${cleanPhone.charAt(0)} ${cleanPhone.substring(1, 3)} ${cleanPhone.substring(3, 5)} ${cleanPhone.substring(5, 7)} ${cleanPhone.substring(7, 9)}`;
  
  return formatted;
};

/**
 * Validates French phone numbers
 * Accepts formats: 01 23 45 67 89, 0123456789, +33123456789, +33 1 23 45 67 89
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid French phone number
 */
export const validateFrenchPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // Remove all spaces, dots, dashes, and parentheses
  const cleanPhone = phoneNumber.replace(/[\s\.\-\(\)]/g, '');

  // French phone number patterns
  const patterns = [
    // Mobile numbers: 06, 07
    /^0[67]\d{8}$/,
    // Landline numbers: 01, 02, 03, 04, 05, 08, 09
    /^0[1-5,8-9]\d{8}$/,
    // International format with +33
    /^\+33[1-9]\d{8}$/,
    // International format without leading 0
    /^33[1-9]\d{8}$/
  ];

  return patterns.some(pattern => pattern.test(cleanPhone));
};

/**
 * Validates email addresses
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates file types and sizes for document uploads
 * @param {File} file - The file to validate
 * @param {string} type - The type of document ('cv', 'diplomas', 'motivationLetter')
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateDocumentFile = (file, type) => {
  if (!file) {
    return { isValid: false, error: 'Aucun fichier fourni' };
  }

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  
  const allowedTypes = {
    cv: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    diplomas: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ],
    motivationLetter: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  };

  // Check file size
  if (file.size > maxFileSize) {
    return { 
      isValid: false, 
      error: `Le fichier est trop volumineux. Taille maximale: 5MB (actuel: ${Math.round(file.size / 1024 / 1024 * 100) / 100}MB)` 
    };
  }

  // Check file type
  const allowedTypesForFile = allowedTypes[type];
  if (!allowedTypesForFile || !allowedTypesForFile.includes(file.type)) {
    const allowedExtensions = allowedTypesForFile?.map(mimeType => {
      switch (mimeType) {
        case 'application/pdf': return 'PDF';
        case 'application/msword': return 'DOC';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'DOCX';
        case 'image/jpeg':
        case 'image/jpg': return 'JPG';
        case 'image/png': return 'PNG';
        default: return mimeType;
      }
    }).join(', ');

    return { 
      isValid: false, 
      error: `Type de fichier non autorisé. Formats acceptés: ${allowedExtensions}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates technician application data
 * @param {Object} applicationData - The application data to validate
 * @returns {Object} - Validation result with isValid and errors array
 */
export const validateTechnicianApplication = (applicationData) => {
  const errors = [];

  // Validate personal info
  if (!applicationData.personalInfo) {
    errors.push('Informations personnelles manquantes');
  } else {
    const { fullName, email, phone, location } = applicationData.personalInfo;

    if (!fullName || fullName.trim().length < 2) {
      errors.push('Le nom complet doit contenir au moins 2 caractères');
    }

    if (!email || !validateEmail(email)) {
      errors.push('Adresse email invalide');
    }

    if (!phone || !validateFrenchPhoneNumber(phone)) {
      errors.push('Numéro de téléphone français invalide');
    }

    if (!location || location.trim().length < 2) {
      errors.push('La localisation est requise');
    }
  }

  // Validate professional info
  if (!applicationData.professionalInfo) {
    errors.push('Informations professionnelles manquantes');
  } else {
    const { specialization, yearsExperience } = applicationData.professionalInfo;

    if (!specialization || specialization.trim().length < 2) {
      errors.push('La spécialisation est requise');
    }

    if (yearsExperience === undefined || yearsExperience === null || yearsExperience < 0) {
      errors.push('Les années d\'expérience doivent être un nombre positif');
    }
  }

  // Validate background info (optional but if provided, should be valid)
  if (applicationData.background) {
    const { education, workHistory } = applicationData.background;
    
    if (education && education.trim().length > 1000) {
      errors.push('La description de la formation ne peut pas dépasser 1000 caractères');
    }

    if (workHistory && workHistory.trim().length > 1000) {
      errors.push('La description de l\'expérience professionnelle ne peut pas dépasser 1000 caractères');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes text input to prevent XSS and other security issues
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Validates and sanitizes form data
 * @param {Object} formData - The form data to validate and sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeApplicationData = (applicationData) => {
  const sanitized = { ...applicationData };

  // Sanitize personal info
  if (sanitized.personalInfo) {
    sanitized.personalInfo = {
      fullName: sanitizeText(sanitized.personalInfo.fullName),
      email: sanitizeText(sanitized.personalInfo.email?.toLowerCase()),
      phone: sanitizeText(sanitized.personalInfo.phone),
      location: sanitizeText(sanitized.personalInfo.location)
    };
  }

  // Sanitize professional info
  if (sanitized.professionalInfo) {
    sanitized.professionalInfo = {
      specialization: sanitizeText(sanitized.professionalInfo.specialization),
      yearsExperience: parseInt(sanitized.professionalInfo.yearsExperience) || 0,
      certifications: sanitizeText(sanitized.professionalInfo.certifications),
      availability: sanitizeText(sanitized.professionalInfo.availability),
      toolsEquipment: sanitizeText(sanitized.professionalInfo.toolsEquipment)
    };
  }

  // Sanitize background info
  if (sanitized.background) {
    sanitized.background = {
      education: sanitizeText(sanitized.background.education),
      workHistory: sanitizeText(sanitized.background.workHistory),
      references: sanitizeText(sanitized.background.references)
    };
  }

  // Sanitize additional info
  if (sanitized.additionalInfo) {
    sanitized.additionalInfo = {
      skills: sanitizeText(sanitized.additionalInfo.skills),
      languages: sanitizeText(sanitized.additionalInfo.languages),
      transportAvailable: Boolean(sanitized.additionalInfo.transportAvailable)
    };
  }

  return sanitized;
}; 