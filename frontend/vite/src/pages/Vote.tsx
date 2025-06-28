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
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", backgroundColor: "#fff" }}>
      <TextField
        label="Search Professors"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
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
              {filtered.map((prof) => {

                return (
                  <Box
                    key={prof.id}
                    sx={{
                      width: { xs: "100%", sm: "45%", md: "30%" },
                      display: "flex",
                      justifyContent: "center",
                    }}
                    onClick={() => handleClick(prof)}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        maxWidth: 300,
                        cursor: "pointer",
                        transition: "0.3s ease",
                        textAlign: "center",
                        borderRadius: 4,
                        backgroundColor: "#ffffff",
                        border: "2px white",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)",
                        },
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
                              maxWidth: "120px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "#111111", fontWeight: "bold" }}
                        >
                          {prof.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#333333", mb: 2 }}
                        >
                          Faculty: {prof.faculty}
                        </Typography>

                        <Box sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              background: "#1976d2",
                              color: "white",
                              borderRadius: 2,
                              fontWeight: "bold",
                              py: 1,
                              px: 7,
                              display: "inline-block",
                              fontSize: "0.9rem",
                              cursor: "pointer",
                              transition: "0.3s",
                              "&:hover": {
                                background: "white",
                                color: "#1976d2",
                                border: "1px solid #065f46",
                              },
                            }}
                          >
                            Vote
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography
              mt={4}
              sx={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: "1.2rem",
                backgroundColor: "#ffffff",
                p: 3,
                borderRadius: 2,
                boxShadow: 1,
                maxWidth: 400,
                mx: "auto",
              }}
            >
              No results found. Try a different name or faculty.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Vote;
