import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Upload, X, FileText, Check } from 'lucide-react';

/**
 * FileInput component for handling file uploads
 * Supports single file selection with preview and removal
 */
const FileInput = React.forwardRef(
  ({ className, label, accept, maxSize = 5, onChange, ...props }, ref) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef(null);

    // Convert maxSize from MB to bytes
    const maxSizeBytes = maxSize * 1024 * 1024;

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setError('');
      
      if (!selectedFile) {
        setFile(null);
        if (onChange) onChange(null);
        return;
      }

      // Check file size
      if (selectedFile.size > maxSizeBytes) {
        setError(`La taille du fichier dépasse la limite de ${maxSize} MB`);
        setFile(null);
        if (onChange) onChange(null);
        return;
      }

      setFile(selectedFile);
      if (onChange) onChange(selectedFile);
    };

    const handleRemoveFile = () => {
      setFile(null);
      setError('');
      if (inputRef.current) inputRef.current.value = '';
      if (onChange) onChange(null);
    };

    const triggerFileSelect = () => {
      if (inputRef.current) inputRef.current.click();
    };

    // Format file size for display
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">{label}</label>
            {maxSize && (
              <span className="text-xs text-gray-400">
                Max: {maxSize} MB
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <input
            type="file"
            ref={(node) => {
              // Handle both refs
              inputRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            {...props}
          />

          {!file ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2"
              onClick={triggerFileSelect}
            >
              <Upload className="w-4 h-4" />
              <span>Choisir un fichier</span>
            </Button>
          ) : (
            <div className="flex items-center p-3 border border-slate-700 rounded-md bg-slate-900">
              <FileText className="w-5 h-5 text-cyan-400 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white p-1"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput };