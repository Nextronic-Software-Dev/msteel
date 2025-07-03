/* eslint-disable */

"use client"

import Link from "next/link"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/form-input"
import { toast } from "sonner"
import { FieldErrors } from "@/app/actions/utils"
import { TInput } from "@/app/actions/sign-in/schema"
import { signIn } from "@/app/actions/sign-in"
import { Loader2, Mail, Lock } from 'lucide-react'

export default function SigninForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { result, error, fieldErrors } = await signIn({
        email,
        password,
      })

      if (error) {
        toast.error(error)
      }

      if (fieldErrors) {
        toast.error("Veuillez vérifier vos informations")
        setFieldErrors(fieldErrors)
      }

      if (result) {
        toast.success("Connexion réussie")
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      toast.error("Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-card">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
        <CardDescription className="text-muted-foreground">
          Accédez à votre espace de gestion d'images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormInput
                label="Adresse email"
                type="email"
                name="email"
                placeholder="nom@entreprise.com"
                className="pl-10"
                errors={fieldErrors.email}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormInput
                label="Mot de passe"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                errors={fieldErrors.password}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Se souvenir de moi
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
