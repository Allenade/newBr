"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const UserAccount = () => {
  const router = useRouter();

  const handleNewDeposit = () => {
    router.push("/user/dashboard/deposits");
  };

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={handleNewDeposit}
      >
        New Deposit
      </Button>
    </div>
  );
};
