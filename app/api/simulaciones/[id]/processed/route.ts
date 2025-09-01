import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { generarTablaAmortizacion, formatCurrency } from "@/lib/utils"
import type { BancoOption } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "ID de simulación requerido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("simulaciones")
      .select("id, cliente_nombre, vendedor_nombre, bancos, created_at, expires_at")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching simulation:", error)
      return NextResponse.json({ error: "Error al obtener la simulación" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Simulación no encontrada" }, { status: 404 })
    }

    // Procesar el nombre del vendedor para extraer agencia si existe
    let nombreVendedor = data.vendedor_nombre || ""
    let agencia = ""

    if (nombreVendedor.includes(" - ")) {
      const partes = nombreVendedor.split(" - ")
      nombreVendedor = partes[0]
      agencia = partes[1]
    }

    // Procesar cada banco con cálculos
    const bancosProcessed =
      (data.bancos as BancoOption[])?.map((banco) => {
        // Calcular el monto máximo ajustado según el spread
        const montoMaximoReal =
          banco.spread > 0 ? Math.floor(banco.monto_maximo / (1 + banco.spread / 100)) : banco.monto_maximo

        // Generar opciones de cuotas para cada plazo disponible
        const opcionesCuotas = banco.plazos.map((plazo) => {
          const resultado = generarTablaAmortizacion(montoMaximoReal, banco.tasa, plazo, banco.spread || 0)

          return {
            plazo: plazo,
            cuota_promedio_sin_iva: Math.round((resultado.cuotaPromedioConIva / 1.21) * 100) / 100, // Aproximación
            cuota_promedio_con_iva: resultado.cuotaPromedioConIva,
            cuota_promedio_con_iva_formatted: formatCurrency(resultado.cuotaPromedioConIva),
            total_intereses: resultado.totalIntereses,
            total_iva: resultado.totalIva,
            total_a_pagar: resultado.totalAPagar,
            total_a_pagar_formatted: formatCurrency(resultado.totalAPagar),
            primera_cuota: resultado.tabla.length > 0 ? resultado.tabla[0].cuotaConIva : 0,
            ultima_cuota: resultado.tabla.length > 0 ? resultado.tabla[resultado.tabla.length - 1].cuotaConIva : 0,
          }
        })

        return {
          banco_info: {
            nombre: banco.nombre,
            tipo: banco.tipo,
            tasa: banco.tasa,
            spread: banco.spread || 0,
            plazos_disponibles: banco.plazos.sort((a, b) => a - b),
          },
          monto_maximo_original: banco.monto_maximo,
          monto_maximo_original_formatted: formatCurrency(banco.monto_maximo),
          monto_maximo_real: montoMaximoReal,
          monto_maximo_real_formatted: formatCurrency(montoMaximoReal),
          opciones_cuotas: opcionesCuotas,
          plazo_minimo: Math.min(...banco.plazos),
          plazo_maximo: Math.max(...banco.plazos),
          // Datos de la mejor opción (plazo más corto)
          mejor_opcion: opcionesCuotas.find((opcion) => opcion.plazo === Math.min(...banco.plazos)),
        }
      }) || []

    // Encontrar el banco con mejor monto máximo
    const mejorBanco = bancosProcessed.reduce(
      (mejor, actual) => (actual.monto_maximo_real > mejor.monto_maximo_real ? actual : mejor),
      bancosProcessed[0],
    )

    // Respuesta con datos procesados
    const response = {
      simulacion_id: data.id,
      cliente_nombre: data.cliente_nombre,
      vendedor_nombre: nombreVendedor,
      agencia: agencia || null,
      created_at: data.created_at,
      expires_at: data.expires_at,
      bancos: bancosProcessed,
      resumen: {
        total_bancos: bancosProcessed.length,
        monto_maximo_disponible: mejorBanco?.monto_maximo_real || 0,
        monto_maximo_disponible_formatted: mejorBanco ? formatCurrency(mejorBanco.monto_maximo_real) : "$0",
        banco_mejor_monto: mejorBanco?.banco_info.nombre || null,
        plazos_disponibles: [...new Set(bancosProcessed.flatMap((b) => b.banco_info.plazos_disponibles))].sort(
          (a, b) => a - b,
        ),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
