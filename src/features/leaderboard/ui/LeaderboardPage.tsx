import React from "react";
import Layout from "@/components/common/Layout";
import { LeaderboardTable } from "./LeaderboardTable";

const LeaderboardPage = () => (
  <Layout title="Leaderboard">
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <LeaderboardTable />
    </div>
  </Layout>
);

export default LeaderboardPage; 