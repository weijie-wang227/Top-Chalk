import { Routes, Route, Link } from "react-router-dom";
import { Box, Drawer, IconButton, List, ListItemText, ListItemButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import Main from "./pages/Main";
import Faculty from "./pages/Faculty";
import Categories from "./pages/Categories";
import Vote from "./pages/Vote";
//import Topbar from "./components/Topbar";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

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
            <ListItemButton component={Link} to="/vote">
              <ListItemText primary="Vote" />
            </ListItemButton>
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
          <Route path="/vote" element={<Vote />} />
        </Routes>
      </Box>
    </Box>
  );
}
