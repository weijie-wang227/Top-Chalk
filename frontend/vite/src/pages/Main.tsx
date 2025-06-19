import { useNavigate } from "react-router-dom";
import { Typography, Box, Button } from "@mui/material";
import logo from "../assets/TopChalk.png";
import "./Main.css";
import { useState } from "react";
import { useEffect } from "react";

interface Teacher {
  id: number;
  name: string;
  votes: number;
}

const Main = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<Teacher[] | null>(null);

  const [username, setUsername] = useState("");

  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/request", {
        method: "GET",
        credentials: "include", // include session cookie
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        console.error("Auth error:", data.error);
        throw new Error("Not authenticated");
      }
      setUsername(data.username);
    } catch (err) {
      console.error("Auth check failed:", err);
      setUsername("");
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:8080/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const leaderboardData: Teacher[] = await res.json();
        setData(leaderboardData);
        checkAuth();
      } catch (err: any) {
        console.log("Failed to load:" + err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      {/* Username Top Right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
        }}
      >
        {username && (
          <Typography variant="subtitle1" color="text.secondary">
            Welcome <strong>{username}</strong>
          </Typography>
        )}
      </Box>

      {/* TopChalk Intro */}
      <Box sx={{ mb: 5 }}>
        <img
          src={logo}
          alt="TopChalk Logo"
          style={{ height: 200, marginBottom: 16 }}
        />
        <Typography variant="h3" gutterBottom>
          Welcome to TopChalk
        </Typography>
        <Typography variant="h4" color="text.secondary">
          TopChalk celebrates great teaching. Vote for the professors who
          inspire you and help them climb the leaderboard. Your voice turns
          recognition into legacy — one vote at a time.
        </Typography>
      </Box>

      {/* Leaderboard */}
      <Typography variant="h4" gutterBottom>
        🏆 Grand Leaderboard
      </Typography>
      {data && data.length >= 3 && (
        <Box className="bar-container">
          <div className="bar third">
            3<br />
            {data[2].name}
            <br />
            {data[2].votes}
          </div>
          <div className="bar first">
            1<br />
            {data[0].name}
            <br />
            {data[0].votes}
          </div>
          <div className="bar second">
            2<br />
            {data[1].name}
            <br />
            {data[1].votes}
          </div>
        </Box>
      )}
    </Box>
  );
};

export default Main;
