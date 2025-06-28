import { useState } from "react";
import { Tabs, Tab, Box, Typography, Paper } from "@mui/material";

import Main from "./Main"; // Grand Leaderboard
import Faculties from "./Faculties"; // Faculty Rankings
import Categories from "./Categories"; // Category Rankings

const tabLabels = [
  { label: "Grand Leaderboard", icon: "🏆" },
  { label: "Faculty Rankings", icon: "🧑‍🏫" },
  { label: "Category Rankings", icon: "🎭" },
];

const Leaderboards = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ mb: 3, p: 2, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold">
          📊 Leaderboards
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Explore the top professors across different categories
        </Typography>
      </Paper>

      <Tabs
        value={tabIndex}
        onChange={handleChange}
        centered
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        {tabLabels.map((tab, idx) => (
          <Tab key={idx} label={`${tab.icon} ${tab.label}`} />
        ))}
      </Tabs>

      <Box sx={{ mt: 4 }}>
        {tabIndex === 0 && <Main />}
        {tabIndex === 1 && <Faculties />}
        {tabIndex === 2 && <Categories />}
      </Box>
    </Box>
  );
};

export default Leaderboards;
