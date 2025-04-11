"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import React from "react";

type ComponentProps = {};

const UserNavBar = () => {
  return (
    <div className="z-10 flex h-[var(--header-height)] items-center gap-4 border-b bg-background p-4 md:px-8">
      <div className="flex items-center space-x-3 w-full max-w-lg">
        <SidebarTrigger className="w-5 h-5" />

        <div className="relative w-full sm:max-w-sm items-center flex">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-2 text-muted-foreground"
          />
          <Input placeholder="Search organisations" className="w-full pl-9" />
        </div>
      </div>
    </div>
  );
};

export default UserNavBar;
