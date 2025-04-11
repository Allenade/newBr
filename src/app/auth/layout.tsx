"use client";

import React, { FC } from "react";
import Image from "next/image";
import AuthBgImg from "@/assets/images/auth-bg.jpg";

type LayoutProps = {
  children: React.ReactNode;
};

const AuthLayout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] grid grid-cols-7 gap-5">
      {/* ####################################### */}
      {/* -- Image section --> */}
      {/* ####################################### */}
      <aside className="hidden col-span-3 w-full h-full lg:flex items-center justify-center">
        <div className="w-full h-[98%] ml-2 rounded-lg relative overflow-hidden bg-blend-overlay">
          <div className="w-full h-full absolute top-0 left-0 z-10 bg-black opacity-25" />
          <Image
            fill
            src={AuthBgImg}
            alt="auth-bg-img"
            className="object-cover object-center"
          />
        </div>
      </aside>

      {/* ####################################### */}
      {/* -- Main section --> */}
      {/* ####################################### */}
      <main className="col-span-8 lg:col-span-4 w-full h-full flex">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
