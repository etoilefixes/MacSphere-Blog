
import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';
import { NavigationBar } from '@/components/NavigationBar';
import { DynamicWallpaper } from '@/components/DynamicWallpaper';
// import { ColorSchemeUpdater } from '@/components/ColorSchemeUpdater'; // Removed
import { Toaster } from "@/components/ui/toaster";
import CustomCursor from '@/components/CustomCursor';
import { ClientDynamicLoader } from '@/components/ClientDynamicLoader'; 

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

export const metadata: Metadata = {
  title: 'MacSphere 博客',
  description: '一个展示前端技术、具有 macOS 风格 UI 的炫酷博客。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true} className={`${inter.variable} ${notoSansSC.variable}`}>
      <head>
        {/* 
          NOTE: SF Pro is a proprietary Apple font. 
          These links are conceptual placeholders. 
          You need to replace them with your privately hosted font URLs for SF Pro Display (Bold) and SF Pro Text (Regular).
          For demonstration, we're using 'Inter' and 'Noto Sans SC' managed by next/font.
          The tailwind.config.ts specifies "SF Pro Display" and "SF Pro Text" as primary font families.
        */}
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <CustomCursor />
        <DynamicWallpaper />
        {/* <ColorSchemeUpdater /> Removed */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <NavigationBar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <ClientDynamicLoader /> 
        <Toaster />
      </body>
    </html>
  );
}
