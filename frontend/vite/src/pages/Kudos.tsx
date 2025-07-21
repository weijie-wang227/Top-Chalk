import React, { useEffect, useState, useRef } from "react";
import { IconButton, Menu, MenuItem, Box, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const API = import.meta.env.VITE_API_BASE_URL;

interface Note {
  id: number;
  x: number;
  y: number;
  url: string;
  z: number;
}

export default function KudosBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [profId, setId] = useState(-1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNoteId, setMenuNoteId] = useState<number | null>(null);
  const [deletedNotes, setDeleted] = useState<number[]>([]);
  const [reportedNotes, setReported] = useState<number[]>([]);

  // Fetch user ID
  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch(`${API}/auth/request`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Not authenticated");
        setId(data.userId);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    fetchId();
  }, []);

  // Fetch kudos notes
  useEffect(() => {
    if (profId !== -1) {
      const fetchKudos = async () => {
        try {
          const res = await fetch(
            `${API}/getKudos?teacher_id=${encodeURIComponent(profId)}`,
            { method: "GET", credentials: "include" }
          );
          const data = await res.json();
          if (!res.ok) throw new Error("Fetch Kudos failed");
          setNotes(data);
        } catch (err) {
          console.error("Fetch Kudos failed:", err);
        }
      };
      fetchKudos();
    }
  }, [profId]);

  // Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const sorted = [...notes].sort((a, b) => b.z - a.z);
    const clicked = sorted.find(
      (note) =>
        mouseX >= rect.width / 2 + note.x &&
        mouseX <= rect.width / 2 + note.x + 160 &&
        mouseY >= rect.height / 2 + note.y &&
        mouseY <= rect.height / 2 + note.y + 160
    );
    if (!clicked) return;

    const newZ = Math.max(...notes.map((n) => n.z)) + 1;
    setNotes((prev) =>
      prev.map((n) => (n.id === clicked.id ? { ...n, z: newZ } : n))
    );

    setSelectedNoteId(clicked.id);
    setDraggingId(clicked.id);
    setOffset({
      x: mouseX - clicked.x - rect.width / 2,
      y: mouseY - clicked.y - rect.height / 2,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingId !== null && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setNotes((prev) =>
        prev.map((note) =>
          note.id === draggingId
            ? {
                ...note,
                x: mouseX - rect.width / 2 - offset.x,
                y: mouseY - rect.height / 2 - offset.y,
              }
            : note
        )
      );
    }
  };

  const handleMouseUp = () => setDraggingId(null);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, offset]);

  // Menu actions
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, noteId: number) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuNoteId(noteId);
  };

  const closeMenu = () => setMenuAnchor(null);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setDeleted((prev) => [...prev, id]);
    }
    closeMenu();
  };

  const handleReport = (id: number) => {
    if (window.confirm("Do you want to report this note?")) {
      setReported((prev) => [...prev, id]);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
    closeMenu();
  };

  const handleSubmit = async () => {
    const response = await fetch(`${API}/updateKudos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ notes, deletedNotes, reportedNotes }),
    });
    if (response.ok) {
      console.log(await response.json());
    } else {
      console.error("Submit failed");
    }
  };

  return (
    <Box
      ref={boardRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        bgcolor: "white",
      }}
    >
      {notes
        .sort((a, b) => a.z - b.z)
        .map((note) => (
          <Box
            key={note.id}
            onMouseDown={handleMouseDown}
            sx={{
              position: "absolute",
              left: `calc(50% + ${note.x}px)`,
              top: `calc(50% + ${note.y}px)`,
              border:
                selectedNoteId === note.id
                  ? "2px solid #42a5f5"
                  : "2px solid transparent",
              borderRadius: 0, // <--- square corners
              boxShadow: 2,
              display: "inline-block", // fits around the image
              cursor: "move",
              zIndex: note.z,
            }}
          >
            <img
              src={note.url}
              alt="note"
              style={{ width: 160, height: 160, display: "block" }}
            />
            <IconButton
              size="small"
              onClick={(e) => openMenu(e, note.id)}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "white",
                borderRadius: "50%", // keep icon button circular
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        ))}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={() => handleDelete(menuNoteId!)}>Delete</MenuItem>
        <MenuItem onClick={() => handleReport(menuNoteId!)}>Report</MenuItem>
      </Menu>

      <Button
        variant="contained"
        color="success"
        onClick={handleSubmit}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        Submit Changes
      </Button>
    </Box>
  );
}
