import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth, AuthProvider } from "@/hooks/use-auth"
import { BottomAppBar, type TabOption } from "@/components/bottom-app-bar"
import { InboxPage } from "@/pages/inbox-page"
import { ProfilePage } from "@/pages/profile-page"
import { ExplorePage } from "@/pages/explore-page"
import { CompanyPage } from "@/pages/company-page"
import { SearchPage } from "@/pages/search-page"
import { LoginPage } from "@/pages/auth/login-page"
import { RegisterPage } from "@/pages/auth/register-page"
import { useState } from "react"

function AuthenticatedLayout() {
  const [activeTab, setActiveTab] = useState<TabOption>("explore")

  const renderPage = () => {
    switch (activeTab) {
      case "explore":
        return <ExplorePage />
      case "inbox":
        return <InboxPage />
      case "search":
        return <SearchPage />
      case "company":
        return <CompanyPage />
      case "profile":
        return <ProfilePage />
      default:
        return <ExplorePage />
    }
  }

  return (
    <div className="flex min-h-svh justify-center bg-muted/30">
      <div className="relative flex h-svh w-[400px] flex-col bg-background shadow-xl">
        <main className="flex flex-1 flex-col overflow-auto">
          {renderPage()}
        </main>
        <BottomAppBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
