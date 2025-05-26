import { AppBar, Typography, Button, Toolbar, Box } from "@mui/material";

const Topbar = () => {
  return (
    <AppBar position="fixed" sx={{ bgcolor: "white" }}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            component="a"
            variant="h5"
            href="/"
            sx={{ color: "darkblue" }}
          >
            Main
          </Typography>
          <Typography
            variant="h5"
            component="a"
            href="/categories"
            sx={{ color: "darkblue" }}
          >
            Categories
          </Typography>
          <Typography
            variant="h5"
            component="a"
            href="/faculty"
            sx={{ color: "darkblue" }}
          >
            Faculties
          </Typography>
          <Typography
            variant="h5"
            component="a"
            href="/vote"
            sx={{ color: "darkblue" }}
          >
            Vote
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
