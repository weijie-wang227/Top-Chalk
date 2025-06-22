import {
  Box,
  Button,
  Typography,
  Chip,
  Stack,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Searchbar from "../components/Searchbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Data {
  id: number;
  name: string;
}

const Downvote = () => {
  const navigate = useNavigate();
  const [selectedProf, setProf] = useState<Data>({ id: -1, name: "null" });
  const [selectedCategory, setCategory] = useState(1);
  const [selectedSubCategory, setSubCategory] = useState(0);

  const [allCategories, setCategories] = useState<Data[]>([]);
  const [allSubCategories, setSubCategories] = useState<Data[]>([]);
  const [allProfessors, setProfessors] = useState<Data[]>([]);

  const onSelectProf = (data: Data) => setProf(data);
  const onSelectCategory = (id: number) => setCategory(id);
  const onSelectSubCategory = (id: number) => setSubCategory(id);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8080/categoriesDown");
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

  useEffect(() => {
    const fetchSubCat = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/subcategories?category_id=${encodeURIComponent(
            selectedCategory
          )}`
        );
        if (!res.ok) throw new Error("Failed to fetch downvotes");
        const data: Data[] = await res.json();
        setSubCategories(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchSubCat();
  }, [selectedCategory]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    const profId = selectedProf.id;
    const response = await fetch("http://localhost:8080/downvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ profId, selectedSubCategory }),
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
      <Stack
        spacing={4}
        alignItems="center"
        sx={{ width: "100%", maxWidth: "600px" }}
      >
        <Box width="100%">
          <Stack direction="row" spacing={2} justifyContent="center" margin="2">
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
          <Box mt={4}>
            <FormControl fullWidth>
              <InputLabel>Select Complaint</InputLabel>
              <Select
                value={selectedSubCategory || ""}
                label="Select Complaint"
                onChange={(event) => onSelectSubCategory(event.target.value)}
              >
                {allSubCategories.map((subcategory) => (
                  <MenuItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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

export default Downvote;
