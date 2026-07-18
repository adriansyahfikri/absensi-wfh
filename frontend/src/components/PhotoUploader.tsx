import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from 'react';
import './PhotoUploader.css';

export type PhotoUploaderState = 'idle' | 'loading' | 'error' | 'success';

interface PhotoUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  state?: PhotoUploaderState;
  message?: string;
  disabled?: boolean;
  label?: string;
}

/**
 * Reusable drag-and-drop / click-to-browse photo picker with an inline
 * preview. Used by the employee check-in flow, but intentionally has no
 * check-in-specific logic — it's a generic "pick + preview one image" input.
 */
export function PhotoUploader({
  value,
  onChange,
  state = 'idle',
  message,
  disabled = false,
  label = 'Photo proof',
}: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const isInteractive = !disabled && state !== 'loading';

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!isInteractive || !files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;
      onChange(file);
    },
    [isInteractive, onChange],
  );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="photo-uploader">
      <label htmlFor={inputId} className="mono-label photo-uploader__label">
        {label}
      </label>

      <div
        className="photo-uploader__zone"
        data-state={state}
        data-drag-active={isDragActive || undefined}
        data-disabled={disabled || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (isInteractive) setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => isInteractive && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-disabled={!isInteractive}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          disabled={!isInteractive}
          onChange={(e) => handleFiles(e.target.files)}
          className="photo-uploader__input"
        />

        {state === 'loading' ? (
          <div className="photo-uploader__spinner" aria-hidden="true" />
        ) : previewUrl ? (
          <img src={previewUrl} alt="Selected proof" className="photo-uploader__preview" />
        ) : (
          <div className="photo-uploader__placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h3l2-2h6l2 2h3v12H4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Click or drag a photo here</span>
          </div>
        )}

        {state === 'success' ? (
          <span className="photo-uploader__badge photo-uploader__badge--success" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>

      {message ? (
        <p className={`photo-uploader__message photo-uploader__message--${state}`}>{message}</p>
      ) : null}
    </div>
  );
}
