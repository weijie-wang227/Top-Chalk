import { Box, Button, Typography, Chip, Stack, Container } from "@mui/material";
import Searchbar from "../components/Searchbar";
import { useState } from "react";

const Vote = () => {
  const [name, setName] = useState("");
  const [selectedCategory, setCategory] = useState(0);

  const onSelectName = (name: string) => setName(name);
  const onSelectCategory = (id: number) => setCategory(id);

  return (
    <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Stack spacing={4} alignItems="center" width="100%">
        <Box width="100%">
          <Stack direction="row" spacing={2} justifyContent="center">
            {categories.map((category) => (
              <Box flex={1} key={category.id}>
                <Chip
                  label={category.name}
                  variant="filled"
                  color={selectedCategory === category.id ? "primary" : "default"}
                  onClick={() => onSelectCategory(category.id)}
                  clickable
                  sx={{ width: "100%", justifyContent: "center" }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Searchbar onSelectName={onSelectName} names={names} />

        {name && <Typography variant="h6">Selected: {name}</Typography>}

        <Button
          variant="contained"
          size="large"
          disabled={!name || selectedCategory === 0}
        >
          Vote
        </Button>
      </Stack>
    </Container>
  );
};

export default Vote;

const names = ["Abby", "Aaron", "Aaaron", "Ben", "Ben Dover", "Cecil"];

const categories = [
  { id: 0, name: "none" },
  { id: 1, name: "funniest" },
  { id: 2, name: "helpful" },
  { id: 3, name: "memorable" },
];