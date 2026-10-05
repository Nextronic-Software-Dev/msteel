"use client"

import { FormEvent, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BellRing, LockKeyhole, Save, SlidersHorizontal, UserRound } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { changePassword, updateProfile } from "./actions"

type Preferences = { autoRefresh: boolean; refreshInterval: number; compactTables: boolean }
const defaults: Preferences = { autoRefresh: true, refreshInterval: 30, compactTables: false }

export function SettingsPanel({ user }: { user: { name: string; email: string } }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [preferences, setPreferences] = useState(defaults)

  useEffect(() => {
    const stored = localStorage.getItem("msteel:preferences")
    if (stored) {
      try { setPreferences({ ...defaults, ...JSON.parse(stored) }) } catch { localStorage.removeItem("msteel:preferences") }
    }
  }, [])

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      result.success ? toast.success(result.message) : toast.error(result.message)
      if (result.success) router.refresh()
    })
  }

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const result = await changePassword(formData)
      result.success ? toast.success(result.message) : toast.error(result.message)
      if (result.success) form.reset()
    })
  }

  const savePreferences = () => {
    localStorage.setItem("msteel:preferences", JSON.stringify(preferences))
    window.dispatchEvent(new Event("msteel:preferences-updated"))
    toast.success("Préférences enregistrées")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Toaster />
      <div>
        <p className="text-sm font-medium text-teal-700">Configuration</p>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-muted-foreground">Gérez votre compte et le comportement du poste de supervision.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><UserRound className="h-5 w-5 text-teal-700" /> Profil utilisateur</CardTitle>
            <CardDescription>Ces informations sont affichées dans l’en-tête de l’application.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProfile} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" name="name" defaultValue={user.name} minLength={2} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Adresse e-mail</Label><Input id="email" name="email" type="email" defaultValue={user.email} required /></div>
              <Button disabled={isPending} type="submit" className="gap-2"><Save className="h-4 w-4" /> {isPending ? "Enregistrement…" : "Enregistrer le profil"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><LockKeyhole className="h-5 w-5 text-teal-700" /> Sécurité</CardTitle>
            <CardDescription>Utilisez un mot de passe unique d’au moins 8 caractères.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitPassword} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="currentPassword">Mot de passe actuel</Label><Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="newPassword">Nouveau</Label><Input id="newPassword" name="newPassword" type="password" minLength={8} autoComplete="new-password" required /></div>
                <div className="space-y-2"><Label htmlFor="confirmation">Confirmation</Label><Input id="confirmation" name="confirmation" type="password" minLength={8} autoComplete="new-password" required /></div>
              </div>
              <Button disabled={isPending} type="submit" variant="outline">Modifier le mot de passe</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><SlidersHorizontal className="h-5 w-5 text-teal-700" /> Préférences d’exploitation</CardTitle>
            <CardDescription>Les préférences sont appliquées à ce navigateur et au tableau principal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div><Label className="flex items-center gap-2"><BellRing className="h-4 w-4" /> Actualisation automatique</Label><p className="mt-1 text-sm text-muted-foreground">Récupérer les nouvelles mesures sans recharger la page.</p></div>
              <Switch checked={preferences.autoRefresh} onCheckedChange={(autoRefresh) => setPreferences((value) => ({ ...value, autoRefresh }))} />
            </div>
            <Separator />
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><Label htmlFor="refreshInterval">Fréquence d’actualisation</Label><p className="mt-1 text-sm text-muted-foreground">Intervalle utilisé lorsque l’actualisation automatique est active.</p></div>
              <select id="refreshInterval" value={preferences.refreshInterval} onChange={(event) => setPreferences((value) => ({ ...value, refreshInterval: Number(event.target.value) }))} className="h-10 rounded-md border bg-background px-3 text-sm">
                <option value={15}>Toutes les 15 secondes</option><option value={30}>Toutes les 30 secondes</option><option value={60}>Toutes les 60 secondes</option>
              </select>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div><Label>Affichage compact</Label><p className="mt-1 text-sm text-muted-foreground">Réduire l’espacement des lignes pour les grands volumes.</p></div>
              <Switch checked={preferences.compactTables} onCheckedChange={(compactTables) => setPreferences((value) => ({ ...value, compactTables }))} />
            </div>
            <div className="flex justify-end"><Button onClick={savePreferences} className="gap-2"><Save className="h-4 w-4" /> Enregistrer les préférences</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
