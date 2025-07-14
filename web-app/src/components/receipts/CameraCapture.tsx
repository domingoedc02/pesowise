import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Cameraswitch as FlipCameraIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon
} from '@mui/icons-material';
import { NeumorphicPaper } from '../common/NeumorphicPaper';

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  open,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const theme = useTheme();

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const getAvailableDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (err) {
      console.error('Error getting devices:', err);
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCapture(file);
        handleClose();
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      
      if (capabilities.torch) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Flash not supported:', err);
        }
      }
    }
  };

  useEffect(() => {
    if (open) {
      getAvailableDevices();
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera, getAvailableDevices]);

  useEffect(() => {
    if (open && facingMode) {
      startCamera();
    }
  }, [facingMode, open, startCamera]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">Capture Receipt</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <NeumorphicPaper sx={{ m: 2, p: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper'
            }}
          >
            {isLoading && (
              <CircularProgress size={40} />
            )}

            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLoading ? 'none' : 'block'
              }}
              playsInline
              muted
            />

            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />

            {/* Camera controls overlay */}
            {!isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1
                }}
              >
                {devices.length > 1 && (
                  <IconButton
                    onClick={toggleCamera}
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)'
                      }
                    }}
                  >
                    <FlipCameraIcon />
                  </IconButton>
                )}

                <IconButton
                  onClick={toggleFlash}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: flashEnabled ? 'yellow' : 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  {flashEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
                </IconButton>
              </Box>
            )}

            {/* Capture guide overlay */}
            {!isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  height: '60%',
                  border: '2px dashed rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  pointerEvents: 'none'
                }}
              />
            )}
          </Box>
        </NeumorphicPaper>

        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Position the receipt within the frame and tap the capture button
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={capturePhoto}
          variant="contained"
          disabled={isLoading}
          startIcon={<CameraIcon />}
          sx={{
            minWidth: 120,
            background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme.palette.mode === 'dark' 
              ? 'inset 2px 2px 5px #1a1a1a, inset -2px -2px 5px #2c2c2c'
              : 'inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #f9f9f9'
          }}
        >
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture;
