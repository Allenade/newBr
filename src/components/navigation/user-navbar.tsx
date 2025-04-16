"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const UserNavBar = () => {
  return (
    <div className="z-10 flex h-[var(--header-height)] items-center gap-4 border-b bg-background p-4 md:px-8">
      <div className="flex items-center">
        <SidebarTrigger className="w-5 h-5" />
      </div>
    </div>
  );
};

export default UserNavBar;
