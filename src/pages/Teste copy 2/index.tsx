import { useEffect, useRef, useState } from "react";

/**
 * Abre apenas a câmera frontal (selfie), preview espelhado
 * e envia BASE64 + telefone (da URL) para o webhook:
 *   POST https://n8n.auredigital.com.br/webhook/foto-do-candidato
 *
 * Exemplo de link para abrir esta página:
 *   https://SEU-DOMINIO/camera?telefone=553199457553
 *   (também aceita ?tel=...)
 */

function dataURLtoBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// Opcional: garante que tenha "9" após DDI+DDD "5531"
function addNineAfter31(raw: string): string {
  const s = String(raw).replace(/\D/g, "");
  if (s.startsWith("5531") && s.length >= 11 && s[4] !== "9") {
    return s.slice(0, 4) + "9" + s.slice(4);
  }
  return s;
}

export default function CaptureAndUpload() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [hasSupport, setHasSupport] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const RH_URL = "https://n8n.auredigital.com.br/webhook/foto-do-candidato";

  // 👉 telefone vindo do link ?telefone=... ou ?tel=...
  const params = new URLSearchParams(window.location.search);
  const telefoneParam =
    params.get("telefone") || params.get("tel") || "";
  // Sanitiza e (opcional) insere o 9 após 31
  const telefone = addNineAfter31(telefoneParam);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasSupport(false);
      setStatus("Seu navegador não suporta acesso à câmera. Use HTTPS e um navegador atualizado.");
    }
    return () => { stopStream(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }

  async function startCamera() {
    try {
      setStatus("Pedindo acesso à câmera (selfie)...");
      await stopStream();

      let s: MediaStream | null = null;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "user" } },
          audio: false,
        });
      } catch {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false,
        });
      }

      setStream(s!);
      if (videoRef.current) {
        videoRef.current.srcObject = s!;
        await videoRef.current.play().catch(() => {});
      }
      setStatus("Câmera frontal ativa.");
    } catch (e) {
      console.error(e);
      setStatus("Não foi possível acessar a câmera frontal. Verifique permissões e HTTPS.");
    }
  }

  async function captureToDataURL(): Promise<{ dataURL: string; mime: string; blob: Blob }> {
    if (!videoRef.current) throw new Error("Vídeo não inicializado");
    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) throw new Error("Vídeo ainda não está pronto.");

    const maxW = 1280;
    const scale = Math.min(1, maxW / vw);
    const cw = Math.round(vw * scale);
    const ch = Math.round(vh * scale);

    const canvas = canvasRef.current!;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas não disponível");

    // Preview é espelhado, a imagem enviada NÃO (canvas “normal”)
    ctx.drawImage(video, 0, 0, cw, ch);

    const mime = "image/jpeg";
    const dataURL = canvas.toDataURL(mime, 0.92);
    const blob = dataURLtoBlob(dataURL);
    return { dataURL, mime, blob };
  }

  async function captureAndSendBase64() {
    try {
      setUploading(true);
      setStatus("Capturando…");

      const { dataURL, mime, blob } = await captureToDataURL();

      // Preview local
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const localUrl = URL.createObjectURL(blob);
      setPreviewUrl(localUrl);

      // Remove "data:image/jpeg;base64,"
      const base64 = dataURL.replace(/^data:[^;]+;base64,/, "");
      const filename = `camera_${Date.now()}.jpg`;
      const timestamp = Date.now();

      setStatus("Enviando…");
      const res = await fetch(RH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,        // <- vem do link
          timestamp,       // útil para correlacionar
          mimeType: mime,
          filename,
          sizeBytes: blob.size,
          base64,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Upload error", data);
        setStatus("Falha no envio ❌");
      } else {
        setStatus("Enviado com sucesso ✅");
      }
    } catch (e) {
      console.error(e);
      setStatus("Erro ao capturar/enviar ❌");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4">
      <div className="max-w-xl mx-auto space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Fotografe e envie</h1>
          <p className="text-sm opacity-80">
            Apenas câmera frontal (selfie), sem galeria.
          </p>
          {telefone && (
            <p className="text-xs opacity-70">Telefone detectado: {telefone}</p>
          )}
        </header>

        {!hasSupport && (
          <div className="p-3 rounded-xl bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
            Seu navegador não suporta acesso à câmera. Use um navegador atualizado e HTTPS.
          </div>
        )}

        <div className="rounded-2xl overflow-hidden bg-black">
          {/* Preview espelhado */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-auto block"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {previewUrl && (
          <div>
            <img src={previewUrl} alt="Pré-visualização" className="rounded-2xl w-full h-auto" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={startCamera}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white disabled:opacity-50"
          >
            Iniciar câmera (selfie)
          </button>
        </div>

        <button
          onClick={captureAndSendBase64}
          disabled={uploading}
          className="w-full px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white disabled:opacity-50"
        >
          {uploading ? "Enviando…" : "Capturar imagem"}
        </button>

        <div id="status" className="text-sm opacity-80 min-h-[1.25rem]">{status}</div>
      </div>
    </div>
  );
}
