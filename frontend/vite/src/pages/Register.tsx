import { useEffect, useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

const API = import.meta.env.VITE_API_BASE_URL;

interface Data {
  id: number;
  name: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("student");
  const [allFaculties, setAllFaculties] = useState<Data[]>([]);
  const [faculty, setFaculty] = useState(-1);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch(`${API}/faculties`);

        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data: Data[] = await res.json();
        setAllFaculties(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchFaculties();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, mode, faculty }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      navigate("/login");
    } else {
      const errorData = await response.json();

      if (response.status === 409) {
        console.log("Registration failed");
        console.log(errorData);
        alert(errorData.error);
      } else {
        console.log(
          "Registration failed:",
          errorData.message || "Unknown error"
        );
        alert(errorData.message || "Something went wrong");
      }
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
            <p className="text-gray-600">
              Register to start voting and competing
            </p>
          </div>

          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                sx={{ mb: 0, fontFamily: "Poppins, sans-serif" }}
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
                        border: "1px solid white",
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
                        border: "1px solid white",
                        "&.Mui-selected": {
                          border: "2px solid #10B981",
                        },
                      }}
                    >
                      Professor
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {/* Faculty Dropdown (only show if user selects 'teacher') */}
                  {mode === "teacher" && (
                    <FormControl fullWidth>
                      <InputLabel>Faculty</InputLabel>
                      <Select
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        label="Faculty"
                      >
                        {allFaculties &&
                          allFaculties.map((fac: Data) => (
                            <MenuItem key={fac.id} value={fac.id}>
                              {fac.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}

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
