import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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

    // Respuesta con datos raw
    const response = {
      simulacion_id: data.id,
      cliente_nombre: data.cliente_nombre,
      vendedor_nombre: nombreVendedor,
      agencia: agencia || null,
      bancos: data.bancos || [],
      created_at: data.created_at,
      expires_at: data.expires_at,
      total_bancos: data.bancos ? data.bancos.length : 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
