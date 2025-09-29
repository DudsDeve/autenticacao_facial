import { useEffect, useRef, useState } from 'react';
import { supabase } from '@database/SupabaseClient';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Avatar,
  
  Fade,
  Zoom,
} from '@mui/material';
import {
  PhotoCamera,
  CameraAlt,
  CheckCircle,
  Error as ErrorIcon,
  Phone,
  Schedule,
} from '@mui/icons-material';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function CaptureAndUpload({ initialTelefone, initialTimestamp }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [hasSupport, setHasSupport] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  const telefone = initialTelefone;

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasSupport(false);
      setStatus('Seu navegador não suporta acesso à câmera. Use HTTPS e um navegador atualizado.');
      toast.error('Navegador não suporta acesso à câmera!');
    }
    return () => {
      stopStream();
    };
  }, []);

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setCameraActive(false);
    }
  }

  async function startCamera() {
    try {
      setStatus('Pedindo acesso à câmera (selfie)…');
      toast.info('Solicitando acesso à câmera...');
      stopStream();
      
      let s: MediaStream | null = null;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'user' } },
          audio: false
        });
      } catch {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' } },
          audio: false
        });
      }
      
      setStream(s!);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s!;
        await videoRef.current.play().catch(() => {});
      }
      setStatus('Câmera frontal ativa.');
      toast.success('Câmera ativada com sucesso!');
    } catch (e) {
      console.error(e);
      setStatus('Não foi possível acessar a câmera frontal. Verifique permissões e HTTPS.');
      toast.error('Falha ao acessar a câmera. Verifique as permissões!');
    }
  }

  async function captureToDataURL(): Promise<{ dataURL: string; mime: string; blob: Blob }> {
    if (!videoRef.current) throw new Error('Vídeo não inicializado');
    
    const video = videoRef.current;
    const vw = video.videoWidth, vh = video.videoHeight;
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
    
    // Preview espelhado no <video>; imagem enviada normal
    ctx.drawImage(video, 0, 0, cw, ch);
    
    const mime = 'image/jpeg';
    const dataURL = canvas.toDataURL(mime, 0.92);
    const blob = dataURLtoBlob(dataURL);
    
    return { dataURL, mime, blob };
  }

  async function saveBase64ToSupabase(base64: string) {
    console.log('Tentando salvar para o telefone:', telefone);
    console.log('Base64 length:', base64.length);
    
    const payload = {
      base64_da_foto_de_perfil: base64
    };

    try {
      // 1) Primeiro, verifica se existe um registro com esse telefone
      const { data: existingData, error: selectError } = await supabase
        .from('candidatos_aure')
        .select('telefone')
        .eq('telefone', telefone)
        .limit(1);

      if (selectError) {
        console.error('Erro ao verificar registro existente:', selectError);
        throw selectError;
      }

      console.log('Registros encontrados:', existingData);

      if (existingData && existingData.length > 0) {
        // 2) Se existe, atualiza
        console.log('Atualizando registro existente...');
        const { data: updateData, error: updateError } = await supabase
          .from('candidatos_aure')
          .update(payload)
          .eq('telefone', telefone)
          .select('telefone');

        if (updateError) {
          console.error('Erro ao atualizar:', updateError);
          throw updateError;
        }

        console.log('Registro atualizado:', updateData);
        return { ok: true, action: 'updated', data: updateData };
      } else {
        // 3) Se não existe, cria um novo
        console.log('Criando novo registro...');
        const { data: insertData, error: insertError } = await supabase
          .from('candidatos_aure')
          .insert({
            telefone: telefone,
            ...payload
          })
          .select('telefone');

        if (insertError) {
          console.error('Erro ao inserir:', insertError);
          throw insertError;
        }

        console.log('Registro inserido:', insertData);
        return { ok: true, action: 'inserted', data: insertData };
      }
    } catch (error) {
      console.error('Erro geral no saveBase64ToSupabase:', error);
      throw error;
    }
  }

  async function captureAndStore() {
    try {
      if (!telefone) {
        throw new Error('Telefone não fornecido');
      }

      setUploading(true);
      setStatus('Capturando…');
      toast.info('Capturando foto...');
      
      const { dataURL, blob } = await captureToDataURL();
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      
      // Remove o prefixo data:image/jpeg;base64, para obter apenas o base64
      const base64 = dataURL.replace(/^data:[^;]+;base64,/, '');
      
      setStatus('Salvando no Supabase…');
      const result = await saveBase64ToSupabase(base64);
      
      if (result.ok) {
        const message = `Foto salva com sucesso! ${result.action === 'updated' ? '(Registro atualizado)' : '(Novo registro criado)'}`;
        setStatus(`✅ ${message}`);
        toast.success(message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error('Falha ao salvar no Supabase');
      }
    } catch (e: any) {
      console.error('Erro completo:', e);
      const errorMessage = `Erro ao salvar: ${e?.message || 'Erro desconhecido'}`;
      setStatus(`❌ ${errorMessage}`);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 7000,
      });
    } finally {
      setUploading(false);
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
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
        <Card sx={{ mb: 3, borderRadius: 4, overflow: 'visible' }}>
          <CardContent sx={{ textAlign: 'center', pb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <PhotoCamera sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Capture sua Foto
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Tire uma selfie com a câmera frontal para salvar no sistema
            </Typography>

            {telefone && (
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                <Chip
                  icon={<Phone />}
                  label={telefone}
                  color="primary"
                  variant="outlined"
                />
                {initialTimestamp && (
                  <Chip
                    icon={<Schedule />}
                    label={formatTimestamp(initialTimestamp)}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Erro de suporte */}
        {!hasSupport && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<ErrorIcon />}
          >
            Seu navegador não suporta acesso à câmera. Use um navegador atualizado e HTTPS.
          </Alert>
        )}

        {/* Área de vídeo */}
        <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'relative',
              backgroundColor: '#000',
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                transform: 'scaleX(-1)',
                display: cameraActive ? 'block' : 'none'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!cameraActive && (
              <Box textAlign="center" color="white">
                <CameraAlt sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" sx={{ opacity: 0.7 }}>
                  Clique para ativar a câmera
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        {/* Preview da foto */}
        {previewUrl && (
          <Zoom in={Boolean(previewUrl)} timeout={500}>
            <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <Chip
                  icon={<CheckCircle />}
                  label="Foto capturada"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              </Box>
            </Card>
          </Zoom>
        )}

        {/* Botões */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            onClick={startCamera}
            disabled={uploading}
            variant="outlined"
            size="large"
            startIcon={<CameraAlt />}
            sx={{
              py: 2,
              borderRadius: 3,
              backgroundColor: 'primary.main',
              color: 'white',
              textTransform: 'none',
              fontSize: '1.1rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'primary.main',
                color: 'white'
              }
            }}
          >
            {cameraActive ? 'Reiniciar Câmera' : 'Ativar Câmera Frontal'}
          </Button>

          <Button
            onClick={captureAndStore}
            disabled={uploading || !stream}
            variant="contained"
            size="large"
            startIcon={uploading ? undefined : <PhotoCamera />}
            sx={{
              py: 2.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {uploading ? 'Salvando...' : 'Capturar e Salvar Foto'}
          </Button>
        </Stack>

        {/* Barra de progresso */}
        {uploading && (
          <Fade in={uploading}>
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                sx={{ 
                  borderRadius: 2,
                  height: 8,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }} 
              />
            </Box>
          </Fade>
        )}

        {/* Status */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              {status.includes('✅') && <CheckCircle color="success" />}
              {status.includes('❌') && <ErrorIcon color="error" />}
              <Typography variant="body2" sx={{ flex: 1 }}>
                {status || 'Pronto para começar'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
        toastStyle={{
          borderRadius: '12px',
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
        }}
      />
    </Container>
  );
}