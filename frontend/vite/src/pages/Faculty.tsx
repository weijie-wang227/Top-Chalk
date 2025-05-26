import { Box } from "@mui/material";
import Section from "../components/Section";

const Faculty = () => {
  const findItems = (faculty: string) => {
    return data.find((f) => f.faculty == faculty);
  };
  return (
    <Box>
      {faculties.map((faculty) => (
        <Section
          title={faculty}
          items={findItems(faculty)?.professors}
        ></Section>
      ))}
    </Box>
  );
};

const faculties = ["Nursing", "Business", "Medicine"];
const data = [
  {
    faculty: "Business",
    professors: [
      { name: "Prof Jaundice", votes: 10 },
      { name: "Prof Yam", votes: 3 },
      { name: "Prof Perk", votes: 2 },
    ],
  },
  {
    faculty: "Medicine",
    professors: [
      { name: "Prof Zwee", votes: 20 },
      { name: "Prof June", votes: 19 },
      { name: "Prof Tai", votes: 18 },
    ],
  },
  {
    faculty: "Nursing",
    professors: [
      { name: "Prof Grah", votes: 22 },
      { name: "Prof Shooby", votes: 21 },
      { name: "Shazam", votes: -10 },
    ],
  },
];

export default Faculty;
