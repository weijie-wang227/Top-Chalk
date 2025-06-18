import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import logo from "../assets/TopChalk.png";
import { useEffect } from "react";

interface WorstData {
  content: string;
  category: string;
  votes: number;
}

const Dashboard = () => {
  const [best, setBest] = useState<string[]>([]);
  const [pieData, setWorst] = useState<WorstData[]>([]);
  const [teacherId, setId] = useState(-1);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchId = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/request", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Auth error:", data.error);
          throw new Error("Not authenticated");
        }

        setId(data.userId); // This will trigger the next useEffect
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    fetchId();
  }, []);

  // Step 2: Once teacherId is set, fetch best/worst
  useEffect(() => {
    if (teacherId === -1) return;

    const fetchBest = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/bestCategories?id=${teacherId}`,
          {
            method: "GET",
            credentials: "include", // include session cookie
          }
        );
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error);
          throw new Error("Failed to fetchBest");
        }
        setBest(data.items);
      } catch (err: any) {
        console.log(err);
      }
    };

    const fetchWorst = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/worstCategories?id=${teacherId}`
        );
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
        const res = await fetch(
          `http://localhost:8080/getName?id=${teacherId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
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

    fetchName();

    fetchBest();
    fetchWorst();
  }, [teacherId]);

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
    <Box sx={{ p: 4, textAlign: "center", width: "90vw" }}>
      {/* TopChalk Intro */}
      <Box sx={{ mb: 5 }}>
        <img
          src={logo}
          alt="TopChalk Logo"
          style={{ height: 200, marginBottom: 16 }}
        />
        <Typography variant="h3" gutterBottom>
          Welcome {name}!
        </Typography>
      </Box>

      {/* Leaderboard */}
      <Typography variant="h4" gutterBottom>
        Your Best Traits
      </Typography>

      <Box className="bar-container">
        {best.length > 2 && (
          <div className="bar third">
            3
            <br />
            {best[2]}
          </div>
        )}
        {best.length > 0 && (
          <div className="bar first">
            {" "}
            1
            <br />
            {best[0]}
          </div>
        )}
        {best.length > 2 && (
          <div className="bar second">
            {" "}
            2
            <br />
            {best[1]}
          </div>
        )}
      </Box>

      <Typography variant="h3" gutterBottom sx={{ marginTop: 10 }}>
        These are some complaints your students have...
      </Typography>

      {pieData.length > 0 && (
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
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default Dashboard;
