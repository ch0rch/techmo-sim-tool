import type React from "react"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import Script from "next/script"

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Valores por defecto
  let title = "Simulación de Crédito Personalizada | TechMo"
  let description = "Revisa tu simulación de crédito personalizada con opciones de financiamiento a tu medida."

  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from("simulaciones").select("cliente_nombre, bancos").eq("id", params.id).single()

    if (data) {
      // Personalizar título con el nombre del cliente
      title = `Simulación de Crédito para ${data.cliente_nombre} | TechMo`

      // Encontrar el monto máximo entre todos los bancos
      if (data.bancos && Array.isArray(data.bancos) && data.bancos.length > 0) {
        // Encontrar el banco con el monto máximo
        const maxBanco = data.bancos.reduce((prev, current) =>
          prev.monto_maximo > current.monto_maximo ? prev : current,
        )

        // Aplicar el ajuste del spread al monto máximo
        const spread = maxBanco.spread || 0
        const montoMaximoAjustado =
          spread > 0 ? Math.floor(maxBanco.monto_maximo / (1 + spread / 100)) : maxBanco.monto_maximo

        // Personalizar descripción con el nombre del cliente y el monto máximo ajustado
        description = `Hola ${data.cliente_nombre}, revisa tu simulación de crédito personalizada con un monto aprobado de hasta ${formatCurrency(montoMaximoAjustado)}.`
      }
    }
  } catch (error) {
    console.error("Error al generar metadatos:", error)
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "TechMo Créditos",
      images: [
        {
          url: `/sim/${params.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "TechMo - Simulación de Crédito Personalizada",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/sim/${params.id}/opengraph-image`],
    },
  }
}

export default function SimulacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1701798333783608');
          fbq('track', 'PageView');
        `}
      </Script>
      <Script id="facebook-pixel-noscript" strategy="afterInteractive">
        {`
          <noscript>
            <img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=1701798333783608&ev=PageView&noscript=1"
            />
          </noscript>
        `}
      </Script>
      {/* End Meta Pixel Code */}

      {/* Plausible Analytics - Usando el script exacto proporcionado */}
      <Script
        defer
        data-domain="techmo.global"
        src="https://plausible.io/js/script.hash.outbound-links.pageview-props.tagged-events.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-setup" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
      {/* End Plausible Analytics */}

      {children}
    </>
  )
}
