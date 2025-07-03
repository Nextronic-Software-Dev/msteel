/* eslint-disable */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/form-input"
import { toast } from "sonner"
import { login } from "@/lib/auth"
import type { FieldErrors } from "@/app/actions/utils"
import { signUp } from "@/app/actions/sign-up"
import type { TInput } from "@/app/actions/sign-up/schema"
import { Loader2, User, Mail, Lock } from "lucide-react"

export default function SignUpForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { result, error, fieldErrors } = await signUp({
        name,
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
        toast.success("Compte créé avec succès")
        await login({
          email,
          password,
        })
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
        <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
        <CardDescription className="text-muted-foreground">Rejoignez votre équipe sur ImageViz Pro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormInput
                label="Nom complet"
                name="name"
                placeholder="Mohamed Saber"
                className="pl-10"
                errors={fieldErrors.name}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <FormInput
                label="Adresse email professionnelle"
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

      

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création du compte...
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
