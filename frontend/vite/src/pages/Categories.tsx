import { Box } from "@mui/material";
import Section from "../components/Section";

const Categories = () => {
  const findItems = (category: string) => {
    return data.find((cat) => cat.category == category);
  };
  return (
    <Box>
      {categories.map((category) => (
        <Section
          title={category}
          items={findItems(category)?.professors}
        ></Section>
      ))}
    </Box>
  );
};

const categories = ["funniest", "helpful", "memorable"];
const data = [
  {
    category: "funniest",
    professors: [
      { name: "Prof Jaundice", votes: 10 },
      { name: "Prof Yam", votes: 3 },
      { name: "Prof Perk", votes: 2 },
    ],
  },
  {
    category: "helpful",
    professors: [
      { name: "Prof Zwee", votes: 20 },
      { name: "Prof June", votes: 19 },
      { name: "Prof Tai", votes: 18 },
    ],
  },
  {
    category: "memorable",
    professors: [
      { name: "Prof Grah", votes: 22 },
      { name: "Prof Shooby", votes: 21 },
      { name: "Shazam", votes: -10 },
    ],
  },
];

export default Categories;
