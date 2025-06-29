import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Search } from "lucide-react";

interface Data {
  id: number;
  name: string;
  faculty: string;
}

const Vote = () => {
  const [query, setQuery] = useState("");
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [profs, setProfessors] = useState<Data[]>([]);
  const [Allfaculties, setAllFaculties] = useState<Data[]>([]);
  const [faculties, setFaculties] = useState<Data[]>([]);
  const navigate = useNavigate();

  const handleClick = (prof: Data) => {
    navigate(`/professor/${prof.id}`);
  };

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await fetch("http://localhost:8080/professors");
        if (!res.ok) throw new Error("Failed to fetch professors");
        const data: Data[] = await res.json();
        setProfessors(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8080/faculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data: Data[] = await res.json();
        setFaculties(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchProfessors();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const map: Record<number, string> = {};

      await Promise.all(
        profs.map(async (prof) => {
          try {
            const res = await fetch(
              `http://localhost:8080/avatarUrl?id=${prof.id}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const data = await res.json();

            if (!res.ok) {
              console.error("Image error:", data.error);
              map[prof.id] = "/placeholder.jpg";
              throw new Error("Cannot fetch avatar Url");
            }
            map[prof.id] = data.url;
          } catch (err) {
            console.error(`Failed to load image for ${prof.name}`, err);
            map[prof.id] = "/placeholder.jpg";
          }
        })
      );

      setImageMap(map);
    };

    if (profs.length > 0) {
      loadImages();
    }
  }, [profs]);

  const filtered = profs.filter((prof) =>
    prof.name.toLowerCase().includes(query.toLowerCase())
  ).filter((prof) => );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filtered.length > 0) {
      navigate(`/professor/${filtered[0].id}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ mb: 3, p: 2, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">
          Choose your Professor
        </Typography>
      </Paper>
      <TextField
        label="Search Professors"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
      />

      {query && (
        <Box>
          {filtered.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: "center",
              }}
            >
              {filtered.map((prof) => (
                <Box
                  key={prof.id}
                  sx={{
                    width: { xs: "100%", sm: "45%", md: "30%" },
                    flexGrow: 1,
                  }}
                  onClick={() => handleClick(prof)}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <img
                          src={imageMap[prof.id] || "/placeholder.jpg"}
                          alt="Professor"
                          style={{
                            width: "100%",
                            maxWidth: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {prof.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Faculty: {prof.faculty}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
              No results found
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Vote;
