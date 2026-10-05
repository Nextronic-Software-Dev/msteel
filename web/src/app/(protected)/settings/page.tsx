import { getServerSession } from "@/lib/auth"
import { SettingsPanel } from "./settings-panel"

export default async function SettingsPage() {
  const session = await getServerSession()
  if (!session) return null

  return <SettingsPanel user={{ name: session.user.name, email: session.user.email }} />
}
