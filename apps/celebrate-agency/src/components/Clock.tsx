"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [time, setTime] = useState<string>("— : —");

  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
      });
      setTime(`${t} KST`);
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <>{time}</>;
}
