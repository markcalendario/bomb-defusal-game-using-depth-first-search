import "../styles/main.scss";

export const metadata = {
  title: "Defuse Da Bomb",
  description:
    "Defuse Da Bomb: A Mini Game Implementation with Depth First Search Algorithm in Binary Tree"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
