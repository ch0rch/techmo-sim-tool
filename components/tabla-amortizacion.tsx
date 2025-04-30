"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Cuota } from "@/lib/utils"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"

interface TablaAmortizacionProps {
  tabla: Cuota[]
  monto: number
  montoConSpread: number
  spread: number
  totalIntereses: number
  totalIva: number
  totalAPagar: number
}

export function TablaAmortizacion({
  tabla,
  monto,
  montoConSpread,
  spread,
  totalIntereses,
  totalIva,
  totalAPagar,
}: TablaAmortizacionProps) {
  const [mostrarFilas, setMostrarFilas] = useState(6)
  const [expandido, setExpandido] = useState(false)

  const toggleExpandir = () => {
    if (expandido) {
      setMostrarFilas(6)
    } else {
      setMostrarFilas(tabla.length)
    }
    setExpandido(!expandido)
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Detalle de Cuotas</h3>

      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monto a financiar</p>
            <p className="text-lg font-medium">{formatCurrency(monto)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Intereses</p>
            <p className="text-lg font-medium">{formatCurrency(totalIntereses)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total IVA</p>
            <p className="text-lg font-medium">{formatCurrency(totalIva)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Cuota</TableHead>
              <TableHead>Capital</TableHead>
              <TableHead>Interés</TableHead>
              <TableHead>IVA (21%)</TableHead>
              <TableHead>Cuota sin IVA</TableHead>
              <TableHead>Cuota con IVA</TableHead>
              <TableHead>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabla.slice(0, mostrarFilas).map((cuota) => (
              <TableRow key={cuota.numero}>
                <TableCell className="font-medium">{cuota.numero}</TableCell>
                <TableCell>{formatCurrency(cuota.capital)}</TableCell>
                <TableCell>{formatCurrency(cuota.interes)}</TableCell>
                <TableCell>{formatCurrency(cuota.iva)}</TableCell>
                <TableCell>{formatCurrency(cuota.cuotaSinIva)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(cuota.cuotaConIva)}</TableCell>
                <TableCell>{formatCurrency(cuota.saldoRestante)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {tabla.length > 6 && (
        <Button variant="outline" size="sm" onClick={toggleExpandir} className="mt-2 flex items-center">
          {expandido ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ver todas las cuotas ({tabla.length})
            </>
          )}
        </Button>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Capital</p>
          <p className="text-lg font-medium">{formatCurrency(monto)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Total Intereses + IVA</p>
          <p className="text-lg font-medium">{formatCurrency(totalIntereses + totalIva)}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Total a Pagar</p>
          <p className="text-lg font-medium">{formatCurrency(totalAPagar)}</p>
        </div>
      </div>
    </div>
  )
}

export function BotonTablaAmortizacion({
  tabla,
  monto,
  montoConSpread,
  spread,
  totalIntereses,
  totalIva,
  totalAPagar,
}: TablaAmortizacionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Ver tabla de amortización
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tabla de Amortización</DialogTitle>
        </DialogHeader>
        <TablaAmortizacion
          tabla={tabla}
          monto={monto}
          montoConSpread={montoConSpread}
          spread={spread}
          totalIntereses={totalIntereses}
          totalIva={totalIva}
          totalAPagar={totalAPagar}
        />
      </DialogContent>
    </Dialog>
  )
}
