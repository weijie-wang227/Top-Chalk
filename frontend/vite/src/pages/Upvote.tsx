import { Box, Button, Typography, Chip, Stack, Container } from "@mui/material";
import Searchbar from "../components/Searchbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Data {
  id: number;
  name: string;
}

const Upvote = () => {
  const navigate = useNavigate();
  const [selectedProf, setProf] = useState<Data>({ id: -1, name: "null" });
  const [selectedCategory, setCategory] = useState(0);
  const [allCategories, setCategories] = useState<Data[]>([]);
  const [allProfessors, setProfessors] = useState<Data[]>([]);

  const onSelectProf = (data: Data) => setProf(data);
  const onSelectCategory = (id: number) => setCategory(id);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8080/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Data[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };

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

    fetchCategories();
    fetchProfessors();
  }, []);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const profId = selectedProf.id;
    const response = await fetch("http://localhost:8080/upvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ profId, selectedCategory }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      navigate("/");
    } else {
      console.log("Vote failed");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Stack spacing={4} alignItems="center" width="100%">
        <Box width="100%">
          <Stack direction="row" spacing={2} justifyContent="center">
            {allCategories.map((category) => (
              <Box flex={1} key={category.id}>
                <Chip
                  label={category.name}
                  variant="filled"
                  color={
                    selectedCategory === category.id ? "primary" : "default"
                  }
                  onClick={() => onSelectCategory(category.id)}
                  clickable
                  sx={{ width: "100%", justifyContent: "center" }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Searchbar onSelectProf={onSelectProf} profs={allProfessors} />

        {selectedProf && (
          <Typography variant="h6">Selected: {selectedProf.name}</Typography>
        )}

        <Button
          variant="contained"
          size="large"
          disabled={!selectedProf || selectedCategory === 0}
          onClick={handleVote}
        >
          Vote
        </Button>
      </Stack>
    </Container>
  );
};

export default Upvote;
