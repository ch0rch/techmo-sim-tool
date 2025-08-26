"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SimulacionBanco } from "@/components/simulacion-banco"
import type { Simulacion, BancoOption } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Send } from "lucide-react"
import Image from "next/image"
import { formatCurrency, generarTablaAmortizacion } from "@/lib/utils"

// Tipo para representar una opción de banco con un ID único
type OpcionBanco = BancoOption & {
  id: string
}

// Declarar el tipo global para plausible y fbq
declare global {
  interface Window {
    fbq?: (event: string, eventName: string, params?: Record<string, any>) => void
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void
  }
}

export default function SimulacionPage() {
  const params = useParams()
  const id = params?.id as string

  // Estados básicos
  const [simulacion, setSimulacion] = useState<Simulacion | null>(null)
  const [opcionesBanco, setOpcionesBanco] = useState<OpcionBanco[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState("")

  // Estados para la simulación actual
  const [bancoActivo, setBancoActivo] = useState("")
  const [tipoCredito, setTipoCredito] = useState("")
  const [montoSeleccionado, setMontoSeleccionado] = useState(0)
  const [plazoSeleccionado, setPlazoSeleccionado] = useState(0)
  const [cuotaMensual, setCuotaMensual] = useState(0)
  const [tasaInteres, setTasaInteres] = useState(0)

  // Estados para información procesada
  const [vendedorInfo, setVendedorInfo] = useState({
    nombre: "",
    agencia: "",
    ejecutivoTechmo: "",
  })

  // Referencia para el contenedor de pestañas desplazable
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  // Efecto para manejar el indicador de desplazamiento
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current
    if (!tabsContainer) return

    const handleScroll = () => {
      const isScrolledToEnd = tabsContainer.scrollLeft + tabsContainer.clientWidth >= tabsContainer.scrollWidth - 10 // 10px de margen

      if (isScrolledToEnd) {
        tabsContainer.classList.add("scrolled-end")
      } else {
        tabsContainer.classList.remove("scrolled-end")
      }
    }

    // Verificar inicialmente
    handleScroll()

    // Añadir listener de evento
    tabsContainer.addEventListener("scroll", handleScroll)

    // Limpiar
    return () => {
      tabsContainer.removeEventListener("scroll", handleScroll)
    }
  }, [opcionesBanco])

  // Efecto para registrar la vista de página en Plausible
  useEffect(() => {
    if (typeof window !== "undefined" && window.plausible && id) {
      // Registrar vista de simulación
      window.plausible("VistaSimulacion", {
        props: {
          simulacion_id: id,
        },
      })
    }
  }, [id])

  // Efecto para obtener la URL base
  useEffect(() => {
    const host = window.location.host
    const protocol = window.location.protocol
    setBaseUrl(`${protocol}//${host}`)
  }, [])

  // Efecto para cargar los datos de la simulación
  useEffect(() => {
    async function fetchSimulacion() {
      if (!id) return

      try {
        setLoading(true)
        const supabase = createClientSupabaseClient()
        const { data, error: supabaseError } = await supabase.from("simulaciones").select("*").eq("id", id).single()

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        if (!data) {
          throw new Error("No se encontró la simulación")
        }

        // Procesar el nombre del vendedor para extraer agencia si existe
        let nombreVendedor = data.vendedor_nombre || ""
        let agencia = ""

        // Si el nombre del vendedor contiene un guión, asumimos que tiene el formato "Vendedor - Agencia"
        if (nombreVendedor.includes(" - ")) {
          const partes = nombreVendedor.split(" - ")
          nombreVendedor = partes[0]
          agencia = partes[1]
        }

        // Procesar el contacto para extraer el ejecutivo de TechMo si existe
        let ejecutivoTechmo = ""
        if (data.vendedor_contacto && data.vendedor_contacto.includes("Ejecutivo TechMo:")) {
          const partes = data.vendedor_contacto.split("Ejecutivo TechMo:")
          ejecutivoTechmo = partes[1].trim()
          // Si hay más información en el contacto, la mantenemos
          data.vendedor_contacto = partes[0].replace(" | ", "").trim()
        }

        // Actualizar la información procesada
        setVendedorInfo({
          nombre: nombreVendedor,
          agencia: agencia,
          ejecutivoTechmo: ejecutivoTechmo,
        })

        // Guardar datos de la simulación
        setSimulacion({
          ...data,
          vendedor_nombre: nombreVendedor,
          agencia: agencia,
          ejecutivo_techmo: ejecutivoTechmo,
        } as Simulacion)

        // Procesar opciones de banco
        if (data.bancos && Array.isArray(data.bancos)) {
          const opciones = data.bancos.map((banco, index) => {
            // Ordenar los plazos de menor a mayor
            const plazosOrdenados = [...banco.plazos].sort((a, b) => a - b)

            // Asegurar que el spread existe (para compatibilidad con datos existentes)
            const bancoConSpread = {
              ...banco,
              plazos: plazosOrdenados,
              spread: banco.spread || 0,
              id: `${banco.nombre}-${banco.tipo}-${index}`,
            }

            return bancoConSpread
          })

          setOpcionesBanco(opciones)

          // Inicializar con el primer banco
          if (opciones.length > 0) {
            const primerBanco = opciones[0]

            // Calcular el monto máximo ajustado según el spread
            const montoMaximoAjustado =
              primerBanco.spread > 0
                ? Math.floor(primerBanco.monto_maximo / (1 + primerBanco.spread / 100))
                : primerBanco.monto_maximo

            // Usar el monto máximo como valor inicial (en lugar de la mitad)
            const montoInicial = montoMaximoAjustado

            // Usar el primer plazo disponible
            const plazosDisponibles = [...primerBanco.plazos].sort((a, b) => a - b)
            const plazoInicial = plazosDisponibles[0]

            // Establecer valores iniciales
            setBancoActivo(primerBanco.id)
            setTipoCredito(primerBanco.tipo === "fija" ? "Tasa Fija" : "UVA")
            setMontoSeleccionado(montoInicial)
            setPlazoSeleccionado(plazoInicial)
            setTasaInteres(primerBanco.tasa)

            // Calcular cuota inicial (incluyendo spread e IVA)
            const resultado = generarTablaAmortizacion(montoInicial, primerBanco.tasa, plazoInicial, primerBanco.spread)
            setCuotaMensual(resultado.cuotaPromedioConIva)
          }
        }
      } catch (err) {
        console.error("Error al cargar la simulación:", err)
        setError("No se pudo cargar la simulación. Por favor verifique el enlace e intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchSimulacion()
  }, [id])

  // Función para cambiar el banco activo
  const cambiarBancoActivo = (bancoId: string) => {
    const banco = opcionesBanco.find((b) => b.id === bancoId)
    if (!banco) return

    setBancoActivo(bancoId)
    setTipoCredito(banco.tipo === "fija" ? "Tasa Fija" : "UVA")
    setTasaInteres(banco.tasa)

    // Calcular el monto máximo ajustado según el spread
    const montoMaximoAjustado =
      banco.spread > 0 ? Math.floor(banco.monto_maximo / (1 + banco.spread / 100)) : banco.monto_maximo

    // Usar el monto máximo como valor inicial (en lugar de mantener el monto anterior)
    setMontoSeleccionado(montoMaximoAjustado)

    // Intentar mantener el plazo actual o usar el primer plazo disponible
    const plazosDisponibles = [...banco.plazos].sort((a, b) => a - b)
    const plazoMasCercano = plazosDisponibles.includes(plazoSeleccionado)
      ? plazoSeleccionado
      : plazosDisponibles.reduce(
          (prev, curr) => (Math.abs(curr - plazoSeleccionado) < Math.abs(prev - plazoSeleccionado) ? curr : prev),
          plazosDisponibles[0],
        )

    setPlazoSeleccionado(plazoMasCercano)

    // Recalcular cuota (incluyendo spread e IVA)
    const resultado = generarTablaAmortizacion(montoMaximoAjustado, banco.tasa, plazoMasCercano, banco.spread)
    setCuotaMensual(resultado.cuotaPromedioConIva)

    // Registrar cambio de banco en Plausible
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("CambioBanco", {
        props: {
          banco: banco.nombre,
          tipo: banco.tipo === "fija" ? "Tasa Fija" : "UVA",
        },
      })
    }
  }

  // Función para actualizar la simulación desde el componente hijo
  const actualizarSimulacion = (monto: number, plazo: number, cuota: number) => {
    setMontoSeleccionado(monto)
    setPlazoSeleccionado(plazo)
    setCuotaMensual(cuota)
  }

  // Función para generar el enlace de WhatsApp
  const generarEnlaceWhatsApp = () => {
    const bancoSeleccionado = opcionesBanco.find((b) => b.id === bancoActivo)
    const nombreBanco = bancoSeleccionado ? bancoSeleccionado.nombre : ""

    const numeroTelefono = "+5492604231391"
    const simulacionUrl = `${baseUrl}/sim/${id}`

    const mensaje = `Hola TechMo, me interesa la simulación de crédito con las siguientes condiciones:
- Banco: ${nombreBanco}
- Tipo: ${tipoCredito}
- Monto: ${formatCurrency(montoSeleccionado)}
- Plazo: ${plazoSeleccionado} cuotas
- Cuota mensual promedio: ${formatCurrency(cuotaMensual)} (incluye IVA)
- Tasa: ${tasaInteres}%

Mi nombre es ${simulacion?.cliente_nombre}. Por favor contáctenme para avanzar con el trámite.

Link a la simulación: ${simulacionUrl}`

    const mensajeEncoded = encodeURIComponent(mensaje)
    return `https://wa.me/${numeroTelefono}?text=${mensajeEncoded}`
  }

  // Formatear la fecha de creación
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Función para generar el título de la pestaña
  const getTituloTab = (banco: OpcionBanco) => {
    return `${banco.nombre} - ${banco.tipo === "fija" ? "Tasa Fija" : "UVA"}`
  }

  // Rastrear evento cuando el usuario ve la tabla de amortización
  const handleVerTablaAmortizacion = (banco: BancoOption, monto: number, plazo: number) => {
    // Ya se maneja en el componente SimulacionBanco
  }

  // Rastrear evento cuando el usuario hace clic en "Me interesa esta opción"
  const handleInteresClick = () => {
    // Facebook Pixel tracking
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_name: `Simulación ${bancoActivo}`,
        content_category: tipoCredito,
        content_ids: [bancoActivo],
        value: montoSeleccionado,
        currency: "ARS",
        custom_data: {
          monto: montoSeleccionado,
          plazo: plazoSeleccionado,
          cuota_mensual: cuotaMensual,
          tasa: tasaInteres,
        },
      })
    }

    // Plausible tracking
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("SolicitudCredito", {
        props: {
          banco: bancoActivo,
          tipo: tipoCredito,
          monto: montoSeleccionado,
          plazo: plazoSeleccionado,
          cuota: cuotaMensual,
          tasa: tasaInteres,
          simulacion_id: id,
        },
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
        </div>
      </div>
    )
  }

  if (error || !simulacion) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6">{error || "No se pudo cargar la simulación"}</p>
          <Button asChild>
            <a href="/">Volver al Inicio</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header con logo */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Simulación de Crédito Personalizada</h1>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/techmo-logo-J8VC04I5tfBzlM0HyN9451na7eK0tp.png"
            alt="TechMo Logo"
            width={150}
            height={50}
            priority
            className="mt-4 md:mt-0"
          />
        </div>

        {/* Información del cliente y proceso */}
        <Card className="mb-8 border-t-4 border-t-[#29DFCC]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Columna 1: Información del cliente */}
              <div>
                <h3 className="font-medium text-lg mb-3">Información</h3>
                <p className="text-lg font-semibold mb-1">Cliente: {simulacion.cliente_nombre}</p>
                <p>Vendedor: {vendedorInfo.nombre}</p>
                {vendedorInfo.agencia && <p>Agencia: {vendedorInfo.agencia}</p>}
                {simulacion.vendedor_contacto && (
                  <p className="text-sm text-gray-500">Contacto: {simulacion.vendedor_contacto}</p>
                )}
                {vendedorInfo.ejecutivoTechmo && (
                  <p className="mt-2">
                    Ejecutivo TechMo: <span className="font-medium">{vendedorInfo.ejecutivoTechmo}</span>
                  </p>
                )}
                <p className="mt-2 text-sm">Creado el {formatFecha(simulacion.created_at)}</p>
              </div>

              {/* Columna 2: Proceso de crédito */}
              <div className="md:col-span-2">
                <h3 className="font-medium text-lg mb-3">Proceso de Crédito</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Solicitud Inicial</p>
                      <p className="text-sm text-gray-500">Completada por el asesor</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Análisis Bancario</p>
                      <p className="text-sm text-gray-500">
                        Consultamos con múltiples bancos para obtener las mejores condiciones
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#29DFCC] flex items-center justify-center text-white">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Simulación Personalizada</p>
                      <p className="text-sm text-gray-500">Estás viendo opciones reales pre-aprobadas</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Confirmación</p>
                      <p className="text-sm text-gray-500">Selecciona una opción para avanzar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulador de opciones bancarias */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Opciones de Financiamiento</h2>

          {opcionesBanco.length > 0 ? (
            <Tabs defaultValue={opcionesBanco[0].id} className="mb-8" onValueChange={cambiarBancoActivo}>
              <div className="overflow-x-auto pb-2 -mx-4 px-4" ref={tabsContainerRef}>
                <TabsList className="inline-flex w-auto min-w-full">
                  {opcionesBanco.map((banco) => (
                    <TabsTrigger key={banco.id} value={banco.id} className="whitespace-nowrap">
                      {getTituloTab(banco)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {opcionesBanco.map((banco) => (
                <TabsContent key={banco.id} value={banco.id}>
                  <SimulacionBanco
                    banco={banco}
                    onSimulacionChange={actualizarSimulacion}
                    onVerTablaAmortizacion={handleVerTablaAmortizacion}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No hay opciones de crédito disponibles en esta simulación.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botón de solicitud */}
        <div className="flex justify-center">
          <a
            href={generarEnlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            onClick={handleInteresClick}
          >
            <Button size="lg" className="bg-[#29DFCC] hover:bg-[#20c5b5] text-white flex items-center gap-2">
              <Send className="h-4 w-4" />
              Me interesa esta opción
            </Button>
          </a>
        </div>

        {/* Nota informativa */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Al continuar, se abrirá WhatsApp para contactar a un asesor con los detalles de su simulación
        </p>
      </div>
    </div>
  )
}
