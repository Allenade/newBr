import { Card } from "@/components/ui/card";

export function WelcomeHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back to your admin panel</p>
      </div>
      <div className="flex items-center gap-4">
        <Card className="p-2 px-4 flex items-center gap-2 bg-green-50">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-700">
            System Online
          </span>
        </Card>
      </div>
    </div>
  );
}
