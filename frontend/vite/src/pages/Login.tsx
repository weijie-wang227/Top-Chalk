import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Card,
  CardContent,
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
      navigate("/home");
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-2">
              TopChalk
            </h1>
            <p className="text-gray-600">Login in to start voting and competing</p>
          </div>

          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                sx={{
                  mb: 0,
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="subtitle2" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                Enter your details
              </Typography>
              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
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
                    <ToggleButton
                      value="student"
                      sx={{
                        flex: 1,
                        border: "black",
                        "&.Mui-selected": {
                          border: "2px solid #10B981",
                        },
                      }}
                    >
                      Student
                    </ToggleButton>

                    <ToggleButton
                      value="teacher"
                      sx={{
                        flex: 1,
                        border: "black",
                        "&.Mui-selected": {
                          border: "2px solid #10B981",
                        },
                      }}
                    >
                      Professor
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {failedLogins > 0 && (
                    <Typography color="error" variant="body2" textAlign="center">
                      Failed login attempts: {failedLogins}
                    </Typography>
                  )}

                  <Button className="w-full bg-gradient-to-r from-green-700 to-green-600"
                    type="submit"
                    variant="contained" fullWidth>
                    Login
                  </Button>

                  <Typography variant="body2" align="center">
                    Don't have an account?
                  </Typography>

                  <Button
                    className="w-full bg-gradient-to-r from-green-700 to-green-600"
                    type="button"
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};


export default Login



