interface ActivityItemProps {
  user: string;
  email: string;
  action: string;
  time: string;
  status: "success";
}

export function ActivityItem({ user, email, action, time }: ActivityItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          </div>
          <div>
            <p className="font-medium">{user}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>
    </div>
  );
}
