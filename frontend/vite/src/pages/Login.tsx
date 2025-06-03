import { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";

const Login = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [failedLogins, setFailed] = useState(0);

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
    } else {
      console.log("Login failed");
      setFailed(failedLogins + 1);
    }
  };

  const submit = () => {};
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
    </>
  );
};
export default Login;
