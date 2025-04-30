import { redirect } from "next/navigation"

// Redirigir la página principal a la sección de admin
export default function Home() {
  redirect("/admin")
  return null
}
