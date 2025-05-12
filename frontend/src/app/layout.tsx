import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "AgentDesk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow p-4 flex space-x-6">
          <Link href="/agents" className="hover:underline">Agents</Link>
          <Link href="/logs" className="hover:underline">Logs</Link>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}