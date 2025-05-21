import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, User } from 'lucide-react';

// Default image as a fallback if Cloudinary URL fails
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User&size=256';

/**
 * ProfilePictureUploader Component
 * 
 * @param {Object} props
 * @param {string} props.userType - 'admin' or 'technician'
 * @param {string|number} props.userId - User ID
 * @param {string} props.name - User's name for avatar fallback
 * @param {string} props.className - Additional classes for component
 * @param {Function} props.onProfilePictureChange - Callback when profile picture changes
 */
const ProfilePictureUploader = ({ 
  userType, 
  userId, 
  name = '', 
  className = '',
  onProfilePictureChange
}) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Generate a name-based avatar URL using UI Avatars service
  const getNamedAvatar = (userName) => {
    if (!userName) return DEFAULT_AVATAR;
    
    const formattedName = encodeURIComponent(userName.replace(/\s+/g, '+'));
    return `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${formattedName}&size=256`;
  };
  
  // Initialize with name-based avatar immediately to prevent blank state
  useEffect(() => {
    setProfilePicture(getNamedAvatar(name));
  }, [name]);

  // Get initial profile picture
  useEffect(() => {
    if (userId && userType) {
      fetchProfilePicture();
    }
  }, [userId, userType]);

  const fetchProfilePicture = async () => {
    if (!userId || !userType) return;
    
    setIsLoading(true);
    
    try {
      // Set a default avatar immediately based on name
      const defaultAvatar = getNamedAvatar(name);
      
      // Try to fetch from API, but don't let errors disrupt the UI
      const response = await fetch(`/api/profile/picture/${userType}/${userId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Silently handle 404 errors (profile picture not found)
      if (response.status === 404) {
        // No profile picture found, use default avatar and don't show an error
        setProfilePicture(defaultAvatar);
        setError(null);
        if (onProfilePictureChange) {
          onProfilePictureChange(defaultAvatar);
        }
        return; // Exit early
      }
      
      // Only try to parse JSON if we got a JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok && data.success) {
          setProfilePicture(data.profilePicture.secureUrl);
          setError(null);
          if (onProfilePictureChange) {
            onProfilePictureChange(data.profilePicture.secureUrl);
          }
        } else if (data.defaultUrl) {
          // No profile picture found but server provided a default URL
          setProfilePicture(data.defaultUrl);
          setError(null);
          if (onProfilePictureChange) {
            onProfilePictureChange(data.defaultUrl);
          }
        } else {
          // Other API error, use default avatar
          setProfilePicture(defaultAvatar);
          setError(null); // Don't show error message when using fallback
          if (onProfilePictureChange) {
            onProfilePictureChange(defaultAvatar);
          }
        }
      } else {
        // If we didn't get JSON back, use the default avatar
        setProfilePicture(defaultAvatar);
        setError(null);
        if (onProfilePictureChange) {
          onProfilePictureChange(defaultAvatar);
        }
      }
    } catch (err) {
      // Silently handle errors - no need to log them
      // Just use a generated avatar based on name
      const defaultImage = getNamedAvatar(name);
      setProfilePicture(defaultImage);
      setError(null); // Clear any existing error
      if (onProfilePictureChange) {
        onProfilePictureChange(defaultImage);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image est trop volumineuse. Maximum 5MB.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert the file to base64
      const base64Data = await fileToBase64(file);
      
      // Send to server
      const response = await fetch(`/api/profile/picture/${userType}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          imageData: base64Data,
        }),
      });

      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (response.ok && data.success) {
          setProfilePicture(data.profilePicture.secureUrl);
          setError(null);
          if (onProfilePictureChange) {
            onProfilePictureChange(data.profilePicture.secureUrl);
          }
        } else {
          // API returned an error
          setError(data.message || 'Erreur lors de la mise à jour de l\'image de profil');
          
          // Keep the current image
          if (!profilePicture) {
            const defaultAvatar = getNamedAvatar(name);
            setProfilePicture(defaultAvatar);
            if (onProfilePictureChange) {
              onProfilePictureChange(defaultAvatar);
            }
          }
        }
      } else {
        // Server responded but not with JSON
        setError('Erreur de serveur lors de la mise à jour de l\'image de profil');
        
        // Keep the current image
        if (!profilePicture) {
          const defaultAvatar = getNamedAvatar(name);
          setProfilePicture(defaultAvatar);
          if (onProfilePictureChange) {
            onProfilePictureChange(defaultAvatar);
          }
        }
      }
    } catch (err) {
      // Only show error to user, no need to log to console
      setError('Erreur lors de la mise à jour de l\'image de profil. Vérifiez votre connexion.');
      
      // Keep the current image
      if (!profilePicture) {
        const defaultAvatar = getNamedAvatar(name);
        setProfilePicture(defaultAvatar);
        if (onProfilePictureChange) {
          onProfilePictureChange(defaultAvatar);
        }
      }
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
      const response = await fetch(`/api/profile/picture/${userType}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (response.ok && data.success) {
          // Set to default image
          const defaultImage = data.defaultUrl || getNamedAvatar(name);
          setProfilePicture(defaultImage);
          setError(null);
          if (onProfilePictureChange) {
            onProfilePictureChange(defaultImage);
          }
        } else {
          setError(data.message || 'Erreur lors de la suppression de l\'image de profil');
          
          // Keep current image if error
          if (!profilePicture) {
            const defaultAvatar = getNamedAvatar(name);
            setProfilePicture(defaultAvatar);
            if (onProfilePictureChange) {
              onProfilePictureChange(defaultAvatar);
            }
          }
        }
      } else {
        // Server responded but not with JSON
        setError('Erreur de serveur lors de la suppression de l\'image de profil');
        
        // Keep current image if error
        if (!profilePicture) {
          const defaultAvatar = getNamedAvatar(name);
          setProfilePicture(defaultAvatar);
          if (onProfilePictureChange) {
            onProfilePictureChange(defaultAvatar);
          }
        }
      }
    } catch (err) {
      // Only show error to user, no need to log to console
      setError('Erreur lors de la suppression de l\'image de profil. Vérifiez votre connexion.');
      
      // Keep current image if error
      if (!profilePicture) {
        const defaultAvatar = getNamedAvatar(name);
        setProfilePicture(defaultAvatar);
        if (onProfilePictureChange) {
          onProfilePictureChange(defaultAvatar);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative group">
        <Avatar className="h-24 w-24 shadow-md">
          <AvatarImage src={profilePicture} alt="Photo de profil" />
          <AvatarFallback className="bg-slate-700 text-xl">
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white p-1 h-auto" 
              onClick={handleUploadClick}
              title="Modifier la photo de profil"
            >
              <Upload className="h-5 w-5" />
            </Button>
            {profilePicture && profilePicture !== getNamedAvatar(name) && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white p-1 h-auto text-red-400" 
                onClick={handleDelete}
                title="Supprimer la photo de profil"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />
      
      <p className="mt-2 text-sm text-gray-400">
        Cliquez sur la photo pour modifier
      </p>
    </div>
  );
};

export default ProfilePictureUploader; 