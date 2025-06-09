import { Card, Typography } from "@mui/material";
interface CategoryProps {
  title: string;
  items?:
    | {
        name: string;
        votes: number;
      }[];
}

const variants = ["h3", "h4", "h5"] as const;

const Section = ({ title, items }: CategoryProps) => {
  return (
    <>
      {items && items.length > 0 && (
        <Card sx={{ p: 2, my: 2 }}>
          <Typography variant="h2">{title}</Typography>
          {items.slice(0, 3).map((prof, index) => (
            <Typography key={title + prof.name} variant={variants[index]}>
              {index + 1}: {prof.name} Votes: {prof.votes}
            </Typography>
          ))}
        </Card>
      )}
    </>
  );
};

export default Section;
