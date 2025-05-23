import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Formats French phone number to international format with +33
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number with +33 prefix
 */
const formatFrenchPhoneNumber = (phoneNumber) => {
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
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid French phone number
 */
const validateFrenchPhoneNumber = (phoneNumber) => {
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
 * French Phone Number Input Component
 */
export const PhoneInput = ({
  label = "Numéro de téléphone",
  placeholder = "Entrez votre numéro de téléphone",
  value = "",
  onChange,
  onValidationChange,
  required = false,
  className = "",
  error = "",
  autoFormat = true,
  showValidation = true,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync external value with internal state
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Validate phone number
  useEffect(() => {
    if (inputValue) {
      const valid = validateFrenchPhoneNumber(inputValue);
      setIsValid(valid);
      
      if (showValidation) {
        if (!valid && inputValue.length > 0) {
          setValidationError('Numéro de téléphone français invalide');
        } else {
          setValidationError('');
        }
      }
      
      // Call external validation callback
      if (onValidationChange) {
        onValidationChange(valid, inputValue);
      }
    } else {
      setIsValid(false);
      setValidationError('');
      if (onValidationChange) {
        onValidationChange(false, '');
      }
    }
  }, [inputValue, showValidation, onValidationChange]);

  // Handle input change
  const handleInputChange = (e) => {
    let newValue = e.target.value;
    
    // Auto-format if enabled
    if (autoFormat && newValue) {
      // Only format if it looks like a complete number
      const cleanValue = newValue.replace(/[\s\.\-\(\)]/g, '');
      if (cleanValue.length >= 9) {
        const formatted = formatFrenchPhoneNumber(newValue);
        if (formatted !== newValue && validateFrenchPhoneNumber(formatted)) {
          newValue = formatted;
        }
      }
    }
    
    setInputValue(newValue);
    
    // Call external onChange
    if (onChange) {
      onChange({ ...e, target: { ...e.target, value: newValue } });
    }
  };

  // Handle blur - format the number
  const handleBlur = (e) => {
    if (autoFormat && inputValue) {
      const formatted = formatFrenchPhoneNumber(inputValue);
      if (formatted !== inputValue) {
        setInputValue(formatted);
        if (onChange) {
          onChange({ ...e, target: { ...e.target, value: formatted } });
        }
      }
    }
    
    // Call original onBlur if provided
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const displayError = error || validationError;
  const hasError = Boolean(displayError);
  const showSuccess = showValidation && isValid && inputValue.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Phone className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Input
          type="tel"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "bg-input border-border text-foreground placeholder:text-muted-foreground pl-10",
            hasError && "border-destructive",
            showSuccess && "border-green-500",
            className
          )}
          {...props}
        />
        
        {/* Validation indicator */}
        {showValidation && inputValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            ) : (
              <div className="h-2 w-2 bg-destructive rounded-full"></div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div className="text-sm text-destructive mt-1">
          {displayError}
        </div>
      )}
      
      {/* Help text */}
      {!hasError && !showSuccess && (
        <div className="text-xs text-muted-foreground mt-1">
          Format: 06 12 34 56 78 ou +33 6 12 34 56 78
        </div>
      )}
    </div>
  );
}; 