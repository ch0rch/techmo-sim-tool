import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type BancoOption = {
  nombre: string
  monto_maximo: number
  tasa: number
  tipo: "fija" | "UVA"
  plazos: number[]
  spread: number // Comisión de TechMo
}

export type Simulacion = {
  id: string
  cliente_nombre: string
  vendedor_nombre: string
  agencia: string
  vendedor_contacto?: string
  ejecutivo_techmo?: string
  bancos: BancoOption[]
  created_at: string
  expires_at?: string
}

// Tipo para representar una cuota en la tabla de amortización
export type Cuota = {
  numero: number
  capital: number
  interes: number
  iva: number
  cuotaSinIva: number
  cuotaConIva: number
  saldoRestante: number
}

// Calculate monthly payment using the French amortization system (without IVA)
export function calcularCuotaMensual(monto: number, tasa: number, plazo: number, spread = 0): number {
  // Aplicar el spread al monto a financiar, no a la tasa
  const montoConSpread = monto * (1 + spread / 100)

  // Convertir tasa anual a mensual
  const tasaMensual = tasa / 100 / 12

  // Calculate monthly payment using the formula: P = (r * PV) / (1 - (1 + r)^-n)
  // Where:
  // P = Monthly payment
  // r = Monthly interest rate (annual rate / 12)
  // PV = Present value (loan amount with spread)
  // n = Number of payments (loan term in months)

  if (tasaMensual === 0) {
    return montoConSpread / plazo
  }

  const cuota = (montoConSpread * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo))
  return Math.round(cuota * 100) / 100
}

// Generate complete amortization table with IVA
export function generarTablaAmortizacion(
  monto: number,
  tasa: number,
  plazo: number,
  spread = 0,
  ivaPorcentaje = 21,
): {
  tabla: Cuota[]
  cuotaPromedioConIva: number
  totalIntereses: number
  totalIva: number
  totalAPagar: number
  montoConSpread: number
} {
  // Aplicar el spread al monto a financiar
  const montoConSpread = monto * (1 + spread / 100)

  // Convertir tasa anual a mensual (sin incluir spread)
  const tasaMensual = tasa / 100 / 12

  // Calcular cuota sin IVA
  const cuotaSinIva = calcularCuotaMensual(monto, tasa, plazo, spread)

  let saldoRestante = montoConSpread
  const tabla: Cuota[] = []
  let totalIntereses = 0
  let totalIva = 0
  let totalCuotasConIva = 0

  for (let i = 1; i <= plazo; i++) {
    // Calcular interés para este período
    const interesMensual = saldoRestante * tasaMensual

    // Calcular IVA sobre el interés
    const ivaMensual = interesMensual * (ivaPorcentaje / 100)

    // Calcular amortización de capital (cuota sin IVA - interés)
    const capitalMensual = cuotaSinIva - interesMensual

    // Calcular cuota con IVA
    const cuotaConIva = cuotaSinIva + ivaMensual

    // Actualizar saldo restante
    saldoRestante -= capitalMensual

    // Ajustar el saldo final para evitar errores de redondeo
    if (i === plazo) {
      saldoRestante = 0
    }

    // Agregar cuota a la tabla
    tabla.push({
      numero: i,
      capital: Math.round(capitalMensual * 100) / 100,
      interes: Math.round(interesMensual * 100) / 100,
      iva: Math.round(ivaMensual * 100) / 100,
      cuotaSinIva: Math.round(cuotaSinIva * 100) / 100,
      cuotaConIva: Math.round(cuotaConIva * 100) / 100,
      saldoRestante: Math.round(saldoRestante * 100) / 100,
    })

    // Acumular totales
    totalIntereses += interesMensual
    totalIva += ivaMensual
    totalCuotasConIva += cuotaConIva
  }

  // Calcular cuota promedio con IVA
  const cuotaPromedioConIva = totalCuotasConIva / plazo

  return {
    tabla,
    cuotaPromedioConIva: Math.round(cuotaPromedioConIva * 100) / 100,
    totalIntereses: Math.round(totalIntereses * 100) / 100,
    totalIva: Math.round(totalIva * 100) / 100,
    totalAPagar: Math.round((montoConSpread + totalIntereses + totalIva) * 100) / 100,
    montoConSpread: Math.round(montoConSpread * 100) / 100,
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}
