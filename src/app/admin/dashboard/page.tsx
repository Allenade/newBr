"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign } from "lucide-react";
import { StatsCard } from "@/app/admin/adminComponent/StatsCard";
import { ActivityItem } from "@/app/admin/adminComponent/ActivityItem";
import { WelcomeHeader } from "@/app/admin/adminComponent/WelcomeHeader";
import { supabase } from "@/lib/supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";

type StatType = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: typeof Users | typeof BarChart3 | typeof DollarSign;
  description: string;
};

interface RecentUserType {
  user: string;
  email: string;
  action: string;
  time: string;
  status: "success";
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
}

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTrades, setTotalTrades] = useState("0");
  const [totalVolume, setTotalVolume] = useState("$0");
  const [loading, setLoading] = useState(true);
  const [recentRegistrations, setRecentRegistrations] = useState<
    RecentUserType[]
  >([]);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_dashboard_stats");

        if (error) {
          throw error;
        }

        if (data) {
          setTotalUsers(data.total_users || 0);
          // Transform recent users data to match the UI format
          if (data.recent_users) {
            const formattedUsers = data.recent_users.map((user: any) => ({
              user: "New User",
              email: user.email,
              action: "Just Registered",
              time: formatRelativeTime(new Date(user.created_at)),
              status: "success" as const,
            }));
            setRecentRegistrations(formattedUsers);
          }
        }

        // Set default values for trades and volume
        setTotalTrades("0");
        setTotalVolume("$0");
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase, toast]);

  const stats: StatType[] = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
      description: "Registered users in the system",
    },
    {
      title: "Total Trades",
      value: totalTrades,
      change: "+18.2%",
      trend: "up",
      icon: BarChart3,
      description: "All time completed trades",
    },
    {
      title: "Total Volume",
      value: totalVolume,
      change: "-4.5%",
      trend: "down",
      icon: DollarSign,
      description: "Trading volume this month",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeHeader />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Registrations</h2>
          <Button variant="outline" size="sm" className="text-xs">
            View All Users
            <Users className="h-4 w-4 ml-2" />
          </Button>
        </div>
        <Card>
          <div className="divide-y divide-gray-100">
            {recentRegistrations.length > 0 ? (
              recentRegistrations.map((registration, index) => (
                <ActivityItem key={index} {...registration} />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No recent registrations
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
