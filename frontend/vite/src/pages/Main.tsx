import { Typography, Box } from "@mui/material";

const Main = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vh",
      }}
    >
      <Typography variant="h2">LeaderBoard:</Typography>
      <Typography variant="h3">
        1: {data[0].name} Votes: {data[0].votes}
      </Typography>
      <Typography variant="h4">
        2: {data[1].name} Votes: {data[1].votes}
      </Typography>
      <Typography variant="h5">
        3: {data[2].name} Votes: {data[2].votes}
      </Typography>
    </Box>
  );
};

const data = [
  { id: 1, name: "Prof Grah", votes: 100 },
  { id: 2, name: "Prof Shooby Doo", votes: 99 },
  { id: 3, name: "Prof shazam", votes: -100 },
];

export default Main;
