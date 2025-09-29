
/*import {
  Button,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { assumirAtendimento } from '../../services/atendimentoHumanoService';



export function Teste() {
  const [loading, setLoading] = useState(false);
  const [assumido, setAssumido] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleAssumirClick = () => {
    if (assumido) return;
    setConfirmOpen(true);
  };

  const handleConfirmYes = () => {
    setAssumido(true);
    setConfirmOpen(false);
    setToast({ open: true, message: 'Atendimento assumido!', severity: 'info' });
  };

  const handleConfirmNo = () => setConfirmOpen(false);

  const handleEnviarMensagem = async () => {
    if (loading || !mensagem) return;
    setLoading(true);
    try {
      await assumirAtendimento('Eduardo Palhares', mensagem);
      setToast({ open: true, message: 'Mensagem enviada com sucesso!', severity: 'success' });
      setMensagem('');
    } catch (err) {
      setToast({ open: true, message: 'Falha ao enviar mensagem', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Aceita qualquer número de argumentos e verifica reason se existir
const handleToastClose = (...args: any[]) => {
  const reason = args[1];
  if (reason === 'clickaway') return;
  setToast({ ...toast, open: false });
};


  const handleInputKeyDown = (e: any) => {
    if (e.key === 'Enter' && !loading && mensagem && assumido) {
      e.preventDefault();
      handleEnviarMensagem();
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Assumir Atendimento
      </Typography>
      <TextField
        fullWidth
        label="Mensagem para o lead"
        placeholder="Digite sua mensagem"
        value={mensagem}
        onChange={e => setMensagem(e.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={!assumido || loading}
        sx={{ mb: 2 }}
      />
      {!assumido ? (
        <Button
          variant="contained"
          sx={{ background: '#eab308', color: '#fff', fontWeight: 700, borderRadius: 2 }}
          disabled={loading}
          onClick={handleAssumirClick}
          fullWidth
        >
          {loading ? 'Aguardando...' : 'Assumir atendimento'}
        </Button>
      ) : (
        <Button
          variant="contained"
          sx={{ background: '#eab308', color: '#fff', fontWeight: 700, borderRadius: 2 }}
          disabled={loading || !mensagem}
          onClick={handleEnviarMensagem}
          fullWidth
        >
          {loading ? 'Enviando...' : 'Enviar mensagem'}
        </Button>
      )}

      <Dialog open={confirmOpen} onClose={handleConfirmNo}>
        <DialogTitle>Confirmar ação</DialogTitle>
        <DialogContent>
          Tem certeza que deseja assumir o atendimento?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmNo} color="inherit">
            Não
          </Button>
          <Button onClick={handleConfirmYes} sx={{ background: '#eab308', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { background: '#d1a306' } }}>
            Sim
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity as any} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
  */

// src/components/LeadChatsList.tsx
import { useLeadChats } from '@contexts/LeadChatsContext';


export function Teste() {
  const { leadsWithChats, loading } = useLeadChats();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Leads e seus Chats</h2>
      {leadsWithChats.length === 0 && <div>Nenhum lead encontrado.</div>}
      {leadsWithChats.map(lead => (
        <div key={lead.id} style={{ border: '1px solid #ccc', margin: 12, borderRadius: 8, padding: 16 }}>
          <strong>{lead.nome}</strong><br />
          <span>Email: {lead.email} | Telefone: {lead.telefone}</span>
          <div style={{ marginTop: 8 }}>
            <details>
              <summary>MQL Chats ({lead.mqlChats.length})</summary>
              {lead.mqlChats.map(chat => (
                <div key={chat.id} style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
                  {JSON.stringify(chat.message)}
                </div>
              ))}
            </details>
            <details>
              <summary>Não MQL Chats ({lead.naoMqlChats.length})</summary>
              {lead.naoMqlChats.map(chat => (
                <div key={chat.id} style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
                  {JSON.stringify(chat.message)}
                </div>
              ))}
            </details>
            <details>
              <summary>IA WPP Chats ({lead.iaWppChats.length})</summary>
              {lead.iaWppChats.map(chat => (
                <div key={chat.id} style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
                  {JSON.stringify(chat.message)}
                </div>
              ))}
            </details>
          </div>
        </div>
      ))}
    </div>
  );
}

/*
import   { useState } from "react";

const SUPABASE_URL = "https://esslddxlhdwfbgxhzpso.supabase.co"
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2xkZHhsaGR3ZmJneGh6cHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTk1MDIsImV4cCI6MjA2MjIzNTUwMn0.5UGBj-q8oORQiCn077aiM1DfmatNw-ciRC5MuY2DKhQ"

export function Teste() {
  const [form, setForm] = useState({
    instagram: "",
    nome: "",
    email: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: any  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalise(null);

    // 1. Envia para o webhook n8n
    try {
      await fetch(
        "https://n8n.auredigital.com.br/webhook/recebe-analise-instagram",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
    } catch (err) {
      setError("Erro ao enviar dados para o webhook.");
      setLoading(false);
      return;
    }

    // 2. Aguarda 60 segundos (simula análise)
    setTimeout(() => {
      fetchAnalise();
    }, 60000);
  }

  async function fetchAnalise() {
    const { instagram } = form;
const cleanedInstagram = instagram.trim();
    // Puxa do Supabase
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/analises_instagram?instagram=eq.${encodeURIComponent(
          cleanedInstagram
        )}`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setAnalise(data[0]);
      } else {
        setError("Nenhuma análise encontrada para esse Instagram.");
      }
    } catch (err) {
      setError("Erro ao buscar análise na Supabase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Solicitar Análise de Instagram</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="instagram"
          placeholder="Instagram"
          value={form.instagram}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "8px 0", padding: 8 }}
        />
        <input
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "8px 0", padding: 8 }}
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "8px 0", padding: 8 }}
        />
        <input
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
          required
          style={{ width: "100%", margin: "8px 0", padding: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#222",
            color: "#fff",
            marginTop: 12,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: 16 }}>
          <span>Processando... Aguarde até 1 minuto pela análise 🔎</span>
        </div>
      )}

      {analise && (
        <div
          style={{
            background: "#e1ffe1",
            marginTop: 20,
            padding: 16,
            borderRadius: 8,
          }}
        >
          <h3>Análise encontrada:</h3>
          <pre>{JSON.stringify(analise, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginTop: 12 }}>
          <b>Erro:</b> {error}
        </div>
      )}
    </div>
  );
}


*/