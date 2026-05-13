"use client";

import dynamic from "next/dynamic";
import React from "react";

const ImmersiveBackground = dynamic(() => import("@/components/ImmersiveBackground"), {
  ssr: false,
});

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImmersiveBackground />
      {children}
    </>
  );
}
