import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Button } from "@mui/material";
import logo from "../assets/logo.svg";
import "./Main.css";

const data = [
  { id: 1, name: "Prof Grah", votes: 100 },
  { id: 2, name: "Prof Shooby Doo", votes: 99 },
  { id: 3, name: "Prof Shazam", votes: -100 },
];

const Main = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      {/* TopChalk Intro */}
      <Box sx={{ mb: 5 }}>
        <img src={logo} alt="TopChalk Logo" style={{ height: 200, marginBottom: 16 }} />
        <Typography variant="h3" gutterBottom>
          Welcome to TopChalk
        </Typography>
        <Typography variant="h4" color="text.secondary">
          TopChalk celebrates great teaching. Vote for the professors who inspire you and help them climb the leaderboard.
          Your voice turns recognition into legacy — one vote at a time.
        </Typography>
      </Box>

      {/* Leaderboard */}
      <Typography variant="h4" gutterBottom>
        🏆 Grand Leaderboard
      </Typography>
      <Box className="bar-container">
        <div className="bar third">
          3<br />
          {data[2].name}<br />
          {data[2].votes}
        </div>
        <div className="bar first">
          1<br />
          {data[0].name}<br />
          {data[0].votes}
        </div>
        <div className="bar second">
          2<br />
          {data[1].name}<br />
          {data[1].votes}
        </div>
      </Box>

      {/* Vote Button */}
      <Box sx={{ mt: 6 }}>
        <Button variant="contained" size="large" onClick={() => navigate("/vote")}>
          Vote to see your favourite prof up here
        </Button>
      </Box>
    </Box>
  );
};

export default Main;