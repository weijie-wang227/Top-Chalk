import React, { useEffect, useState, useRef } from "react";

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
  const [selectedDropdown, setSelectedDropdown] = useState<number | null>(null);
  const [deletedNotes, setDeleted] = useState<number[]>([]);
  const [reportedNotes, setReported] = useState<number[]>([]);

  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch(
          "https://top-chalk-659279002644.asia-southeast1.run.app/auth/request",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) {
          console.error("Auth error:", data.error);
          throw new Error("Not authenticated");
        }

        setId(data.userId); // This will trigger the next useEffect
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    fetchId();
  }, []);

  useEffect(() => {
    if (profId !== -1) {
      const fetchKudos = async () => {
        try {
          const res = await fetch(
            "https://top-chalk-659279002644.asia-southeast1.run.app/getKudos",
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await res.json();

          if (!res.ok) {
            console.error("Fetch Kudos failed:", data.error);
            throw new Error("Not authenticated");
          }

          setNotes(data);
        } catch (err) {
          console.error("Fetch Kudos failed:", err);
        }
      };

      fetchKudos();
    }
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent,
    _id: number,
    _x: number,
    _y: number
  ) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find all notes under cursor
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

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, offset]);

  const handleDelete = (id: number) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setDeleted((prev) => [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(
      "https://top-chalk-659279002644.asia-southeast1.run.app/downvote",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes, deletedNotes, reportedNotes }),
      }
    );

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
    } else {
      console.log("Submit failed");
    }
  };

  return (
    <div
      ref={boardRef}
      className="relative w-full h-screen overflow-hidden bg-white"
    >
      {notes
        .sort((a, b) => a.z - b.z)
        .map((note) => (
          <div
            key={note.id}
            onMouseDown={(e) => handleMouseDown(e, note.id, note.x, note.y)}
            className={`absolute cursor-move rounded-lg shadow-md border-4 transition duration-150 ease-in-out ${
              selectedNoteId === note.id
                ? "border-blue-400"
                : "border-transparent"
            }`}
            style={{
              left: `calc(50% + ${note.x}px)`,
              top: `calc(50% + ${note.y}px)`,
              zIndex: note.z,
            }}
          >
            <div className="relative">
              <img
                src={note.url}
                alt="note"
                className="w-40 h-40 object-contain"
              />
              {/* Dropdown Button */}
              <div className="absolute top-1 right-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDropdown(note.id);
                  }}
                  className="bg-white border border-gray-300 text-black rounded-full w-6 h-6 text-sm flex items-center justify-center shadow"
                >
                  ⋮
                </button>
                {/* Dropdown Menu */}
                {selectedDropdown === note.id && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this note?"
                        );
                        if (confirmed) handleDelete(note.id);
                        setSelectedDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirmed = window.confirm(
                          "Do you want to report this note?"
                        );
                        if (confirmed) {
                          console.log("Reported note:", note.id);
                          setReported((prev) => [...prev, note.id]);
                          handleDelete(note.id);
                        }
                        setSelectedDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

      <button
        onClick={handleSubmit}
        className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-emerald-700"
      >
        Submit Changes
      </button>
    </div>
  );
}
