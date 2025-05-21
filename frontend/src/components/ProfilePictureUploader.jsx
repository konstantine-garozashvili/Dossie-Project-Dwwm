import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, User } from 'lucide-react';
import { PROFILE_ENDPOINTS } from '@/config/api'; // Import PROFILE_ENDPOINTS

// Default image as a fallback if Cloudinary URL fails
const UI_AVATARS_BASE = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=256';

/**
 * ProfilePictureUploader Component
 * 
 * @param {Object} props
 * @param {string} props.userType - 'admin' or 'technician'
 * @param {string|number} props.userId - User ID
 * @param {string} props.currentPictureUrl - Current profile picture URL
 * @param {Function} props.onUploadSuccess - Callback when profile picture changes
 * @param {string} props.className - Additional classes for component
 * @param {string} props.avatarSizeClassName - Additional classes for Avatar and AvatarFallback
 */
const ProfilePictureUploader = ({ 
  userType, 
  userId, 
  currentPictureUrl, // Changed from name to currentPictureUrl for direct control from parent
  onUploadSuccess,   // Parent should handle fetching/updating logic
  className = '',
  avatarSizeClassName = 'h-32 w-32 text-3xl' // Default size for profile page
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const getNamedAvatar = (userNameInput) => {
    const nameForApi = userNameInput || 'User'; // Ensure there's always a name
    const formattedName = encodeURIComponent(nameForApi.replace(/\s+/g, '+'));
    return `${UI_AVATARS_BASE}&name=${formattedName}`;
  };

  // Display picture is now directly from props
  const displayPicture = currentPictureUrl || getNamedAvatar('User'); // Fallback if prop is somehow null

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('L\'image est trop volumineuse. Maximum 5MB.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      
      const response = await fetch(PROFILE_ENDPOINTS.UPLOAD_PICTURE(userType, userId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ imageData: base64Data }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (response.ok && data.success) {
          setError(null);
          if (onUploadSuccess) {
            onUploadSuccess(); // Signal parent to re-fetch. Don't use URL from stubbed backend directly.
          }
        } else {
          setError(data.message || 'Erreur lors de la mise à jour de l\'image.');
        }
      } else {
        setError('Erreur de serveur inattendue.');
      }
    } catch (err) {
      setError('Erreur de réseau ou de serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(PROFILE_ENDPOINTS.DELETE_PICTURE(userType, userId), {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          setError(null);
          if (onUploadSuccess) { // Same callback, parent re-fetches and gets default
            onUploadSuccess();
          }
        } else {
          setError(data.message || 'Erreur lors de la suppression.');
        }
      } else {
        setError('Erreur de serveur inattendue lors de la suppression.');
      }
    } catch (err) {
      setError('Erreur de réseau ou de serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Determine initials for AvatarFallback from currentPictureUrl if it's a ui-avatars URL
  const getInitialsFromUrl = (url) => {
    if (url && url.includes('ui-avatars.com')) {
      try {
        const urlParams = new URL(url).searchParams;
        const nameParam = urlParams.get('name');
        if (nameParam) {
          return nameParam.split('+').map(n => n[0]).join('').toUpperCase();
        }
      } catch (e) { /* Do nothing, fall back */ }
    }
    return 'U'; // Default initial
  };
  
  const initials = getInitialsFromUrl(displayPicture);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <Avatar className={`border-2 border-slate-700 shadow-md ${avatarSizeClassName}`}>
        <AvatarImage src={displayPicture} alt="Photo de profil" />
        <AvatarFallback className={`bg-slate-800 text-slate-400 ${avatarSizeClassName.includes('text-4xl') ? 'text-4xl' : 'text-3xl'}`}>
          {isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : initials}
        </AvatarFallback>
      </Avatar>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex space-x-3">
        <Button onClick={handleUploadClick} disabled={isLoading} variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Changer
        </Button>
        <Button onClick={handleDelete} disabled={isLoading || !currentPictureUrl || currentPictureUrl.includes('ui-avatars.com')} variant="destructiveOutline">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Supprimer
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif, image/webp"
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUploader; 