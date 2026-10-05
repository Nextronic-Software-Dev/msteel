"use server"

import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { encrypt, getServerSession } from "@/lib/auth"

export type SettingsResult = { success: boolean; message: string }

export async function updateProfile(formData: FormData): Promise<SettingsResult> {
  const session = await getServerSession()
  if (!session) return { success: false, message: "Session expirée. Reconnectez-vous." }

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()

  if (name.length < 2) return { success: false, message: "Le nom doit contenir au moins 2 caractères." }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { success: false, message: "Saisissez une adresse e-mail valide." }

  const duplicate = await db.user.findFirst({ where: { email, NOT: { id: session.user.id } } })
  if (duplicate) return { success: false, message: "Cette adresse e-mail est déjà utilisée." }

  const user = await db.user.update({ where: { id: session.user.id }, data: { name, email } })
  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  const expires = new Date(session.expires)
  const token = await encrypt({ user: safeUser, expires })
  cookies().set("session", token, { expires, httpOnly: true, sameSite: "lax", path: "/" })

  return { success: true, message: "Profil mis à jour avec succès." }
}

export async function changePassword(formData: FormData): Promise<SettingsResult> {
  const session = await getServerSession()
  if (!session) return { success: false, message: "Session expirée. Reconnectez-vous." }

  const currentPassword = String(formData.get("currentPassword") || "")
  const newPassword = String(formData.get("newPassword") || "")
  const confirmation = String(formData.get("confirmation") || "")

  if (newPassword.length < 8) return { success: false, message: "Le nouveau mot de passe doit contenir au moins 8 caractères." }
  if (newPassword !== confirmation) return { success: false, message: "La confirmation ne correspond pas." }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return { success: false, message: "Le mot de passe actuel est incorrect." }
  }

  const password = await bcrypt.hash(newPassword, 12)
  await db.user.update({ where: { id: user.id }, data: { password } })
  return { success: true, message: "Mot de passe modifié avec succès." }
}
