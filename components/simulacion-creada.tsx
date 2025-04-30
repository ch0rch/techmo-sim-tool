"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy, Share2, ExternalLink, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SimulacionCreadaProps {
  id: string
}

export function SimulacionCreada({ id }: SimulacionCreadaProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState("")

  // Determinar la URL base correcta
  useEffect(() => {
    // En producción, usar la URL de la aplicación desplegada
    // En desarrollo, usar localhost
    const host = window.location.host
    const protocol = window.location.protocol
    setBaseUrl(`${protocol}//${host}`)
  }, [])

  const simulationUrl = `${baseUrl}/sim/${id}`

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(simulationUrl)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const shareSimulation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Simulación de Crédito TechMo",
          text: "Revisa tu simulación de crédito personalizada de TechMo",
          url: simulationUrl,
        })
      } catch (err) {
        console.error("Error sharing: ", err)
      }
    } else {
      copyToClipboard()
    }
  }

  const handleCreateNew = () => {
    router.push("/admin/nueva-simulacion")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">¡Simulación Creada!</CardTitle>
            <CardDescription className="text-center">
              La simulación ha sido creada exitosamente. Comparta el siguiente enlace con el cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md flex items-center justify-between">
              <code className="text-sm font-mono truncate flex-1">{simulationUrl}</code>
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Este enlace es público y puede ser compartido directamente con el cliente sin necesidad de contraseña.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full flex items-center justify-center" onClick={shareSimulation}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Compartir Enlace</span>
            </Button>

            <Link href={`/sim/${id}`} target="_blank" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Ver Simulación</span>
              </Button>
            </Link>

            <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Crear Nueva Simulación</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
