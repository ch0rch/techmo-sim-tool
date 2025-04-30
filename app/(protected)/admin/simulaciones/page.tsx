"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { Search, Eye, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Simulacion } from "@/lib/utils"

export default function SimulacionesPage() {
  const [simulaciones, setSimulaciones] = useState<Simulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchSimulaciones = async () => {
      try {
        setLoading(true)
        // Usar el cliente para el navegador en lugar del cliente de servidor
        const supabase = createClientSupabaseClient()

        // Obtener todas las simulaciones ordenadas por fecha de creación (más recientes primero)
        const { data, error: supabaseError } = await supabase
          .from("simulaciones")
          .select("*")
          .order("created_at", { ascending: false })

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        setSimulaciones(data || [])
      } catch (err) {
        console.error("Error al cargar simulaciones:", err)
        setError("No se pudieron cargar las simulaciones. Por favor, intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchSimulaciones()
  }, [])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Filtrar simulaciones según el término de búsqueda
  const filteredSimulaciones = simulaciones.filter(
    (sim) =>
      sim.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sim.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Obtener el monto máximo de todos los bancos en una simulación
  const getMontoMaximo = (simulacion: Simulacion) => {
    if (!simulacion.bancos || !Array.isArray(simulacion.bancos) || simulacion.bancos.length === 0) {
      return 0
    }

    return Math.max(...simulacion.bancos.map((banco) => banco.monto_maximo))
  }

  // Verificar si una simulación ha expirado
  const isExpirada = (simulacion: Simulacion) => {
    if (!simulacion.expires_at) return false

    const expiresAt = new Date(simulacion.expires_at)
    const now = new Date()

    return expiresAt < now
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Simulaciones de Crédito</h1>
            <p className="text-muted-foreground">Gestione todas las simulaciones creadas</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente o vendedor..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Link href="/admin/nueva-simulacion">
              <Button className="flex items-center justify-center w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span>Nueva Simulación</span>
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Simulaciones</CardTitle>
            <CardDescription>{filteredSimulaciones.length} simulación(es) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredSimulaciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? (
                  <p>No se encontraron simulaciones que coincidan con "{searchTerm}"</p>
                ) : (
                  <p>No hay simulaciones creadas aún</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto Máx.</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSimulaciones.map((simulacion) => (
                      <TableRow key={simulacion.id}>
                        <TableCell className="font-medium">{simulacion.cliente_nombre}</TableCell>
                        <TableCell>{simulacion.vendedor_nombre}</TableCell>
                        <TableCell>{formatDate(simulacion.created_at)}</TableCell>
                        <TableCell>{formatCurrency(getMontoMaximo(simulacion))}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpirada(simulacion) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isExpirada(simulacion) ? "Expirada" : "Activa"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/sim/${simulacion.id}`} target="_blank">
                              <Button variant="outline" size="sm" className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                <span>Ver</span>
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
