import { db } from "@/lib/db"
import { ReportsWorkspace } from "./reports-workspace"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const images = await db.processedImage.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <ReportsWorkspace
      images={images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
        sentAt: image.sentAt?.toISOString() ?? null,
      }))}
    />
  )
}
