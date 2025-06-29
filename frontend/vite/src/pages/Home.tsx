import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, Box, Paper } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

interface Data {
  userId: number;
  mode: string;
  username: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState<Data>({
    userId: -1,
    mode: "",
    username: "Loading...",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [contestStatus, setContestStatus] = useState({
    active: true,
    timeLeft: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/request", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Not authenticated");
        setIsAuthenticated(res.ok);
        setInfo(data);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    const getTimeUntilCutoff = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();

      let target = new Date(now);

      if (day === 0 && hours < 19) {
        target.setHours(19, 0, 0, 0);
      } else if (day === 0 && hours >= 19) {
        target.setDate(target.getDate() + 1);
        target.setHours(18, 0, 0, 0);
      } else {
        const daysToSunday = (7 - day) % 7;
        target.setDate(now.getDate() + daysToSunday);
        target.setHours(19, 0, 0, 0);

        if (daysToSunday === 0 && hours >= 19) {
          target.setDate(target.getDate() + 1);
          target.setHours(18, 0, 0, 0);
        }
      }

      const diffMs = target.getTime() - now.getTime();
      const seconds = Math.floor((diffMs / 1000) % 60);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const hoursLeft = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      return `${days}d ${hoursLeft}h ${minutes}m ${seconds}s`;
    };

    checkAuth();

    const updateTime = () => {
      const timeLeft = getTimeUntilCutoff();
      setContestStatus({ active: true, timeLeft });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <EmojiEventsIcon fontSize="large" color="warning" />,
      title: "Grand Leaderboard",
      description: "See top professors across all faculties",
    },
    {
      icon: <GroupIcon fontSize="large" color="primary" />,
      title: "Faculty Competition",
      description: "Interfaculty battles based on participation",
    },
    {
      icon: <EmojiEmotionsIcon fontSize="large" color="secondary" />,
      title: "Category Rankings",
      description: "Helpful, Funny, Inspiring, and more",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome {isAuthenticated && info.username}{" "}
          </h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Rate Your Professors, Win the Week!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TopChalk brings gamification to professor feedback. Vote for your
            favorite educators, compete in weekly contests, and help build a
            better academic community.
          </p>
        </div>

        {contestStatus.active ? (
          <Paper
            elevation={3}
            className="mb-12 bg-gradient-to-r from-orange-50 to-yellow-50 p-4"
          >
            <div className="text-center mb-2">
              <div className="flex justify-center items-center space-x-2 text-orange-800">
                <HowToVoteIcon />
                <span className="font-medium">Weekly Contest Active!</span>
              </div>
              <Typography variant="body2" className="text-orange-700">
                Voting is now open. Cast your votes before the timer runs out!
              </Typography>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 inline-block">
                <Typography
                  variant="h4"
                  className="text-orange-600 mb-1 font-bold"
                >
                  {contestStatus.timeLeft}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Time Remaining
                </Typography>
              </div>
            </div>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            className="mb-12 bg-gradient-to-r from-orange-50 to-yellow-50 p-4"
          >
            <div className="text-center mb-2">
              <div className="flex justify-center items-center space-x-2 text-orange-800">
                <HowToVoteIcon />
                <span className="font-large">Contest not active</span>
              </div>
            </div>
          </Paper>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 text-center p-4"
            >
              <Box className="flex flex-col items-center">
                <div className="mb-2">{feature.icon}</div>
                <Typography variant="h6" className="mb-1">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {feature.description}
                </Typography>
              </Box>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300 p-4"
            onClick={() => navigate("/leaderboards")}
          >
            <Box className="flex items-center space-x-2 mb-1">
              <EmojiEventsIcon color="warning" />
              <Typography variant="subtitle1">View Leaderboards</Typography>
            </Box>
            <Typography variant="body2" className="text-gray-600">
              Check out the current rankings and see who's leading
            </Typography>
          </Card>

          {info.mode == "student" ? (
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 p-4"
              onClick={() => navigate("/vote")}
            >
              <Box className="flex items-center space-x-2 mb-1">
                <HowToVoteIcon color="primary" />
                <Typography variant="subtitle1">Cast Your Vote</Typography>
              </Box>
              <Typography variant="body2" className="text-gray-600">
                Vote for your favorite professors in different categories
              </Typography>
            </Card>
          ) : (
            info.mode == "teacher" && (
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow duration-300 p-4"
                onClick={() => navigate("/dashboard")}
              >
                <Box className="flex items-center space-x-2 mb-1">
                  <AccountBoxIcon color="primary" />
                  <Typography variant="subtitle1">Go to Dashboard</Typography>
                </Box>
                <Typography variant="body2" className="text-gray-600">
                  Find out about feedback from your students
                </Typography>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
