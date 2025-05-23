import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Address Autocomplete Component for French addresses
 */
export const AddressAutocomplete = ({
  label = "Adresse",
  placeholder = "Tapez votre adresse...",
  value = "",
  onChange,
  onAddressSelect,
  required = false,
  className = "",
  error = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    query,
    suggestions,
    isLoading,
    error: autocompleteError,
    selectedAddress,
    updateQuery,
    selectAddress,
    hasSuggestions,
    isSearching
  } = useAddressAutocomplete({
    limit: 10,
    debounceMs: 300
  });

  // Sync external value with internal state
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      updateQuery(value);
    }
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    updateQuery(newValue);
    setIsOpen(true);
    
    // Call external onChange
    if (onChange) {
      onChange(e);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const selectedValue = suggestion.label;
    setInputValue(selectedValue);
    updateQuery(selectedValue);
    selectAddress(suggestion);
    setIsOpen(false);
    
    // Call external callbacks
    if (onChange) {
      onChange({ target: { value: selectedValue } });
    }
    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
    
    // Focus back to input
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (hasSuggestions) {
      setIsOpen(true);
    }
  };

  // Handle input blur with delay to allow suggestion clicks
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    updateQuery('');
    setIsOpen(false);
    
    if (onChange) {
      onChange({ target: { value: '' } });
    }
    if (onAddressSelect) {
      onAddressSelect(null);
    }
    
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayError = error || autocompleteError;

  return (
    <div className={cn("relative space-y-2", className)}>
      {label && (
        <Label className="text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={cn(
            "bg-input border-border text-foreground placeholder:text-muted-foreground pr-20",
            displayError && "border-destructive",
            className
          )}
          {...props}
        />
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && hasSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {suggestion.label}
                </div>
                {suggestion.context && (
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.context}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="text-sm text-destructive mt-1">
          {displayError}
        </div>
      )}
    </div>
  );
}; 