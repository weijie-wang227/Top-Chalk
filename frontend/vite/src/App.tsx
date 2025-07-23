import { Routes, Route, Link, Navigate } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import Leaderboards from "./pages/Leaderboards";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfessorPage from "./pages/ProfessorPage";
import Vote from "./pages/Vote";
import Home from "./pages/Home";
import KudosBoard from "./pages/Kudos";
import { useAuth } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const API = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const { mode, checkAuth, setMode } = useAuth();

  useEffect(() => {
    checkAuth(); // runs auth check
  }, []);

  const logout = async () => {
    setMode("None");
    try {
      const res = await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        console.log("Logged out successfully");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box width={240} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/leaderboards">
              <ListItemText primary="Leaderboards" />
            </ListItemButton>
            {mode == "student" && (
              <>
                <ListItemButton component={Link} to="/vote">
                  <ListItemText primary="Vote" />
                </ListItemButton>
              </>
            )}
            {mode == "teacher" && (
              <>
                <ListItemButton component={Link} to="/dashboard">
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to="/kudos">
                  <ListItemText primary="Kudos Board" />
                </ListItemButton>
              </>
            )}

            {mode == "None" ? (
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            ) : (
              <ListItemButton onClick={logout} component={Link} to="/login">
                <ListItemText primary="Logout" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
      <Box component="main" flexGrow={1} sx={{ height: "100vh" }}>
        {!drawerOpen && (
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1300, // higher than drawer
              backgroundColor: "white",
              borderRadius: 1,
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboards" element={<Leaderboards />} />

          <Route
            path="/vote"
            element={
              <ProtectedRoute allowedModes={["student"]}>
                <Vote />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <ProtectedRoute allowedModes={["None"]}>
                <Login />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              <ProtectedRoute allowedModes={["None"]}>
                <Register />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedModes={["teacher"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kudos"
            element={
              <ProtectedRoute allowedModes={["teacher"]}>
                <KudosBoard />
              </ProtectedRoute>
            }
          />

          <Route path="/professor/:id" element={<ProfessorPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
