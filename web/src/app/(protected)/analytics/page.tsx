import { db } from "@/lib/db"
import { AnalyticsDashboard } from "./analytics-dashboard"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const images = await db.processedImage.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      customId: true,
      sent: true,
      createdAt: true,
      l1: true,
      l2: true,
      l3: true,
      l4: true,
      l5: true,
      w1: true,
      w2: true,
      w3: true,
    },
  })

  return (
    <AnalyticsDashboard
      images={images.map((image) => ({
        ...image,
        createdAt: image.createdAt.toISOString(),
      }))}
    />
  )
}
