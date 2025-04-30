import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "ID de simulación requerido" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

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
