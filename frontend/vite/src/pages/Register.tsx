import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Box
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
            <form onSubmit={handleRegister}>
                <Stack spacing={3}>
                    <Typography variant="h5" textAlign="center">
                        Register
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

                    <Button type="submit" variant="contained" fullWidth>
                        Register
                    </Button>
                </Stack>
            </form>
        </Box>
    )
}

export default Register