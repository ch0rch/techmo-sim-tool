import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validate required fields
    if (
      !body.cliente_nombre ||
      !body.vendedor_nombre ||
      !body.bancos ||
      !Array.isArray(body.bancos) ||
      body.bancos.length === 0
    ) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Optional: Set expiration date (e.g., 30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Combinar nombre del vendedor y agencia en un solo campo para mantener compatibilidad
    const vendedorNombreCompleto = body.agencia ? `${body.vendedor_nombre} - ${body.agencia}` : body.vendedor_nombre

    // Insert into database - usando la estructura actual de la base de datos
    const { data, error } = await supabase
      .from("simulaciones")
      .insert({
        cliente_nombre: body.cliente_nombre,
        vendedor_nombre: vendedorNombreCompleto, // Combinamos vendedor y agencia
        vendedor_contacto: body.vendedor_contacto || null,
        // Guardamos el ejecutivo de TechMo en el campo de contacto si no hay contacto del vendedor
        // o lo agregamos al final del contacto si ya existe
        bancos: body.bancos,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error inserting simulation:", error)
      return NextResponse.json({ error: "Error al crear la simulación" }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID de simulación requerido" }, { status: 400 })
    }

    const { data, error } = await supabase.from("simulaciones").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching simulation:", error)
      return NextResponse.json({ error: "Error al obtener la simulación" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Simulación no encontrada" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
