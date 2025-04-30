"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { type BancoOption, calcularCuotaMensual, generarTablaAmortizacion, formatCurrency } from "@/lib/utils"
import { InfoIcon as InfoCircle, Calendar, DollarSign, Percent } from "lucide-react"
import { BotonTablaAmortizacion } from "@/components/tabla-amortizacion"
import type { Cuota } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SimulacionBancoProps {
  banco: BancoOption
  onSimulacionChange: (monto: number, plazo: number, cuota: number) => void
  onVerTablaAmortizacion?: (banco: BancoOption, monto: number, plazo: number) => void
}

// Declarar el tipo global para fbq
declare global {
  interface Window {
    fbq?: (event: string, eventName: string, params?: Record<string, any>) => void
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void
  }
}

export function SimulacionBanco({ banco, onSimulacionChange, onVerTablaAmortizacion }: SimulacionBancoProps) {
  // Usar los plazos exactos del banco, ordenados de menor a mayor
  const plazosDisponibles = [...banco.plazos].sort((a, b) => a - b)
  const plazoMinimo = plazosDisponibles[0] // El primer plazo disponible
  const plazoMaximo = plazosDisponibles[plazosDisponibles.length - 1] // El último plazo disponible

  // Calcular el monto máximo ajustado según el spread
  const montoMaximoAjustado = useMemo(() => {
    if (!banco.spread || banco.spread === 0) return banco.monto_maximo
    // Fórmula: montoMaximoAjustado = montoMaximo / (1 + spread/100)
    return Math.floor(banco.monto_maximo / (1 + banco.spread / 100))
  }, [banco.monto_maximo, banco.spread])

  // Valores iniciales - Ahora usamos el monto máximo en lugar de la mitad
  const montoInicial = montoMaximoAjustado

  // Estados locales
  const [monto, setMonto] = useState(montoInicial)
  const [montoInputValue, setMontoInputValue] = useState(montoInicial.toString())
  const [plazoIndex, setPlazoIndex] = useState(0) // Comienza con el primer plazo disponible
  const [cuotaSinIva, setCuotaSinIva] = useState(0)
  const [cuotaPromedioConIva, setCuotaPromedioConIva] = useState(0)
  const [tablaAmortizacion, setTablaAmortizacion] = useState<Cuota[]>([])
  const [totalIntereses, setTotalIntereses] = useState(0)
  const [totalIva, setTotalIva] = useState(0)
  const [totalAPagar, setTotalAPagar] = useState(0)
  const [montoConSpread, setMontoConSpread] = useState(0)
  const [lastTrackedMonto, setLastTrackedMonto] = useState(0)
  const [lastTrackedPlazo, setLastTrackedPlazo] = useState(0)

  // Obtener el plazo actual basado en el índice
  const plazoActual = plazosDisponibles[plazoIndex]

  // Actualizar el valor de entrada cuando cambia el monto
  useEffect(() => {
    setMontoInputValue(monto.toString())
  }, [monto])

  // Calcular la cuota mensual cuando cambian los valores
  useEffect(() => {
    // Calcular cuota sin IVA
    const cuotaBase = calcularCuotaMensual(monto, banco.tasa, plazoActual, banco.spread || 0)
    setCuotaSinIva(cuotaBase)

    // Generar tabla de amortización completa con IVA
    const resultado = generarTablaAmortizacion(monto, banco.tasa, plazoActual, banco.spread || 0)
    setTablaAmortizacion(resultado.tabla)
    setCuotaPromedioConIva(resultado.cuotaPromedioConIva)
    setTotalIntereses(resultado.totalIntereses)
    setTotalIva(resultado.totalIva)
    setTotalAPagar(resultado.totalAPagar)
    setMontoConSpread(resultado.montoConSpread)

    // Notificar al componente padre (usamos la cuota promedio con IVA)
    onSimulacionChange(monto, plazoActual, resultado.cuotaPromedioConIva)

    // Rastrear evento de Facebook cuando el usuario ajusta significativamente los valores
    // Solo rastreamos si el cambio es significativo para no enviar demasiados eventos
    const montoChanged = Math.abs(monto - lastTrackedMonto) > montoMaximoAjustado * 0.1
    const plazoChanged = plazoActual !== lastTrackedPlazo

    if ((montoChanged || plazoChanged) && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "CustomizeProduct", {
        content_name: `Simulación ${banco.nombre}`,
        content_category: banco.tipo === "fija" ? "Tasa Fija" : "UVA",
        content_ids: [banco.nombre],
        content_type: "product",
        value: monto,
        currency: "ARS",
        custom_data: {
          monto: monto,
          plazo: plazoActual,
          cuota_mensual: resultado.cuotaPromedioConIva,
          tasa: banco.tasa,
        },
      })

      // Plausible tracking para ajustes significativos
      if (typeof window !== "undefined" && window.plausible) {
        window.plausible("AjusteSimulacion", {
          props: {
            banco: banco.nombre,
            tipo: banco.tipo === "fija" ? "Tasa Fija" : "UVA",
            monto: monto,
            plazo: plazoActual,
            cuota: resultado.cuotaPromedioConIva,
            tasa: banco.tasa,
          },
        })
      }

      // Actualizar los últimos valores rastreados
      setLastTrackedMonto(monto)
      setLastTrackedPlazo(plazoActual)
    }
  }, [monto, plazoActual, banco, onSimulacionChange, montoMaximoAjustado, lastTrackedMonto, lastTrackedPlazo])

  // Paso para el slider de monto (1% del máximo, redondeado a miles)
  const stepMonto = Math.max(1000, Math.round((montoMaximoAjustado * 0.01) / 1000) * 1000)

  // Monto mínimo (10% del máximo o 500,000, el que sea mayor)
  const minAmount = Math.max(500000, Math.round(montoMaximoAjustado * 0.1))

  // Manejadores de eventos simplificados
  const handleMontoChange = (values: number[]) => {
    setMonto(values[0])
  }

  const handlePlazoChange = (values: number[]) => {
    setPlazoIndex(values[0])
  }

  // Manejar cambios en el campo de entrada de monto
  const handleMontoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo dígitos y algunos caracteres especiales para facilitar la edición
    const inputValue = e.target.value.replace(/[^\d]/g, "")
    setMontoInputValue(inputValue)
  }

  // Validar y aplicar el valor cuando el campo pierde el foco
  const handleMontoInputBlur = () => {
    let numValue = Number.parseInt(montoInputValue, 10)

    // Si no es un número válido, volver al valor anterior
    if (isNaN(numValue)) {
      setMontoInputValue(monto.toString())
      return
    }

    // Aplicar límites
    if (numValue < minAmount) numValue = minAmount
    if (numValue > montoMaximoAjustado) numValue = montoMaximoAjustado

    // Actualizar el monto y el valor de entrada
    setMonto(numValue)
    setMontoInputValue(numValue.toString())
  }

  // Manejar la tecla Enter en el campo de entrada
  const handleMontoInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur() // Perder el foco para activar onBlur
    }
  }

  // Rastrear evento cuando el usuario ve la tabla de amortización
  const handleVerTablaAmortizacion = () => {
    // Facebook Pixel tracking
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "ViewContent", {
        content_name: `Tabla Amortización ${banco.nombre}`,
        content_category: banco.tipo === "fija" ? "Tasa Fija" : "UVA",
        content_ids: [banco.nombre],
        content_type: "product_group",
        value: monto,
        currency: "ARS",
      })
    }

    // Plausible tracking
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("VerTablaAmortizacion", {
        props: {
          banco: banco.nombre,
          tipo: banco.tipo === "fija" ? "Tasa Fija" : "UVA",
          monto: monto,
          plazo: plazoActual,
        },
      })
    }

    // Llamar al callback del componente padre si existe
    if (onVerTablaAmortizacion) {
      onVerTablaAmortizacion(banco, monto, plazoActual)
    }
  }

  // Obtener la primera y última cuota para mostrar el rango
  const primeraCuota = tablaAmortizacion.length > 0 ? tablaAmortizacion[0].cuotaConIva : 0
  const ultimaCuota = tablaAmortizacion.length > 0 ? tablaAmortizacion[tablaAmortizacion.length - 1].cuotaConIva : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Widget de resumen rápido */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <InfoCircle className="h-4 w-4 mr-2 text-[#29DFCC]" />
              Resumen de Condiciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-[#29DFCC] mt-0.5" />
              <div>
                <p className="font-medium">Monto Máximo Aprobado</p>
                <p className="text-lg font-bold">{formatCurrency(montoMaximoAjustado)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#29DFCC] mt-0.5" />
              <div>
                <p className="font-medium">Plazos Disponibles</p>
                <p className="text-lg">
                  <span className="font-bold">{plazoMinimo}</span> a <span className="font-bold">{plazoMaximo}</span>{" "}
                  cuotas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Percent className="h-5 w-5 text-[#29DFCC] mt-0.5" />
              <div>
                <p className="font-medium">Tasa de Interés</p>
                <p className="text-lg font-bold">{banco.tasa}% anual</p>
                <p className="text-sm text-muted-foreground">Tipo: {banco.tipo === "fija" ? "Fija" : "UVA"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulador */}
      <div className="md:col-span-2">
        <Card className="border-t-4 border-t-[#29DFCC]">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl">{banco.nombre}</CardTitle>
            <CardDescription>
              Tasa {banco.tipo === "fija" ? "Fija" : "UVA"} del {banco.tasa}% anual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor={`monto-${banco.nombre}`}>
                  Monto a Financiar (hasta {formatCurrency(montoMaximoAjustado)})
                </Label>
                <div className="flex items-center gap-2">
                  <span className="font-medium hidden sm:inline">{formatCurrency(monto)}</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="text"
                      value={montoInputValue}
                      onChange={handleMontoInputChange}
                      onBlur={handleMontoInputBlur}
                      onKeyDown={handleMontoInputKeyDown}
                      className="pl-7 pr-2 py-1 h-8 text-right"
                      aria-label="Monto a financiar"
                    />
                  </div>
                </div>
              </div>
              <Slider
                id={`monto-${banco.nombre}`}
                min={minAmount}
                max={montoMaximoAjustado}
                step={stepMonto}
                value={[monto]}
                onValueChange={handleMontoChange}
                className="[&>span]:bg-[#29DFCC] [&>span]:border-[#29DFCC]"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(minAmount)}</span>
                <span>{formatCurrency(montoMaximoAjustado)}</span>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground mt-1">
              Puede ingresar un monto exacto usando el campo numérico
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor={`plazo-${banco.nombre}`}>
                  Plazo en Cuotas (de {plazoMinimo} a {plazoMaximo})
                </Label>
                <span className="font-medium bg-gray-100 px-3 py-1 rounded-md">{plazoActual} cuotas</span>
              </div>
              <Slider
                id={`plazo-${banco.nombre}`}
                min={0}
                max={plazosDisponibles.length - 1}
                step={1}
                value={[plazoIndex]}
                onValueChange={handlePlazoChange}
                className="[&>span]:bg-[#29DFCC] [&>span]:border-[#29DFCC]"
              />
              <div className="flex justify-between text-sm">
                {plazosDisponibles.map((plazo, index) => (
                  <span
                    key={plazo}
                    className={`${
                      index === plazoIndex
                        ? "text-[#29DFCC] font-medium bg-[#29DFCC]/10 border-b-2 border-[#29DFCC]"
                        : "text-muted-foreground hover:text-gray-700"
                    } cursor-pointer px-2 py-1 rounded transition-colors`}
                    onClick={() => setPlazoIndex(index)}
                  >
                    {plazo}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Cuota Mensual Promedio (con IVA)</div>
                <div className="text-3xl font-bold text-[#29DFCC]">{formatCurrency(cuotaPromedioConIva)}</div>

                {tablaAmortizacion.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>
                      Primera cuota: {formatCurrency(primeraCuota)} | Última cuota: {formatCurrency(ultimaCuota)}
                    </p>
                    <div className="mt-3 flex justify-center">
                      <div onClick={handleVerTablaAmortizacion}>
                        <BotonTablaAmortizacion
                          tabla={tablaAmortizacion}
                          monto={monto}
                          montoConSpread={montoConSpread}
                          spread={banco.spread || 0}
                          totalIntereses={totalIntereses}
                          totalIva={totalIva}
                          totalAPagar={totalAPagar}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
