"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X } from "lucide-react"

interface ContactFormProps {
  clienteNombre: string
  onClose: () => void
}

export function ContactForm({ clienteNombre, onClose }: ContactFormProps) {
  const [nombre, setNombre] = useState(clienteNombre)
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !telefono) {
      alert("Por favor complete su nombre y teléfono")
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real application, you would send this data to your backend
    console.log({
      nombre,
      telefono,
      email,
      mensaje,
    })

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <>
      <CardHeader>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Solicitar más información</CardTitle>
        <CardDescription>Complete el formulario y nos pondremos en contacto a la brevedad</CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <h3 className="text-xl font-medium">¡Gracias por su interés!</h3>
            <p>Nos pondremos en contacto a la brevedad para avanzar con su crédito.</p>
            <Button onClick={onClose} className="mt-4 bg-[#29DFCC] hover:bg-[#20c5b5] text-white">
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de contacto *</Label>
              <Input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje (opcional)</Label>
              <Textarea
                id="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Detalles adicionales o consultas"
                rows={3}
              />
            </div>
          </form>
        )}
      </CardContent>

      {!isSubmitted && (
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[#29DFCC] hover:bg-[#20c5b5] text-white"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>
        </CardFooter>
      )}
    </>
  )
}
