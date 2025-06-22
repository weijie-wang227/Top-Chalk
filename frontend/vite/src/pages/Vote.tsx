import { Box, TextField, Typography, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Data {
  id: number;
  name: string;
  faculty: string;
}

const Vote = () => {
  const [query, setQuery] = useState("");
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [profs, setProfessors] = useState<Data[]>([]);
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
        console.log(data);
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
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filtered.length > 0) {
      navigate(`/professor/${filtered[0].id}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search Professors"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ mb: 4 }}
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
            <Typography mt={2}>No results found</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Vote;
