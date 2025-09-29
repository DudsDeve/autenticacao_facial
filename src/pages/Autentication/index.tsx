import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Stack,
  Avatar,
  Fade,
  Zoom,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera,
  CameraAlt,
  CheckCircle,
  Error as ErrorIcon,
  Phone,
  Face,
  AutoMode,
} from '@mui/icons-material';

function dataURLtoBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

type Props = {
  initialTelefone: string;
  initialTimestamp: number | null;
};

export default function BankStyleCamera({ initialTelefone }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceInPosition, setFaceInPosition] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [countdown, setCountdown] = useState(0);
  
  const telefone = initialTelefone;

  // Verifica suporte do navegador
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
      const hasFaceDetection = 'FaceDetector' in window;
      
      if (!hasMediaDevices) {
        setStatus('Seu navegador não suporta acesso à câmera. Use HTTPS e um navegador atualizado.');
      } else if (!hasFaceDetection) {
        setStatus('Detecção facial não disponível. Modo manual ativado.');
        setAutoCapture(false);
      }
    };
    
    checkSupport();
    return () => {
      stopStream();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
      setFaceDetected(false);
      setFaceInPosition(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [stream]);

  // Detecção de rosto
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !detectionCanvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      // Simula detecção facial (em produção, use FaceDetector API ou biblioteca ML)
      // Por compatibilidade, vamos usar uma simulação baseada em movimento
      //const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasMovement = false; //detectMovement(imageData);
      
      if (hasMovement) {
        // Simula posição do rosto no centro da tela
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const faceWidth = 200;
        const faceHeight = 250;
        
        const mockFace = {
          x: centerX - faceWidth / 2,
          y: centerY - faceHeight / 2,
          width: faceWidth,
          height: faceHeight
        };
        
        setFaceDetected(true);
        
        // Verifica se o rosto está na posição correta (centro do círculo)
        const isInPosition = checkFacePosition(mockFace, canvas.width, canvas.height);
        setFaceInPosition(isInPosition);
        
        if (isInPosition && autoCapture && !uploading && countdown === 0) {
          startCountdown();
        }
      } else {
        setFaceDetected(false);
        setFaceInPosition(false);
      }
    } catch (error) {
      console.log('Face detection not available, using fallback');
    }

    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
    }
  }, [cameraActive, autoCapture, uploading, countdown]);



  const checkFacePosition = (face: { x: number; y: number; width: number; height: number }, canvasWidth: number, canvasHeight: number): boolean => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;
    
    const tolerance = 50;
    return (
      Math.abs(faceCenterX - centerX) < tolerance &&
      Math.abs(faceCenterY - centerY) < tolerance &&
      face.width > 150 && face.width < 300 // Tamanho apropriado
    );
  };

  const startCountdown = useCallback(() => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          captureAndStore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startCamera = async () => {
    try {
      setStatus('Pedindo acesso à câmera...');
      stopStream();
      
      let newStream: MediaStream | null = null;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' } },
          audio: false
        });
      }
      
      setStream(newStream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
        
        // Inicia detecção facial após o vídeo carregar
        videoRef.current.onloadedmetadata = () => {
          detectFace();
        };
      }
      
      setStatus('Posicione seu rosto no círculo central');
    } catch (error) {
      console.error(error);
      setStatus('Não foi possível acessar a câmera. Verifique permissões e HTTPS.');
    }
  };

  const captureToDataURL = async (): Promise<{ dataURL: string; mime: string; blob: Blob }> => {
    if (!videoRef.current) throw new Error('Vídeo não inicializado');
    
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) throw new Error('Vídeo ainda não está pronto.');
    
    const maxW = 1280;
    const scale = Math.min(1, maxW / vw);
    const cw = Math.round(vw * scale);
    const ch = Math.round(vh * scale);
    
    const canvas = canvasRef.current!;
    canvas.width = cw;
    canvas.height = ch;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas não disponível');
    
    // Captura imagem normal (não espelhada)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -cw, 0, cw, ch);
    ctx.restore();
    
    const mime = 'image/jpeg';
    const dataURL = canvas.toDataURL(mime, 0.92);
    const blob = dataURLtoBlob(dataURL);
    
    return { dataURL, mime, blob };
  };

  const saveBase64ToSupabase = async (base64: string) => {
    // Simula salvamento (substitua pela sua implementação real)
    console.log('Salvando base64 para telefone:', telefone, 'dados:', base64.substring(0, 50) + '...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay
    return { ok: true, action: 'updated' };
  };

  const captureAndStore = async () => {
    try {
      if (!telefone) {  // não é necessário verificar o telefone    aqui é apenas para simular o erro de não ter o telefone 
        throw new Error('Telefone não fornecido');
      }

      setUploading(true);
      setStatus('Capturando foto...');
      
      const { dataURL, blob } = await captureToDataURL();
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      
      const base64 = dataURL.replace(/^data:[^;]+;base64,/, '');
      
      setStatus('Salvando...');
      const result = await saveBase64ToSupabase(base64);
      
      if (result.ok) {
        setStatus('✅ Foto salva com sucesso!');
        stopStream(); // Para a câmera após capturar
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (error: any) {
      setStatus(`❌ Erro: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      setCountdown(0);
    }
  };

  //const formatTimestamp = (timestamp: number) => {
  //  return new Date(timestamp).toLocaleString('pt-BR');
  //};

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Background gradient */}
      <Paper 
        elevation={0}
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Card sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <Face sx={{ fontSize: 30 }} />
            </Avatar>
            
            <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
              Verificação Facial
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {autoCapture ? 'Posicione seu rosto no círculo - captura automática' : 'Posicione seu rosto e clique para capturar'}
            </Typography>

            {telefone && (
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                <Chip
                  icon={<Phone />}
                  label={telefone}
                  color="primary"
                  size="small"
                />
                {autoCapture && (
                  <Chip
                    icon={<AutoMode />}
                    label="Auto"
                    color="secondary"
                    size="small"
                  />
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Camera Area */}
        <Card sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              backgroundColor: '#000',
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Espelha para selfie
                display: cameraActive ? 'block' : 'none'
              }}
            />
            
            {/* Overlay circular para guiar posicionamento */}
            {cameraActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                {/* Overlay escuro */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                  }}
                />
                
                {/* Círculo guia */}
                <Box
                  sx={{
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    border: faceInPosition ? '4px solid #4caf50' : '4px solid #fff',
                    backgroundColor: 'transparent',
                    boxShadow: faceInPosition 
                      ? '0 0 0 9999px rgba(0, 0, 0, 0.4)' 
                      : '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Ícone central */}
                  {!faceDetected && (
                    <Face 
                      sx={{ 
                        fontSize: 60, 
                        color: 'rgba(255, 255, 255, 0.7)',
                        animation: 'pulse 2s infinite'
                      }} 
                    />
                  )}
                  
                  {/* Countdown */}
                  {countdown > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          color: '#4caf50',
                          fontWeight: 'bold',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                          animation: 'scaleUp 1s ease-out'
                        }}
                      >
                        {countdown}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Status indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  {faceDetected && (
                    <Chip
                      icon={<Face />}
                      label={faceInPosition ? "Posição OK" : "Ajuste posição"}
                      color={faceInPosition ? "success" : "warning"}
                      size="small"
                      sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                    />
                  )}
                  
                  {uploading && (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  )}
                </Box>
              </Box>
            )}

            {/* Estado inicial */}
            {!cameraActive && (
              <Box textAlign="center" color="white">
                <CameraAlt sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  Toque para ativar a câmera
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        {/* Preview da foto capturada */}
        {previewUrl && (
          <Zoom in={Boolean(previewUrl)} timeout={500}>
            <Card sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Foto capturada"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Foto capturada com sucesso"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                  }}
                />
              </Box>
            </Card>
          </Zoom>
        )}

        {/* Botões de controle */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          {!previewUrl && (
            <>
              <Button
                onClick={startCamera}
                disabled={uploading}
                variant="contained"
                size="large"
                startIcon={<CameraAlt />}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {cameraActive ? 'Reiniciar Câmera' : 'Iniciar Verificação'}
              </Button>

              {!autoCapture && cameraActive && (
                <Button
                  onClick={captureAndStore}
                  disabled={uploading || !stream}
                  variant="outlined"
                  size="large"
                  startIcon={uploading ? undefined : <PhotoCamera />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  {uploading ? 'Processando...' : 'Capturar Foto'}
                </Button>
              )}
            </>
          )}

          {previewUrl && (
            <Button
              onClick={() => {
                setPreviewUrl('');
                startCamera();
              }}
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                borderColor: 'white',
                color: 'white'
              }}
            >
              Tirar Nova Foto
            </Button>
          )}
        </Stack>

        {/* Progress bar */}
        {uploading && (
          <Fade in={uploading}>
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                sx={{ 
                  borderRadius: 2,
                  height: 6,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }} 
              />
            </Box>
          </Fade>
        )}

        {/* Status */}
        {status && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {status.includes('✅') && <CheckCircle color="success" />}
                {status.includes('❌') && <ErrorIcon color="error" />}
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {status}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Canvases ocultos */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={detectionCanvasRef} style={{ display: 'none' }} />

      {/* CSS Animations */}
        <style >{`  
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes scaleUp {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Container>
  );
}