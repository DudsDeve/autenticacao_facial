import 
{ useState } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, Card, CardContent, Typography, Avatar,
  Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip, Divider, Grid, Stack
} from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const mockJobs = [
  {
    id: 1,
    title: "Desenvolvedor React Pleno",
    area: "Tecnologia",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 7.500,00",
    benefits: ["VR", "Plano de Saúde", "Inglês in-company"],
    status: "Ativa",
    description: "Desenvolvimento de aplicações web modernas com React, integração com APIs e colaboração com squads ágeis.",
  },
  {
    id: 2,
    title: "Analista de RH Sênior",
    area: "Recursos Humanos",
    location: "Presencial - BH",
    type: "PJ",
    salary: "R$ 5.000,00",
    benefits: ["Vale transporte", "Plano odontológico"],
    status: "Encerrada",
    description: "Atuação em recrutamento e seleção, treinamento de equipes e gestão de clima organizacional.",
  },
  {
    id: 3,
    title: "Desenvolvedor React Pleno",
    area: "Tecnologia",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 7.500,00",
    benefits: ["VR", "Plano de Saúde", "Inglês in-company"],
    status: "Ativa",
    description: "Desenvolvimento de aplicações web modernas com React, integração com APIs e colaboração com squads ágeis.",
  },
  {
    id: 4,
    title: "Desenvolvedor React Pleno",
    area: "Tecnologia",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 7.500,00",
    benefits: ["VR", "Plano de Saúde", "Inglês in-company"],
    status: "Ativa",
    description: "Desenvolvimento de aplicações web modernas com React, integração com APIs e colaboração com squads ágeis.",
  },
];

const defaultForm = {
  title: "",
  area: "",
  location: "",
  type: "",
  salary: "",
  status: "Ativa",
  benefits: [],
  description: "",
};

const benefitOptions = [
  "VR", "VA", "Plano de Saúde", "Plano odontológico",
  "Home office", "Gympass", "Seguro de vida", "Bônus anual", "Inglês in-company",
];

export function Jobs() {
  const [jobs, setJobs] = useState(mockJobs);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  // Adicionar ou Editar vaga
  const handleSave = () => {
    if (!form.title) return;
    setJobs((prev: any) =>
      (form as any).id
        ? prev.map((j: any) => (j.id === (form as any).id ? { ...form } : j))
        : [{ ...form, id: Date.now() }, ...prev]
    );
    setModalOpen(false);
    setForm(defaultForm);
  };

  // Remover vaga
  const handleDelete = (id: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  // Editar vaga
  const handleEdit = (job: any) => {
    setForm(job);
    setModalOpen(true);
  };

  // Manipular benefícios (add/remove)
  const handleBenefit = (benefit: string) => {
    setForm((f: any) =>
      f.benefits.includes(benefit)
        ? { ...f, benefits: f.benefits.filter((b: any) => b !== benefit) }
        : { ...f, benefits: [...f.benefits, benefit] }
    );
  };

  return (
    <Box sx={{
      width: "100%",
      px: { xs: 1, md: 5 }, pb: 6, mx: "auto",
      backgroundColor: "red",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      height: "100%",
    }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 4 }}>
        <Grid >
          <Typography variant="h4" fontWeight="bold">
            Vagas abertas
          </Typography>
        </Grid>
        <Grid >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => { setModalOpen(true); setForm(defaultForm); }}
            sx={{ boxShadow: 2, borderRadius: 2, fontWeight: 700 }}
          >
            Nova vaga
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ height: "100%", backgroundColor: "blue" }}   >
        {jobs.length === 0 && (
          <Grid  size={12}>
            <Typography variant="h6" color="text.secondary" align="center" mt={10}>
              Nenhuma vaga cadastrada.
            </Typography>
          </Grid>
        )}
        {jobs.map((job) => (
          <Grid  size={12}  key={job.id}>
            <Card elevation={3} sx={{ borderRadius: 3, position: "relative", px: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: "#1565c0" }}>
                    <WorkIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight={700} noWrap>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{job.area}</Typography>
                  </Box>
                  <Chip
                    label={job.status}
                    color={job.status === "Ativa" ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => handleEdit(job)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton size="small" onClick={() => handleDelete(job.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {job.description}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" mb={1.5}>
                  <Chip size="small" label={job.type} color="secondary" />
                  <Chip size="small" label={job.location} color="info" />
                  <Chip size="small" label={job.salary} color="secondary" />
                </Stack>
                <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
                  {job.benefits.map((b, i) => (
                    <Chip key={i} label={b} variant="outlined" color="success" size="small" />
                  ))}
                </Stack>
                <Divider sx={{ mb: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal para criar/editar vaga */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{(form as any).id ? "Editar vaga" : "Nova vaga"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Título da vaga"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              fullWidth required autoFocus
            />
            <TextField
              label="Área"
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              fullWidth required
            />
            <TextField
              label="Local"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                required
              >
                <MenuItem value="CLT">CLT</MenuItem>
                <MenuItem value="PJ">PJ</MenuItem>
                <MenuItem value="Freelancer">Freelancer</MenuItem>
                <MenuItem value="Estágio">Estágio</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Salário"
              value={form.salary}
              onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              multiline minRows={2}
              fullWidth
            />
            <Stack direction="row" gap={1} flexWrap="wrap">
              {benefitOptions.map((benefit) => (
                <Chip
                  key={benefit}
                  label={benefit}
                  clickable
                  color={(form as any).benefits.includes(benefit) ? "success" : "default"}
                  variant={(form as any).benefits.includes(benefit) ? "filled" : "outlined"}
                  onClick={() => handleBenefit(benefit)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="Ativa">Ativa</MenuItem>
                <MenuItem value="Encerrada">Encerrada</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.title || !form.area}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
