import { ImageResponse } from "next/og"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "TechMo - Simulación de Crédito Personalizada"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  // Intentar obtener datos de la simulación
  let clienteNombre = "Cliente"
  let montoMaximo = "Personalizada"

  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from("simulaciones").select("cliente_nombre, bancos").eq("id", params.id).single()

    if (data) {
      clienteNombre = data.cliente_nombre

      // Encontrar el monto máximo entre todos los bancos y aplicar el ajuste del spread
      if (data.bancos && Array.isArray(data.bancos) && data.bancos.length > 0) {
        // Encontrar el banco con el monto máximo
        const maxBanco = data.bancos.reduce((prev, current) =>
          prev.monto_maximo > current.monto_maximo ? prev : current,
        )

        // Aplicar el ajuste del spread al monto máximo
        const spread = maxBanco.spread || 0
        const montoMaximoAjustado =
          spread > 0 ? Math.floor(maxBanco.monto_maximo / (1 + spread / 100)) : maxBanco.monto_maximo

        montoMaximo = formatCurrency(montoMaximoAjustado)
      }
    }
  } catch (error) {
    console.error("Error al obtener datos para OG image:", error)
  }

  return new ImageResponse(
    <div
      style={{
        fontSize: 96,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ color: "#29DFCC", fontWeight: "bold", marginRight: "20px" }}>TechMo</div>
        <div style={{ width: "4px", height: "60px", background: "#29DFCC", margin: "0 20px" }}></div>
        <div style={{ fontSize: "48px", color: "#333" }}>Simulación de Crédito</div>
      </div>

      <div style={{ fontSize: "36px", color: "#666", marginTop: "10px", marginBottom: "30px" }}>
        Preparada especialmente para:
      </div>

      <div style={{ fontSize: "64px", fontWeight: "bold", color: "#333", marginBottom: "30px" }}>{clienteNombre}</div>

      <div style={{ fontSize: "36px", color: "#666", marginBottom: "10px" }}>Monto pre-aprobado hasta:</div>

      <div style={{ fontSize: "64px", fontWeight: "bold", color: "#29DFCC" }}>{montoMaximo}</div>
    </div>,
    { ...size },
  )
}
