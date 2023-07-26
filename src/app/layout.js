"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import "../styles/main.scss";

export const metadata = {
  title: "Defuse Da Bomb",
  description:
    "Defuse Da Bomb: A Mini Game Implementation with Depth First Search Algorithm in Binary Tree"
};

export default function RootLayout({ children }) {
  useEffect(() => {
    AOS.init({
      easing: "ease-out-back"
    });
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
