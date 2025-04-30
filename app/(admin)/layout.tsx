import type React from "react"
import { PasswordProtection } from "@/components/password-protection"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PasswordProtection password="cabildo1440">{children}</PasswordProtection>
}
