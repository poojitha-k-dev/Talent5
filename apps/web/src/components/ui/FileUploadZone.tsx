'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { formatDuration } from '@talent5/utils';

interface FileUploadZoneProps {
  accept: 'audio' | 'image';
  label: string;
  helperText?: string;
  maxSizeBytes?: number;
  token?: string;
  onFileUploaded: (result: {
    key: string;
    url: string;
    fileName: string;
    sizeBytes: number;
    durationSeconds?: number;
  }) => void;
  onClear?: () => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  label,
  helperText,
  maxSizeBytes = accept === 'audio' ? 100 * 1024 * 1024 : 15 * 1024 * 1024,
  token,
  onFileUploaded,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedDuration, setExtractedDuration] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const allowedExtensions =
    accept === 'audio'
      ? ['.mp3', '.wav', '.m4a', '.flac', '.aac']
      : ['.jpg', '.jpeg', '.png', '.webp'];

  const allowedMimeTypes =
    accept === 'audio'
      ? ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/flac', 'audio/x-flac']
      : ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (selectedFile: File): { valid: boolean; error?: string } => {
    // Check size
    if (selectedFile.size > maxSizeBytes) {
      const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      const actualMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Your file is ${actualMB} MB. The maximum allowed limit is ${maxMB} MB.`,
      };
    }

    // Check extension
    const ext = '.' + (selectedFile.name.split('.').pop() || '').toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File format "${ext}" is not supported. Please choose ${allowedExtensions.join(', ')}.`,
      };
    }

    return { valid: true };
  };

  const processFile = async (selectedFile: File) => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      setStatus('ERROR');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setProgress(0);

    // If image: create local object URL preview
    if (accept === 'image') {
      const localUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(localUrl);
    }

    // If audio: extract duration in browser using HTMLAudioElement
    if (accept === 'audio') {
      const localAudioUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(localAudioUrl);
      try {
        const audio = new Audio();
        audio.src = localAudioUrl;
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && !isNaN(audio.duration)) {
            const dur = Math.round(audio.duration);
            setExtractedDuration(dur);
          }
        });
      } catch (err) {
        console.warn('Could not extract audio metadata', err);
      }
    }

    // Begin upload
    startUpload(selectedFile);
  };

  const startUpload = async (fileToUpload: File) => {
    setStatus('UPLOADING');
    setProgress(5);

    try {
      // 1. Request secure upload ticket
      const ticketRes = await fetch('/api/v1/uploads/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fileName: fileToUpload.name,
          contentType: fileToUpload.type || (accept === 'audio' ? 'audio/mpeg' : 'image/jpeg'),
          sizeBytes: fileToUpload.size,
          prefix: accept === 'audio' ? 'audio-masters' : 'covers',
        }),
      });

      const ticketJson = await ticketRes.json();
      if (!ticketRes.ok || !ticketJson.success) {
        throw new Error(ticketJson.error?.message || 'Could not initiate upload ticket.');
      }

      const { uploadUrl, publicUrl, key } = ticketJson.data;

      // 2. Perform direct streaming upload with XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 90) + 5;
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          setStatus('SUCCESS');
          onFileUploaded({
            key,
            url: publicUrl,
            fileName: fileToUpload.name,
            sizeBytes: fileToUpload.size,
            durationSeconds: extractedDuration,
          });
        } else {
          setStatus('ERROR');
          setErrorMessage(`Upload failed with status code ${xhr.status}.`);
        }
      };

      xhr.onerror = () => {
        setStatus('ERROR');
        setErrorMessage('Network error occurred during upload. Please verify connection and retry.');
      };

      xhr.onabort = () => {
        setStatus('IDLE');
        setProgress(0);
      };

      xhr.open('POST', uploadUrl, true);
      // Send directly as binary payload
      xhr.send(fileToUpload);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Failed to complete upload.');
    }
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setFile(null);
    setPreviewUrl(null);
    setStatus('IDLE');
    setProgress(0);
    setErrorMessage(null);
    if (onClear) onClear();
  };

  const handleRetry = () => {
    if (file) {
      startUpload(file);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {status === 'SUCCESS' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </span>
        )}
      </div>

      {/* Upload Box */}
      {status === 'IDLE' || status === 'ERROR' ? (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-black/15 dark:border-white/10 hover:border-amber-500/40 bg-white/40 dark:bg-midnight-950/40 hover:bg-white/70 dark:hover:bg-midnight-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedExtensions.join(',')}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 border border-amber-500/20 shadow-sm">
              {accept === 'audio' ? <Music className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white text-center">
              Drag and drop your {accept === 'audio' ? 'audio master' : 'cover artwork'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              or <span className="text-amber-500 font-semibold underline">browse files</span> on your device
            </p>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 text-center">
              {helperText || `Formats: ${allowedExtensions.join(', ')} • Max: ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB`}
            </p>
          </div>

          {/* Error Message */}
          {status === 'ERROR' && errorMessage && (
            <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1 font-semibold text-xs text-rose-600 dark:text-rose-300 hover:underline flex-shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Uploading Progress State */}
      {status === 'UPLOADING' && (
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-midnight-900 border border-amber-500/20 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-gray-200 truncate max-w-[200px]">
              {file?.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-amber-500 font-bold">{progress}%</span>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Cancel Upload"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Uploading directly to storage engine...</span>
            <span>{file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}</span>
          </p>
        </div>
      )}

      {/* Success Preview State */}
      {status === 'SUCCESS' && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {accept === 'image' && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {file?.name || 'File Uploaded'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                {extractedDuration > 0 && ` • Duration: ${formatDuration(extractedDuration)}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-2"
            title="Replace File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
