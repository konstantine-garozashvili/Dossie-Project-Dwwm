import { useState, useEffect, useCallback } from 'react';
import { ADDRESS_ENDPOINTS } from '@/config/api';

/**
 * Custom hook for French address autocomplete
 * @param {Object} options - Configuration options
 * @returns {Object} - Hook state and functions
 */
export const useAddressAutocomplete = (options = {}) => {
  const {
    minLength = 3,
    limit = 10,
    debounceMs = 300,
    type = 'housenumber' // housenumber, street, locality, municipality
  } = options;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Debounced search function
  const searchAddresses = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.length < minLength) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = new URL(ADDRESS_ENDPOINTS.SEARCH_ADDRESSES, window.location.origin);
        url.searchParams.append('q', searchQuery);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('type', type);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.success) {
          setSuggestions(data.data || []);
        } else {
          setError(data.message || 'Erreur lors de la recherche d\'adresses');
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
        setError('Erreur de connexion lors de la recherche d\'adresses');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [minLength, limit, type]
  );

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAddresses(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchAddresses, debounceMs]);

  // Update query
  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    if (!newQuery) {
      setSuggestions([]);
      setSelectedAddress(null);
    }
  }, []);

  // Select an address from suggestions
  const selectAddress = useCallback((address) => {
    setSelectedAddress(address);
    setQuery(address.label);
    setSuggestions([]);
  }, []);

  // Clear all state
  const clearAll = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelectedAddress(null);
    setError(null);
  }, []);

  // Validate current address
  const validateAddress = useCallback(async (addressToValidate) => {
    if (!addressToValidate) return { isValid: false, address: null };

    try {
      const url = new URL(ADDRESS_ENDPOINTS.VALIDATE_ADDRESS, window.location.origin);
      url.searchParams.append('address', addressToValidate);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success && data.data) {
        return {
          isValid: data.data.isValid,
          address: data.data.address,
          score: data.data.address?.score
        };
      }

      return { isValid: false, address: null };
    } catch (err) {
      console.error('Error validating address:', err);
      return { isValid: false, address: null };
    }
  }, []);

  return {
    // State
    query,
    suggestions,
    isLoading,
    error,
    selectedAddress,
    
    // Actions
    updateQuery,
    selectAddress,
    clearAll,
    validateAddress,
    
    // Computed
    hasSuggestions: suggestions.length > 0,
    isSearching: isLoading && query.length >= minLength
  };
}; 