import logo from "../assets/TopChalk.png";
import "./Main.css";
import { useState } from "react";
import { useEffect } from "react";

interface Teacher {
  id: number;
  name: string;
  votes: number;
}

const Main = () => {
  const [data, setData] = useState<Teacher[] | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("https://top-chalk-659279002644.asia-southeast1.run.app/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const leaderboardData: Teacher[] = await res.json();
        setData(leaderboardData);
      } catch (err: any) {
        console.log("Failed to load:" + err);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo & Intro */}
        <div className="text-center mb-12">
          <img
            src={logo}
            alt="TopChalk Logo"
            className="mx-auto mb-6"
            style={{ height: 200 }}
          />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to TopChalk
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TopChalk celebrates great teaching. Vote for the professors who
            inspire you and help them climb the leaderboard. Your voice turns
            recognition into legacy — one vote at a time.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-amber-600 mb-2">
            🏆 Grand Leaderboard
          </h2>
          <p className="text-lg text-gray-700">
            Based on the most upvoted professors across all faculties
          </p>
        </div>

        {data && data.length >= 3 && (
          <div className="relative flex justify-center items-end h-[400px] gap-12">
            {/* 2nd Place */}
            <div className="flex flex-col items-center justify-end">
              <div className="bg-slate-200 text-gray-800 rounded-t-lg w-32 h-52 flex flex-col justify-center items-center shadow-md hover:shadow-lg transition">
                <span className="text-2xl font-semibold">2️⃣</span>
                <span className="font-medium mt-3 text-lg">{data[1].name}</span>
                <span className="text-base text-gray-600">
                  {data[1].votes} votes
                </span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center justify-end">
              <div className="bg-yellow-300 text-yellow-900 rounded-t-lg w-40 h-72 flex flex-col justify-center items-center shadow-lg hover:shadow-2xl transition transform scale-110">
                <span className="text-4xl font-bold">🥇</span>
                <span className="font-bold mt-3 text-xl">{data[0].name}</span>
                <span className="text-base text-yellow-800">
                  {data[0].votes} votes
                </span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center justify-end">
              <div className="bg-orange-100 text-orange-800 rounded-t-lg w-28 h-44 flex flex-col justify-center items-center shadow-md hover:shadow-lg transition">
                <span className="text-2xl font-semibold">3️⃣</span>
                <span className="font-medium mt-3 text-lg">{data[2].name}</span>
                <span className="text-base text-gray-600">
                  {data[2].votes} votes
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
