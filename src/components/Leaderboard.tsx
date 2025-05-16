import React from "react";
import LeaderboardTable from "./Leaderboard/LeaderboardTable";

const Leaderboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <LeaderboardTable />
    </div>
  );
};

export default Leaderboard; 