"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

interface PasswordProtectionProps {
  children: React.ReactNode
  password: string
}

export function PasswordProtection({ children, password }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [inputPassword, setInputPassword] = useState("")
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si ya está autenticado en localStorage
    const authStatus = localStorage.getItem("techmo-auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputPassword === password) {
      // Guardar estado de autenticación en localStorage
      localStorage.setItem("techmo-auth", "authenticated")
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("techmo-auth")
    setIsAuthenticated(false)
    setInputPassword("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">TechMo: Acceso Restringido</CardTitle>
            <CardDescription className="text-center">
              Esta herramienta es solo para uso interno del equipo de TechMo.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingrese la contraseña"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-500">Contraseña incorrecta. Intente nuevamente.</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Acceder
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
      {children}
    </div>
  )
}
