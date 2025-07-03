/* eslint-disable */
"use client"

import { useState } from "react"
import Link from "next/link"
import SigninForm from "./_component/sign-in-form"
import { Button } from "@/components/ui/button"
import SignUpForm from "./_component/sign-up-form"
import Image from "next/image"
import { Wrench, Bot, Ruler } from "lucide-react"

export default function Authentication() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="absolute top-6 left-6 z-10">
   <Image
  src="/logo_vertical.png"
  alt="Logo"
  width={600}
  height={500}
  className="h-24 w-24 object-contain"
/>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          <div className="hidden lg:flex flex-col justify-center space-y-8 pt-16">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground">Maghreb Steel</h1>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  Gérez vos outils avec <span className="text-primary">l'IA</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Plateforme intelligente pour cataloguer et dimensionner vos outils industriels.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Catalogue d'Outils</h3>
                    <p className="text-sm text-muted-foreground">Inventaire complet de vos équipements</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Ruler className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Mesures Précises</h3>
                    <p className="text-sm text-muted-foreground">Dimensions automatiques avec IA</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Intelligence Artificielle</h3>
                    <p className="text-sm text-muted-foreground">Reconnaissance et analyse automatique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-6 pt-20 lg:pt-0">
              <div className="space-y-6">
                {!isSignUp ? <SigninForm /> : <SignUpForm />}

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    {!isSignUp ? <span>Nouveau sur la plateforme ?</span> : <span>Vous avez déjà un compte ?</span>}
                    <Button
                      variant="link"
                      className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                      onClick={() => setIsSignUp((p) => !p)}
                    >
                      {!isSignUp ? "Créer un compte" : "Se connecter"}
                    </Button>
                  </div>

             
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
