import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import WalletProvider from "@/components/wallet/WalletProvider";
import { Toaster } from "@/components/ui/Toaster";
import { CryptoPriceProvider } from "@/context/CryptoPriceContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";


export const metadata = {
  title: "Deriverse Analytics",
  description: "Professional on-chain trading analytics",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">

        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CryptoPriceProvider>
              <WalletProvider>{children}</WalletProvider>
              <Toaster />
            </CryptoPriceProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}