// main.tsx - Updated to include ThemeProvider
import React from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import "./index.css"
import { AuthProvider } from "./context/AuthContext"   // 👈 make sure this exists
import { ThemeProvider } from "./context/ThemeContext" // 👈 New import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider> {/* 👈 Wrap App with ThemeProvider */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)