"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BancoOption } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { FormattedNumberInput } from "@/components/formatted-number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BancoFormProps {
  onAddBanco: (banco: BancoOption) => void
}

// Lista predefinida de bancos
const BANCOS_DISPONIBLES = ["Supervielle", "BBVA", "Santander", "Mila", "TechMo"]

export function BancoForm({ onAddBanco }: BancoFormProps) {
  const [nombre, setNombre] = useState("")
  const [montoMaximo, setMontoMaximo] = useState("")
  const [tasa, setTasa] = useState("")
  const [spread, setSpread] = useState("") // Nuevo estado para el spread
  const [tipo, setTipo] = useState<"fija" | "UVA">("fija")

  // Common loan terms in months (actualizado con todas las opciones solicitadas)
  const availablePlazos = [6, 12, 18, 24, 30, 36, 48, 60]
  const [selectedPlazos, setSelectedPlazos] = useState<number[]>([])

  const handlePlazoToggle = (plazo: number) => {
    if (selectedPlazos.includes(plazo)) {
      setSelectedPlazos(selectedPlazos.filter((p) => p !== plazo))
    } else {
      setSelectedPlazos([...selectedPlazos, plazo].sort((a, b) => a - b))
    }
  }

  const handleSubmit = () => {
    if (!nombre || !montoMaximo || !tasa || selectedPlazos.length === 0) {
      alert("Por favor complete todos los campos y seleccione al menos un plazo.")
      return
    }

    const montoNumerico = Number.parseFloat(montoMaximo)
    if (isNaN(montoNumerico) || montoNumerico < 500000 || montoNumerico > 60000000) {
      alert("El monto máximo debe estar entre $500.000 y $60.000.000")
      return
    }

    const spreadNumerico = spread ? Number.parseFloat(spread) : 0

    const banco: BancoOption = {
      nombre,
      monto_maximo: montoNumerico,
      tasa: Number.parseFloat(tasa),
      tipo,
      plazos: selectedPlazos,
      spread: spreadNumerico, // Agregar el spread al objeto banco
    }

    onAddBanco(banco)

    // Reset form
    setNombre("")
    setMontoMaximo("")
    setTasa("")
    setSpread("")
    setTipo("fija")
    setSelectedPlazos([])
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Banco *</Label>
        <Select value={nombre} onValueChange={setNombre}>
          <SelectTrigger id="nombre">
            <SelectValue placeholder="Seleccione un banco" />
          </SelectTrigger>
          <SelectContent>
            {BANCOS_DISPONIBLES.map((banco) => (
              <SelectItem key={banco} value={banco}>
                {banco}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="montoMaximo">Monto Máximo Aprobado (ARS) *</Label>
        <FormattedNumberInput
          id="montoMaximo"
          value={montoMaximo}
          onChange={setMontoMaximo}
          placeholder="Ej: 3.000.000"
          min={500000}
          max={60000000}
          required
        />
        <p className="text-xs text-muted-foreground">Ingrese un valor entre $500.000 y $60.000.000</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tasa">Tasa de Interés Anual (%) *</Label>
        <Input
          id="tasa"
          type="number"
          min="0"
          step="0.01"
          value={tasa}
          onChange={(e) => setTasa(e.target.value)}
          placeholder="Ej: 58.5"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="spread">Spread (%) - Comisión TechMo</Label>
        <Input
          id="spread"
          type="number"
          min="0"
          step="0.01"
          value={spread}
          onChange={(e) => setSpread(e.target.value)}
          placeholder="Ej: 2.5"
        />
        <p className="text-xs text-muted-foreground">
          Comisión interna que se suma a la tasa para el cálculo de la cuota (no visible para el cliente)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Tasa *</Label>
        <RadioGroup value={tipo} onValueChange={(value) => setTipo(value as "fija" | "UVA")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fija" id="fija" />
            <Label htmlFor="fija">Fija</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="UVA" id="UVA" />
            <Label htmlFor="UVA">UVA</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Plazos Disponibles (en cuotas) *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {availablePlazos.map((plazo) => (
            <div key={plazo} className="flex items-center space-x-2">
              <Checkbox
                id={`plazo-${plazo}`}
                checked={selectedPlazos.includes(plazo)}
                onCheckedChange={() => handlePlazoToggle(plazo)}
              />
              <Label htmlFor={`plazo-${plazo}`}>{plazo} cuotas</Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="button" onClick={handleSubmit} className="mt-4">
        Agregar Banco
      </Button>
    </div>
  )
}
