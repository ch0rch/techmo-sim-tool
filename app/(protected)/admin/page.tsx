import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ListFilter } from "lucide-react"

export default function AdminHome() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-8">
          TechMo: Simulación de Crédito Interno
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Simulación</CardTitle>
              <CardDescription>Cree una nueva simulación de crédito personalizada para un cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Genere una simulación con múltiples opciones de bancos y tasas para compartir con su cliente.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/nueva-simulacion" className="w-full">
                <Button className="w-full flex items-center justify-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Crear Simulación</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ver Simulaciones</CardTitle>
              <CardDescription>Administre y visualice todas las simulaciones creadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acceda a todas las simulaciones existentes, verifique su estado y comparta los enlaces.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/simulaciones" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <span>Ver Simulaciones</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
