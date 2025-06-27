import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Card,
  CardContent,
} from "@mui/material";

const Register = () => {
  const navigate = useNavigate();
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("student");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, mode }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      navigate("/login");
    } else {
      console.log("Registration failed");
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
            <p className="text-gray-600">Register to start voting and competing</p>
          </div>

          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                sx={{ mb: 0, fontFamily: 'Poppins, sans-serif' }}
              >
                Create an Account
              </Typography>
              <Typography
                variant="subtitle2"
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Enter your details below
              </Typography>

              <form onSubmit={handleRegister}>
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
                        border: "1px solid black",
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
                        border: "1px solid black",
                        "&.Mui-selected": {
                          border: "2px solid #10B981",
                        },
                      }}
                    >
                      Professor
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    className="bg-gradient-to-r from-green-700 to-green-600"
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

export default Register;