import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

const Login = () => {
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
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      useNavigate()("/");
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
    <>
      <TextField
        value={username}
        onChange={(e) => setName(e.target.value)}
      ></TextField>
      <TextField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      ></TextField>
      <Button onClick={handleLogin}>Login</Button>
      {failedLogins > 0 && (
        <Typography color="error">
          Failed login attempts: {failedLogins}
        </Typography>
      )}
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleToggle}
        aria-label="change-mode"
      >
        <ToggleButton value="monthly" aria-label="student">
          Login as Student
        </ToggleButton>
        <ToggleButton value="yearly" aria-label="professor">
          Login as Professor
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
};
export default Login;
