import { Card, Typography } from "@mui/material";
interface CategoryProps {
  title: string;
  items?:
    | {
        name: string;
        votes: number;
      }[];
}

const Section = ({ title, items }: CategoryProps) => {
  return (
    <>
      {items != undefined && (
        <Card sx={{ p: 2, my: 2 }}>
          <Typography variant="h2">{title}</Typography>
          <Typography variant="h3">
            1: {items[0].name} Votes: {items[0].votes}
          </Typography>
          <Typography variant="h4">
            2: {items[1].name} Votes: {items[1].votes}
          </Typography>
          <Typography variant="h5">
            3: {items[2].name} Votes: {items[2].votes}
          </Typography>
        </Card>
      )}
    </>
  );
};

export default Section;
