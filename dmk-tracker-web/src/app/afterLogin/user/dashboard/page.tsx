"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type DashboardData = {
  characters: {
    totalCharacters: number;
    totalOwned: number;
    totalMaxed: number;
    totalMissing: number;
    remainingLevelTime: string;
  };
  attractions: {
    totalAttractions: number;
    totalOwned: number;
    totalMaxed: number;
    totalMissing: number;
    remainingLevelTime: string;
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboard = async () => {
    const res = await fetch("/api/user/dashboard", {
      credentials: "include",
    });

    const data = await res.json();

    if (data?.dashboard) {
      setData(data.dashboard);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <div className="p-10 text-black dark:text-black-100">Loading Dashboard...</div>;

  const characterPercent =
    (data.characters.totalOwned / data.characters.totalCharacters) * 100;

  const attractionPercent =
    (data.attractions.totalOwned / data.attractions.totalAttractions) * 100;

  const characterChart = [
    { name: "Owned", value: data.characters.totalOwned },
    { name: "Missing", value: data.characters.totalMissing },
  ];

  const attractionChart = [
    { name: "Owned", value: data.attractions.totalOwned },
    { name: "Missing", value: data.attractions.totalMissing },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="p-8 space-y-10">

      <h1 className="text-3xl font-bold text-black dark:text-black-100">DMK Progress Dashboard</h1>

      {/* OVERVIEW */}
      <div className="grid md:grid-cols-4 gap-6">

        <StatCard
          title="Characters Owned"
          value={data.characters.totalOwned}
        />

        <StatCard
          title="Max Level Characters"
          value={data.characters.totalMaxed}
        />

        <StatCard
          title="Remaining Character Time"
          value={data.characters.remainingLevelTime}
        />

        <StatCard
          title="Missing Characters"
          value={data.characters.totalMissing}
        />

        <StatCard
          title="Attractions Owned"
          value={data.attractions.totalOwned}
        />

        <StatCard
          title="Max Level Attractions"
          value={data.attractions.totalMaxed}
        />

        <StatCard
          title="Remaining Attraction Time"
          value={data.attractions.remainingLevelTime}
        />

        <StatCard
          title="Missing Attractions"
          value={data.attractions.totalMissing}
        />

      </div>

      {/* COLLECTION CHARTS */}
      <div className="grid md:grid-cols-2 gap-10">

        <ChartCard title="Character Collection">
          <PieGraph data={characterChart} colors={COLORS} />
        </ChartCard>

        <ChartCard title="Attraction Collection">
          <PieGraph data={attractionChart} colors={COLORS} />
        </ChartCard>

      </div>

      {/* PROGRESS BARS */}
      <div className="space-y-6">

        <ProgressBar
          title="Character Completion"
          percent={characterPercent}
        />

        <ProgressBar
          title="Attraction Completion"
          percent={attractionPercent}
        />

      </div>

      {/* ACHIEVEMENTS */}
      <div className="grid md:grid-cols-3 gap-6">

       {/* <AchievementCard
          title="Missing Characters"
          value={data.characters.totalMissing}
        />

        <AchievementCard
          title="Missing Attractions"
          value={data.attractions.totalMissing}
        />*/}

      </div>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2 text-black dark:text-black-100">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.8)] ">
      <h2 className="font-semibold mb-4 text-black dark:text-black-100">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  );
}

function PieGraph({ data, colors }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" outerRadius={90} label>
          {data.map((entry: any, index: number) => (
            <Cell key={index} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ProgressBar({ title, percent }: any) {
  return (
    <div>
      <div className="flex justify-between mb-1 text-black dark:text-black-100">
        <span>{title}</span>
        <span>{Math.round(percent)}%</span>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className="bg-green-500 h-3 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function AchievementCard({ title, value }: any) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
      <p className="text-yellow-600 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}