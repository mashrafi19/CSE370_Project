import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import { authApi, type User, type UserUpdate } from "@/lib/api/client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  updateUser: (data: UserUpdate) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    let isMounted = true
    const token = localStorage.getItem("token")
    if (token) {
      authApi
        .getMe()
        .then((user) => {
          if (isMounted) {
            setUser(user)
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false)
          }
        })
    } else {
      queueMicrotask(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    localStorage.setItem("token", response.access_token)
    setUser(response.user)
  }

  const register = async (email: string, password: string, fullName?: string) => {
    const response = await authApi.register(email, password, fullName)
    localStorage.setItem("token", response.access_token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const updateUser = async (data: UserUpdate) => {
    const updatedUser = await authApi.updateMe(data)
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
