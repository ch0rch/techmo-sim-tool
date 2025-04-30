"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BancoForm } from "@/components/banco-form"
import type { BancoOption } from "@/lib/utils"
import { SimulacionCreada } from "@/components/simulacion-creada"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus } from "lucide-react"

export default function NuevaSimulacionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [simulacionId, setSimulacionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [clienteNombre, setClienteNombre] = useState("")
  const [vendedorNombre, setVendedorNombre] = useState("")
  const [agencia, setAgencia] = useState("")
  const [vendedorContacto, setVendedorContacto] = useState("")
  const [ejecutivoTechmo, setEjecutivoTechmo] = useState("")
  const [bancos, setBancos] = useState<BancoOption[]>([])

  // Estado para controlar la visibilidad del formulario de banco
  const [mostrarFormularioBanco, setMostrarFormularioBanco] = useState(false)

  const handleAddBanco = (banco: BancoOption) => {
    setBancos([...bancos, banco])
    // Ocultar el formulario después de agregar un banco
    setMostrarFormularioBanco(false)
    // Limpiar cualquier error previo
    setError(null)
  }

  const handleRemoveBanco = (index: number) => {
    setBancos(bancos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpiar errores previos
    setError(null)

    // Validar datos del cliente y vendedor
    if (!clienteNombre || !vendedorNombre) {
      setError("Por favor complete los datos del cliente y vendedor.")
      return
    }

    // Validar que haya al menos un banco
    if (bancos.length === 0) {
      setError("Por favor agregue al menos un banco a la simulación.")
      return
    }

    setIsLoading(true)

    try {
      // Preparar el contacto del vendedor incluyendo el ejecutivo de TechMo si existe
      let contactoCompleto = vendedorContacto || ""
      if (ejecutivoTechmo) {
        contactoCompleto = contactoCompleto
          ? `${contactoCompleto} | Ejecutivo TechMo: ${ejecutivoTechmo}`
          : `Ejecutivo TechMo: ${ejecutivoTechmo}`
      }

      const response = await fetch("/api/simulaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_nombre: clienteNombre,
          vendedor_nombre: vendedorNombre,
          agencia: agencia, // Enviamos la agencia para combinarla en el backend
          vendedor_contacto: contactoCompleto,
          bancos,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la simulación")
      }

      const data = await response.json()
      setSimulacionId(data.id)
    } catch (error) {
      console.error("Error:", error)
      setError("Ocurrió un error al crear la simulación. Por favor intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (simulacionId) {
    return <SimulacionCreada id={simulacionId} />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Nueva Simulación de Crédito</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Datos del Cliente y Vendedor</CardTitle>
              <CardDescription>Ingrese la información del cliente y vendedor para esta simulación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clienteNombre">Nombre del Cliente *</Label>
                <Input
                  id="clienteNombre"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre completo del cliente"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendedorNombre">Nombre del Vendedor *</Label>
                  <Input
                    id="vendedorNombre"
                    value={vendedorNombre}
                    onChange={(e) => setVendedorNombre(e.target.value)}
                    placeholder="Nombre del vendedor"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencia">Agencia</Label>
                  <Input
                    id="agencia"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    placeholder="Nombre de la agencia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendedorContacto">Contacto del Vendedor (opcional)</Label>
                <Input
                  id="vendedorContacto"
                  value={vendedorContacto}
                  onChange={(e) => setVendedorContacto(e.target.value)}
                  placeholder="Teléfono o email de contacto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ejecutivoTechmo">Ejecutivo de Crédito (TechMo)</Label>
                <Input
                  id="ejecutivoTechmo"
                  value={ejecutivoTechmo}
                  onChange={(e) => setEjecutivoTechmo(e.target.value)}
                  placeholder="Nombre del ejecutivo de TechMo"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="bancos" className="mb-8">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="bancos">Opciones de Bancos</TabsTrigger>
            </TabsList>
            <TabsContent value="bancos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Opciones de Crédito por Banco</span>
                    <Button
                      type="button"
                      onClick={() => setMostrarFormularioBanco(true)}
                      disabled={mostrarFormularioBanco}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Banco
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {bancos.length === 0
                      ? "Agregue las opciones de crédito disponibles para este cliente"
                      : `${bancos.length} banco(s) agregado(s) a esta simulación`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bancos.length > 0 ? (
                    <div className="space-y-4">
                      {bancos.map((banco, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold">{banco.nombre}</h4>
                              <p>Tipo: {banco.tipo}</p>
                              <p>
                                Monto máximo:{" "}
                                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
                                  banco.monto_maximo,
                                )}
                              </p>
                              <p>Tasa: {banco.tasa}%</p>
                              <p>Plazos: {banco.plazos.join(", ")} cuotas</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveBanco(index)}>
                              Eliminar
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay bancos agregados. Haga clic en "Agregar Banco" para comenzar.
                    </div>
                  )}

                  {mostrarFormularioBanco && (
                    <div className="border p-4 rounded-lg mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Agregar Nuevo Banco</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMostrarFormularioBanco(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                      <BancoForm onAddBanco={handleAddBanco} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? "Creando simulación..." : "Crear Simulación"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
