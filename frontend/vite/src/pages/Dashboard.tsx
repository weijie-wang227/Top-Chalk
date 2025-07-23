import {
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;

interface WorstData {
  content: string;
  category: string;
  votes: number;
}

const Dashboard = () => {
  const [best, setBest] = useState<string[]>([]);
  const [pieData, setWorst] = useState<WorstData[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setAvatarUrl] = useState("");

  const { id, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth(); // runs auth check
  }, []);

  // Step 2: Once id is set, fetch best/worst
  useEffect(() => {
    if (id === -1) return;

    const fetchBest = async () => {
      try {
        const res = await fetch(`${API}/bestCategories?id=${id}`, {
          method: "GET",
          credentials: "include", // include session cookie
        });
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error);
          throw new Error("Failed to fetchBest");
        }
        setBest(data.items);
        console.log(best);
      } catch (err: any) {
        console.log(err);
      }
    };

    const fetchWorst = async () => {
      try {
        const res = await fetch(`${API}/worstCategories?id=${id}`);
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error);
          throw new Error("Failed to fetchBest");
        }
        setWorst(data);
      } catch (err: any) {
        console.log("Failed to load worst:", err);
      }
    };
    const fetchName = async () => {
      try {
        const res = await fetch(`${API}/getName?id=${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error);
          throw new Error("Failed to fetchName");
        }

        setName(data.name);
      } catch (err) {
        console.error("Error fetching name:", err);
      }
    };
    const fetchUrl = async () => {
      try {
        const res = await fetch(`${API}/avatarUrl?id=${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Avatar error:", data.error);
          throw new Error("Cannot fetch avatar Url");
        }

        setAvatarUrl(data.url); // This will trigger the next useEffect
      } catch (err) {
        console.error("fetch Url failed:", err);
      }
    };

    fetchUrl();
    fetchName();
    fetchBest();
    fetchWorst();
  }, [id]);

  const handleEdit = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("image", file); // assume file is from <input type="file" />
      const res = await fetch(`${API}/uploadAvatar`, {
        method: "POST",
        credentials: "include",
        body: formData, // browser will set correct headers automatically
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        throw new Error("Failed to change image");
      }
      if (data.url) {
        setAvatarUrl(data.url); // Update avatar UI
      } else {
        console.log("avatar not set");
      }
    };
    fileInput.click();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div
          style={{
            background: "#fff",
            padding: "8px",
            border: "1px solid #ccc",
          }}
        >
          <Typography color="black"> {payload[0].name}</Typography>
        </div>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        textAlign: "center",
        width: "100%",
        maxWidth: 960,
        mx: "auto",
      }}
    >
      {/* Logo and Avatar */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            width: 120,
            height: 120,
          }}
        >
          <MuiTooltip title="User Avatar">
            <Avatar
              src={imageUrl}
              alt="Profile"
              sx={{
                width: "100%",
                height: "100%",
                border: "2px solid #ccc",
                bgcolor: imageUrl ? "transparent" : "grey.300",
                fontSize: "2rem",
              }}
            >
              {!imageUrl && name?.charAt(0)}
            </Avatar>
          </MuiTooltip>

          <MuiTooltip title="Edit Avatar">
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "white",
                boxShadow: 1,
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </MuiTooltip>
        </Box>

        <Typography variant="h3" gutterBottom sx={{ mt: 2 }}>
          Welcome {name}!
        </Typography>
      </Box>

      {/* Top Traits */}
      {best ? (
        <Typography variant="h4" gutterBottom>
          Your Best Traits
        </Typography>
      ) : (
        <Typography variant="h4" gutterBottom>
          Get more people to vote for you!
        </Typography>
      )}

      {best && (
        <Box className="bar-container" sx={{ mt: 3, mb: 6 }}>
          {best.length > 2 && (
            <div className="bar third">
              3
              <br />
              {best[2]}
            </div>
          )}
          {best.length > 0 && (
            <div className="bar first">
              1
              <br />
              {best[0]}
            </div>
          )}
          {best.length > 2 && (
            <div className="bar second">
              2
              <br />
              {best[1]}
            </div>
          )}
        </Box>
      )}

      {/* Complaints Pie Chart */}
      {pieData && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 8, mb: 4 }}>
            These are some complaints your students have...
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="votes"
                nameKey="content"
                cx="50%"
                cy="50%"
                outerRadius="90%"
                fill="#8884d8"
                label={({ payload }) => payload.category}
              />
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
