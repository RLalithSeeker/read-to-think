import "./globals.css";

export const metadata = {
  title: "Read to Think",
  description:
    "A different kind of reading companion. Don't summarize — let the book challenge you. Built on Adler, Luhmann, and cognitive science.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen relative">
        {/* glow orbs — ported 1:1 */}
        <div
          className="gl"
          style={{ width: 500, height: 500, background: "#C8965A", top: -100, left: -100, opacity: 0.025 }}
        />
        <div
          className="gl"
          style={{ width: 400, height: 400, background: "#7B9A6B", bottom: -50, right: -50, opacity: 0.02 }}
        />
        {children}
      </body>
    </html>
  );
}
