import { Routes, Route, Link } from "react-router-dom";
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
import Main from "./pages/Main";
import Faculty from "./pages/Faculty";
import Categories from "./pages/Categories";
import Upvote from "./pages/Upvote";
import Downvote from "./pages/Downvote";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
//import Topbar from "./components/Topbar";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("None");

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/request", {
        method: "GET",
        credentials: "include", // include session cookie
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Auth error:", data.error);
        throw new Error("Not authenticated");
      }
      setMode(data.mode);
    } catch (err) {
      console.error("Auth check failed:", err);
      setMode("None");
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("http://localhost:8080/logout", {
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

  useEffect(() => {
    checkAuth();
    console.log("update");
  }, [drawerOpen]);

  return (
    <Box display="flex" height="100vh">
      <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box width={240} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="Main" />
            </ListItemButton>
            <ListItemButton component={Link} to="/categories">
              <ListItemText primary="Categories" />
            </ListItemButton>
            <ListItemButton component={Link} to="/faculty">
              <ListItemText primary="Faculties" />
            </ListItemButton>
            {mode == "student" && (
              <>
                <ListItemButton component={Link} to="/upvote">
                  <ListItemText primary="Upvote" />
                </ListItemButton>
                <ListItemButton component={Link} to="/downvote">
                  <ListItemText primary="Downvote" />
                </ListItemButton>
              </>
            )}
            {mode == "teacher" && (
              <ListItemButton component={Link} to="/dashboard">
                <ListItemText primary="Dashboard" />
              </ListItemButton>
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
        <IconButton onClick={toggleDrawer(true)} sx={{ m: 2 }}>
          <MenuIcon />
        </IconButton>

        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/categories" element={<Categories />} />
          {mode == "student" && (
            <>
              <Route path="/upvote" element={<Upvote />} />
              <Route path="/downvote" element={<Downvote />} />
            </>
          )}
          {mode == "None" && (
            <>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </>
          )}
          {mode == "teacher" && (
            <Route path="dashboard" element={<Dashboard />} />
          )}
        </Routes>
      </Box>
    </Box>
  );
}
