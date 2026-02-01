import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/HomeSections/Header/Navbar.tsx";
// import { Toaster } from "sonner";
import { ClientProviders } from "./components/ClientProvider";
// import { SessionProvider } from "next-auth/react";
import  SessionWrapper  from "./components/SessionWrapper";
// import useSocket from "../app/hooks/useSocket";
// import { useSession } from "next-auth/react";

const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
});

const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
});

export const metadata: Metadata = {
     title: "Zuno",
     description: "Peer to Peer Social Connecting App",
     icons: {
          icon: '/favicon.ico',
          shortcut: '/favicon.ico',
          apple: '/favicon.ico',
     }
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     //   const { data: session } = useSession();
     // const userId = session?.user?.id;
     //   useSocket(userId);
     return (
          <html lang="en">
               <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    <SessionWrapper>
                         <ClientProviders>
                              <div className="bg-[#0f1729] text-foreground">
                                   <Navbar />
                              </div>
                              {children}
                         </ClientProviders>
                    </SessionWrapper>
               </body>
          </html>
     );
}
