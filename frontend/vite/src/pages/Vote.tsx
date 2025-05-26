import { Box, Button, Typography, Chip } from "@mui/material";
import Searchbar from "../components/Searchbar";
import { useState } from "react";

const Vote = () => {
  const [name, setName] = useState("");
  const [selectedCategory, setCategory] = useState(0);

  const onSelectName = (name: string) => {
    setName(name);
  };

  const onSelectCategory = (id: number) => {
    setCategory(id);
  };

  return (
    <Box>
      <Searchbar onSelectName={onSelectName} names={names}></Searchbar>
      <Typography>{name}</Typography>
      <Box>
        {categories.map((category) => (
          <Chip
            label={category.name}
            variant={selectedCategory === category.id ? "outlined" : "filled"}
            onClick={() => onSelectCategory(category.id)}
          />
        ))}
      </Box>
      <Button>Vote</Button>
    </Box>
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
