import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "TechMo - Simulación de Crédito"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 128,
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
      <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
        <div style={{ color: "#29DFCC", fontWeight: "bold", marginRight: "20px" }}>TechMo</div>
        <div style={{ width: "4px", height: "80px", background: "#29DFCC", margin: "0 20px" }}></div>
        <div style={{ fontSize: "64px", color: "#333" }}>Simulación de Crédito</div>
      </div>
      <div style={{ fontSize: "48px", color: "#666", marginTop: "20px", textAlign: "center" }}>
        Opciones de financiamiento personalizadas para ti
      </div>
    </div>,
    { ...size },
  )
}
