"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    router.replace(isMobile ? "/inventory" : "/dashboard");
  }, [router]);

  return null;
}
