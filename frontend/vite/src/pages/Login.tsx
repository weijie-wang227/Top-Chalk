import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Container,
  Paper,
  Stack,
  Box
} from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [failedLogins, setFailed] = useState(0);
  const [mode, setMode] = useState("student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, mode }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      navigate("/");
    } else {
      console.log("Login failed");
      setFailed(failedLogins + 1);
    }
  };

  const handleToggle = (_: React.MouseEvent<HTMLElement>, newMode: string) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <Box
      sx={{
        mt: "40px",
        height: "calc(100vh - 40px)",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
        <form onSubmit={handleLogin}>
          <Stack spacing={3}>
            <Typography variant="h5" textAlign="center">
              Login
            </Typography>

            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleToggle}
              aria-label="user mode"
              fullWidth
              sx={{ justifyContent: "center" }}
            >
              <ToggleButton value="student">Student</ToggleButton>
              <ToggleButton value="teacher">Professor</ToggleButton>
            </ToggleButtonGroup>

            {failedLogins > 0 && (
              <Typography color="error" variant="body2" textAlign="center">
                Failed login attempts: {failedLogins}
              </Typography>
            )}

            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
            <Typography variant="body2" align="center">
              Don't have an account?
            </Typography>
            <Button type="submit" variant="contained" fullWidth>
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
