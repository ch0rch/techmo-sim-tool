"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle, User, UserCheck, Calendar, AlertTriangle, Building } from "lucide-react"
import Image from "next/image"
import type { Simulacion } from "@/lib/utils"

interface SimulacionSidebarProps {
  simulacion: Simulacion
  tiempoRestante: string | null
  onContactClick: () => void
}

export function SimulacionSidebar({ simulacion, tiempoRestante, onContactClick }: SimulacionSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Formatear la fecha de creación
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Determinar si la simulación está por expirar (menos de 5 días)
  const isPorExpirar = () => {
    if (!tiempoRestante || tiempoRestante === "Expirado") return false
    const dias = Number.parseInt(tiempoRestante.split(" ")[0])
    return dias <= 5
  }

  return (
    <>
      {/* Botón para abrir sidebar en móvil */}
      <button
        className="fixed bottom-4 right-4 z-40 md:hidden bg-[#29DFCC] text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <User className="h-6 w-6" />
      </button>

      {/* Sidebar para móvil */}
      <div
        className={`fixed inset-0 z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
        <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl">
          <div className="h-full overflow-y-auto">{renderSidebarContent()}</div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:block md:w-80 lg:w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        {renderSidebarContent()}
      </div>
    </>
  )

  function renderSidebarContent() {
    return (
      <div className="p-6 flex flex-col h-full">
        <div className="mb-6 flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/techmo-logo-J8VC04I5tfBzlM0HyN9451na7eK0tp.png"
            alt="TechMo Logo"
            width={150}
            height={50}
            priority
          />
        </div>

        <Card className="p-4 mb-6 bg-white">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-[#29DFCC]" />
            <h3 className="font-medium">Información del Cliente</h3>
          </div>
          <p className="text-lg font-semibold">{simulacion.cliente_nombre}</p>

          <Separator className="my-3" />

          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-5 w-5 text-[#29DFCC]" />
            <h3 className="font-medium">Asesor</h3>
          </div>
          <p className="text-lg font-semibold">{simulacion.vendedor_nombre}</p>

          <div className="flex items-center gap-3 mt-3 mb-2">
            <Building className="h-5 w-5 text-[#29DFCC]" />
            <h3 className="font-medium">Agencia</h3>
          </div>
          <p className="text-lg font-semibold">{simulacion.agencia || "No especificada"}</p>

          {simulacion.vendedor_contacto && <p className="text-sm text-gray-500 mt-2">{simulacion.vendedor_contacto}</p>}

          {simulacion.ejecutivo_techmo && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center gap-3 mb-2">
                <UserCheck className="h-5 w-5 text-[#29DFCC]" />
                <h3 className="font-medium">Ejecutivo TechMo</h3>
              </div>
              <p className="text-lg font-semibold">{simulacion.ejecutivo_techmo}</p>
            </>
          )}
        </Card>

        <Card className="p-4 mb-6 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-[#29DFCC]" />
            <h3 className="font-medium">Fecha de Creación</h3>
          </div>
          <p>{formatFecha(simulacion.created_at)}</p>

          {tiempoRestante && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-[#29DFCC]" />
                <h3 className="font-medium">Tiempo Restante</h3>
              </div>
              <div className="flex items-center gap-2">
                {isPorExpirar() ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <p className={isPorExpirar() ? "text-amber-500 font-medium" : ""}>{tiempoRestante}</p>
              </div>
              {isPorExpirar() && (
                <p className="text-sm text-amber-500 mt-1">
                  Esta simulación expirará pronto. Tome una decisión para asegurar estas condiciones.
                </p>
              )}
            </>
          )}
        </Card>

        <Card className="p-4 mb-6 bg-white">
          <h3 className="font-medium mb-3">Proceso de Crédito</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                1
              </div>
              <div>
                <p className="font-medium">Solicitud Inicial</p>
                <p className="text-sm text-gray-500">Completada por el asesor</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                2
              </div>
              <div>
                <p className="font-medium">Análisis Bancario</p>
                <p className="text-sm text-gray-500">
                  Nuestro equipo ha consultado con múltiples bancos para obtener las mejores condiciones
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                3
              </div>
              <div>
                <p className="font-medium">Simulación Personalizada</p>
                <p className="text-sm text-gray-500">Estás viendo opciones reales pre-aprobadas</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white">
                4
              </div>
              <div>
                <p className="font-medium text-gray-500">Confirmación</p>
                <p className="text-sm text-gray-500">Selecciona una opción para avanzar</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-auto">
          <Button onClick={onContactClick} className="w-full bg-[#29DFCC] hover:bg-[#20c5b5] text-white" size="lg">
            Me interesa esta opción
          </Button>
          <p className="text-xs text-center mt-2 text-gray-500">
            Al continuar, un asesor se pondrá en contacto para finalizar el proceso
          </p>
        </div>
      </div>
    )
  }
}
