import  { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box, Typography, Card, CardContent, Paper, Stack, Button, Badge, IconButton,
  Tooltip, Menu, MenuItem, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Divider
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import { Container, TitleKanban } from "./styles";

// COLUNAS FIXAS DE RH
const initialColumns = [
  { id: "curriculos", title: "Currículos", color: "#f5f5f5" },
  { id: "triagem-ia", title: "Triagem IA", color: "#e3f2fd" },
  { id: "triagem-rh", title: "Triagem RH", color: "#fffde7" },
  { id: "reuniao-rh", title: "Reunião RH", color: "#ede7f6" },
  { id: "gestor-area", title: "Gestor da Área", color: "#e8f5e9" },
  { id: "aprovado", title: "Aprovado", color: "#e0f7fa" },
  { id: "declinado", title: "Declinado", color: "#ffebee" },
];

const initialCards = [
  { id: "1", columnId: "curriculos", title: "Revisar currículo", desc: "João da Silva", priority: "Alta", labels: ["Entrevista"], order: 0 },
  { id: "2", columnId: "curriculos", title: "Contato inicial", desc: "Maria Oliveira", priority: "Média", labels: ["Contato"], order: 1 },
  { id: "3", columnId: "triagem-ia", title: "Currículo analisado IA", desc: "Carlos Souza", priority: "Alta", labels: ["Triagem"], order: 0 },
  { id: "4", columnId: "aprovado", title: "Contratado", desc: "Ana Santos", priority: "Baixa", labels: ["Finalizado"], order: 0 },
  { id: "5", columnId: "declinado", title: "Não atendeu requisitos", desc: "Lucas Silva", priority: "Baixa", labels: ["Declinado"], order: 0 },
];

const priorityColors = {
  Alta: "error",
  Média: "warning",
  Baixa: "success",
};

const defaultLabels = [
  { id: 1, name: "Contato", color: "#0288d1" },
  { id: 2, name: "Entrevista", color: "#f9a825" },
  { id: 3, name: "Triagem", color: "#8e24aa" },
  { id: 4, name: "Finalizado", color: "#43a047" },
  { id: 5, name: "Declinado", color: "#d32f2f" }
];

export function Kanban() {
  const [columns] = useState(initialColumns); // Fixo, se não quiser edição/rem. de coluna
  const [cards, setCards] = useState(initialCards);
  const [labels, setLabels] = useState(defaultLabels);

  // States de UI/menus/modais
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", priority: "Média", labels: [] });

  // Novo label
  const [labelInput, setLabelInput] = useState("");
  const [labelColorInput, setLabelColorInput] = useState("#0288d1");

  // Pega próximo order para novo card
  function getNextOrder(colId: string) {
    return cards.filter((c) => c.columnId === colId).length;
  }

  // DRAG & DROP TOTALMENTE SEGURO!
  function onDragEnd(result: any) {
    const { source, destination, type } = result;
    if (!destination) return;

    // Não permite drag/drop entre colunas fixas
    if (type === "COLUMN") return;

    // Arrasta cards
    setCards(prevCards => {
      let sourceCards = prevCards.filter(c => c.columnId === source.droppableId).sort((a, b) => a.order - b.order);
      let destCards = prevCards.filter(c => c.columnId === destination.droppableId).sort((a, b) => a.order - b.order);

      // Remove do source
      const [movedCard] = sourceCards.splice(source.index, 1);
      if (!movedCard) return prevCards; // safe
      movedCard.columnId = destination.droppableId;

      // Adiciona ao destino
      destCards.splice(destination.index, 0, movedCard);

      // Atualiza orders
      sourceCards = sourceCards.map((c, idx) => ({ ...c, order: idx }));
      destCards = destCards.map((c, idx) => ({ ...c, order: idx }));

      // Junta tudo
      return prevCards
        .filter(c => c.columnId !== source.droppableId && c.columnId !== destination.droppableId)
        .concat(source.droppableId === destination.droppableId ? destCards : [...sourceCards, ...destCards]);
    });
  }

  // --------- UI/CRUD ----------
  function handleAdd(columnId: any) {
    setEditMode(false);
    setForm({ title: "", desc: "", priority: "Média", labels: [] });
    setSelectedCard({ columnId } as any);
    setModalOpen(true);
  }
  function handleSave() {
    if (editMode) {
      setCards(cards =>
        cards.map(card =>
          card.id === (selectedCard as any).id
            ? { ...card, ...form }
            : card
        )
      );
    } else {
      setCards(cards => [
        ...cards,
        {
          id: Date.now().toString(),
          columnId: (selectedCard as any).columnId,
          order: getNextOrder((selectedCard as any).columnId),
          ...form,
        },
      ]);
    }
    setModalOpen(false);
  }
  function handleEdit(card: any) {
    setEditMode(true);
    setSelectedCard(card);
    setForm({
      title: card.title,
      desc: card.desc,
      priority: card.priority,
      labels: card.labels || []
    });
    setModalOpen(true);
  }
  function handleDelete(cardId: any) {
    setCards(cards => cards.filter(c => c.id !== cardId));
    setMenuAnchor(null);
    setModalOpen(false);
  }
  function handleMenu(event: any, card: any) {
    setMenuAnchor(event.currentTarget);
    setSelectedCard(card);
  }
  function handleMenuClose() { setMenuAnchor(null); }
  function handleCardClick(card: any) { handleEdit(card); }
  function getCardCount(colId: any) { return cards.filter((c) => c.columnId === colId).length; }

  // LABELS
  function handleAddLabel() {
    if (!labelInput.trim()) return;
    setLabels(labs => [
      ...labs,
      { id: Date.now(), name: labelInput.trim(), color: labelColorInput }
    ]);
    setLabelInput("");
    setLabelColorInput("#0288d1");
  }
  function handleToggleLabel(labelName: any ) {
    if ((form as any).labels.includes(labelName)) {
      setForm((f: any) => ({ ...f, labels: (f as any).labels.filter((l: any) => l !== labelName) }));
    } else {
      setForm((f: any) => ({ ...f, labels: [...(f as any).labels, labelName] }));
    }
  }

  return (
    <Container>
        <TitleKanban>
            <span>Kanban</span>
        </TitleKanban>
    <Box sx={{
      
   
      overflowX: "auto",
      mx: "auto",
      display: "flex",
      gap: 2,
     
      height: "100%",
      boxSizing: "border-box",
      padding: "8px 0px 0px 10px",
      width: "100%",
     

    }}>
        {/*ajustar a largura*/}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board-droppable" direction="horizontal" type="COLUMN">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: "flex",
                gap: 4,
                minHeight: 500,
                width: "160%",
                minWidth: "160%",
                background: "red",

               

              }}
            >
              {columns.map((col) => (
                <Paper
                  key={col.id}
                  sx={{
                    width: "100vw",
                    maxWidth: 300,
                    minWidth: 300,
                    minHeight: 500,
                    px: 2,
                    py: 2,
                    bgcolor: col.color,
                    transition: "0.2s",
                    borderRadius: 3,
                    boxShadow: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: "80vh",
                    overflowY: "auto",
                    position: "relative"
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Badge badgeContent={getCardCount(col.id)} color="primary" sx={{ mr: 1 }}>
                      <Typography variant="h6">{col.title}</Typography>
                    </Badge>
                    <IconButton size="small" onClick={() => handleAdd(col.id)}>
                      <AddIcon />
                    </IconButton>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  <Droppable droppableId={col.id} type="CARD">
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ flexGrow: 1, minHeight: 20 }}
                      >
                        {cards
                          .filter((c) => c.columnId === col.id)
                          .sort((a, b) => a.order - b.order)
                          .map((card, idx) => (
                            <Draggable draggableId={card.id} index={idx} key={card.id}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    mb: 2,
                                    opacity: snapshot.isDragging ? 0.7 : 1,
                                    borderLeft: `6px solid ${
                                      priorityColors[card.priority as keyof typeof priorityColors]
                                        ? (theme: any) => theme.palette[priorityColors[card.priority as keyof typeof priorityColors]].main
                                        : "#1976d2"
                                    }`,
                                    boxShadow: snapshot.isDragging ? 6 : 1,
                                    cursor: "grab",
                                    transition: "box-shadow 0.3s, opacity 0.2s",
                                    position: "relative"
                                  }}
                                >
                                  <CardContent
                                    sx={{ py: 1.5, position: "relative", cursor: "pointer" }}
                                    onClick={() => handleCardClick(card)}
                                  >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                      <Typography fontWeight="bold" sx={{ maxWidth: 150, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{card.title}</Typography>
                                      <Chip
                                        label={card.priority}
                                        color={priorityColors[card.priority as keyof typeof priorityColors] as any || "default"}
                                        size="small"
                                        sx={{ ml: 1, fontWeight: 600, textTransform: "capitalize" }}
                                      />
                                      <Tooltip title="Mais opções">
                                        <IconButton
                                          onClick={(e) => { e.stopPropagation(); handleMenu(e, card); }}
                                          size="small"
                                          sx={{ ml: 1 }}
                                        >
                                          <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                    <Stack direction="row" gap={1} mt={1}>
                                      {card.labels && card.labels.map((label, i) => {
                                        const labelObj = labels.find(l => l.name === label);
                                        return (
                                          <Chip
                                            key={i}
                                            icon={<LabelIcon fontSize="small" />}
                                            label={label}
                                            size="small"
                                            sx={{
                                              bgcolor: labelObj ? labelObj.color : "#cfd8dc",
                                              color: "#fff",
                                              fontWeight: 500
                                            }}
                                          />
                                        );
                                      })}
                                    </Stack>
                                    {card.desc && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {card.desc}
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* MENU do card */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem onClick={() => { handleEdit(selectedCard); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { handleDelete((selectedCard as any).id); handleMenuClose(); }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Excluir
        </MenuItem>
      </Menu>

      {/* MODAL de card */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? "Editar Card" : "Novo Card"}</DialogTitle>
        <DialogContent>
          <Stack gap={2} pt={1}>
            <TextField
              label="Título"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              select
              label="Prioridade"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </TextField>
            <Box>
              <Typography fontWeight="bold" mb={0.5} fontSize={14}>Labels</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {labels.map(lab => (
                  <Chip
                    key={lab.id}
                    icon={<LabelIcon fontSize="small" />}
                    label={lab.name}
                    size="small"
                    sx={{
                      bgcolor: lab.color,
                      color: "#fff",
                      fontWeight: 500,
                      opacity: (form as any).labels.includes(lab.name) ? 1 : 0.5,
                      border: (form as any).labels.includes(lab.name) ? "2px solid #fff" : "none",
                      cursor: "pointer"
                    }}
                    onClick={() => handleToggleLabel(lab.name)}
                  />
                ))}
              </Stack>
              {/* Adicionar novo label */}
              <Stack direction="row" gap={1} mt={1} alignItems="center">
                <TextField
                  label="Novo label"
                  size="small"
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  sx={{ minWidth: 100 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <input
                          type="color"
                          value={labelColorInput}
                          onChange={e => setLabelColorInput(e.target.value)}
                          style={{ border: "none", background: "none", width: 22, height: 22, cursor: "pointer" }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
                <Button size="small" variant="outlined" onClick={handleAddLabel}>Adicionar</Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          {editMode && (
            <Button color="error" onClick={() => handleDelete((selectedCard as any).id)}>
              Excluir
            </Button>
          )}
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Container>
  );
}
