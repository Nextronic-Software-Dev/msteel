"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X, Edit3 } from "lucide-react"
import { toast } from "sonner"

interface EditableDimensionProps {
  value: number
  onSave: (newValue: number) => Promise<boolean>
  label: string
  color: "blue" | "green"
  disabled?: boolean
}

export function EditableDimension({ value, onSave, label, color, disabled = false }: EditableDimensionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toFixed(2))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setEditValue(value.toFixed(2))
  }, [value])

  const handleSave = async () => {
    const numValue = Number.parseFloat(editValue)

    if (isNaN(numValue) || numValue < 0) {
      toast.error("Valeur invalide", {
        description: "Veuillez saisir un nombre positif valide",
      })
      setEditValue(value.toFixed(2))
      return
    }

    if (numValue === value) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      const success = await onSave(numValue)
      if (success) {
        setIsEditing(false)
        toast.success(`${label} mis à jour`, {
          description: `Nouvelle valeur: ${numValue.toFixed(2)} mm`,
        })
      } else {
        setEditValue(value.toFixed(2))
        toast.error("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      setEditValue(value.toFixed(2))
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value.toFixed(2))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 h-8 text-xs font-mono text-center"
          disabled={isLoading}
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleSave} disabled={isLoading}>
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleCancel} disabled={isLoading}>
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`group relative inline-flex items-center justify-center px-2 py-1 rounded cursor-pointer transition-all hover:shadow-sm ${colorClasses[color]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={() => !disabled && setIsEditing(true)}
    >
      <span className="font-mono text-sm">{value.toFixed(2)}</span>
      {!disabled && <Edit3 className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />}
    </div>
  )
}
