"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaLayerGroup, FaBox, FaUserAstronaut, FaStar } from "react-icons/fa";
import DashboardCard from "@/components/layout/admin/DashboardCard";

interface DashboardData {
  totalUsers: number;
  totalCollectionTypes: number;
  totalCollections: number;
  totalCharacters: number;
  totalAttractions: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/api/admin/dashboard");
      setData(res.data.dashboard);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-6 text-black dark:text-black-100">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-black dark:text-black-100">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

        <DashboardCard
          title="Users"
          value={data?.totalUsers ?? 0}
          icon={<FaUsers />}
          color="bg-blue-500"
        />

        <DashboardCard
          title="Collection Types"
          value={data?.totalCollectionTypes ?? 0}
          icon={<FaLayerGroup />}
          color="bg-purple-500"
        />

        <DashboardCard
          title="Collections"
          value={data?.totalCollections ?? 0}
          icon={<FaBox />}
          color="bg-green-500"
        />

        <DashboardCard
          title="Characters"
          value={data?.totalCharacters ?? 0}
          icon={<FaUserAstronaut />}
          color="bg-yellow-500"
        />

        <DashboardCard
          title="Attractions"
          value={data?.totalAttractions ?? 0}
          icon={<FaStar />}
          color="bg-red-500"
        />

      </div>

    </div>
  );
}