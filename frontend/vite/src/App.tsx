import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Main from "./pages/Main";
import Faculty from "./pages/Faculty";
import Categories from "./pages/Categories";
import Vote from "./pages/Vote";
import Topbar from "./components/Topbar";

export default function App() {
  return (
    <Box>
      <Topbar></Topbar>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/vote" element={<Vote />} />
      </Routes>
    </Box>
  );
}
