import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from './Button';
import './CameraCapture.css';

export type CameraCaptureState = 'idle' | 'loading' | 'error' | 'success';

type CameraPhase = 'idle' | 'requesting' | 'streaming' | 'captured' | 'error';

interface CameraCaptureProps {
  value: File | null;
  onChange: (file: File | null) => void;
  state?: CameraCaptureState;
  message?: string;
  disabled?: boolean;
  label?: string;
}

const UNSUPPORTED_MESSAGE =
  "This browser doesn't support camera access. Use a recent version of Chrome, Safari, or Edge.";

function classifyCameraError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera permission denied. Enable camera access for this site in your browser settings, then try again.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera found on this device.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Camera is in use by another app. Close it and try again.';
  }
  return "Couldn't access the camera. Try again.";
}

export function CameraCapture({
  value,
  onChange,
  state = 'idle',
  message,
  disabled = false,
  label = 'Camera proof',
}: CameraCaptureProps) {
  const inputId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<CameraPhase>(value ? 'captured' : 'idle');
  const [cameraError, setCameraError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const isInteractive = !disabled && state !== 'loading';
  const supportsCamera =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!supportsCamera) {
      setCameraError(UNSUPPORTED_MESSAGE);
      setPhase('error');
      return;
    }
    setPhase('requesting');
    setCameraError('');
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setPhase('streaming');
    } catch (err) {
      setCameraError(classifyCameraError(err));
      setPhase('error');
    }
  }, [supportsCamera]);

  useEffect(() => {
    if (phase !== 'streaming') return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play();
  }, [phase]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `checkin-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onChange(file);
        setPhase('captured');
        stopStream();
      },
      'image/jpeg',
      0.9,
    );
  }, [onChange, stopStream]);

  const handleRetake = useCallback(() => {
    onChange(null);
    void startCamera();
  }, [onChange, startCamera]);

  useEffect(() => stopStream, [stopStream]);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="camera-capture">
      <span id={inputId} className="mono-label camera-capture__label">
        {label}
      </span>

      <div
        className="camera-capture__zone"
        data-state={state}
        data-disabled={disabled || undefined}
        aria-labelledby={inputId}
      >
        {phase === 'captured' && previewUrl ? (
          <img src={previewUrl} alt="Check-in proof" className="camera-capture__preview" />
        ) : phase === 'streaming' ? (
          <video
            ref={videoRef}
            className="camera-capture__video"
            muted
            playsInline
            autoPlay
            onLoadedData={() => setVideoReady(true)}
          />
        ) : phase === 'requesting' ? (
          <div className="camera-capture__spinner" aria-hidden="true" />
        ) : phase === 'error' ? (
          <div className="camera-capture__placeholder camera-capture__placeholder--error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h3l2-2h6l2 2h3v12H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4 19 20 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{cameraError}</span>
          </div>
        ) : (
          <div className="camera-capture__placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h3l2-2h6l2 2h3v12H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Enable your camera to take a check-in photo</span>
          </div>
        )}

        {state === 'success' ? (
          <span className="camera-capture__badge camera-capture__badge--success" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="camera-capture__canvas" aria-hidden="true" />

      <div className="camera-capture__actions">
        {phase === 'idle' || phase === 'error' ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void startCamera()}
            disabled={!isInteractive}
          >
            {phase === 'error' ? 'Try again' : 'Enable camera'}
          </Button>
        ) : null}

        {phase === 'streaming' ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleCapture}
            disabled={!isInteractive || !videoReady}
          >
            Take photo
          </Button>
        ) : null}

        {phase === 'captured' ? (
          <Button type="button" variant="secondary" onClick={handleRetake} disabled={!isInteractive}>
            Retake
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className={`camera-capture__message camera-capture__message--${state}`}>{message}</p>
      ) : null}
    </div>
  );
}
