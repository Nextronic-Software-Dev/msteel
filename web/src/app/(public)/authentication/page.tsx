"use client"

import { useState } from "react"
import Image from "next/image"
import { BarChart3, CheckCircle2, Ruler, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import SigninForm from "./_component/sign-in-form"
import SignUpForm from "./_component/sign-up-form"

const features = [
  { icon: Ruler, title: "Mesures précises", description: "Centralisez les dimensions calculées automatiquement." },
  { icon: BarChart3, title: "Pilotage instantané", description: "Suivez la production et les indicateurs en temps réel." },
  { icon: ShieldCheck, title: "Traçabilité sécurisée", description: "Retrouvez chaque pièce, image et transmission." },
]

export default function Authentication() {
  const [isSignUp, setIsSignUp] = useState(false)

  return <main className="relative min-h-svh overflow-x-hidden bg-background lg:h-svh lg:overflow-hidden">
    <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6"><ThemeToggle /></div>
    <div className="grid min-h-svh lg:h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.22),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(37,99,235,0.18),transparent_38%)]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full border border-white/10" /><div className="absolute -left-10 top-1/3 h-72 w-72 rounded-full border border-white/5" />
        <div className="relative flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl"><Image src="/logo.png" alt="Nextronic" width={44} height={44} className="h-10 w-10 object-contain" priority /></div><div><p className="font-semibold tracking-wide">Nextronic</p><p className="text-xs text-slate-400">Contrôle industriel intelligent</p></div></div>
        <div className="relative max-w-xl space-y-8"><div className="space-y-4"><div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-xs font-medium text-teal-200"><CheckCircle2 className="h-3.5 w-3.5" /> Plateforme de production</div><h1 className="text-balance text-4xl font-semibold leading-tight xl:text-5xl">Transformez chaque image en donnée exploitable.</h1><p className="max-w-lg text-base leading-relaxed text-slate-300">Une interface unique pour mesurer, contrôler et tracer vos tôles avec rapidité et précision.</p></div><div className="grid gap-4 xl:grid-cols-3">{features.map((feature) => <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"><feature.icon className="mb-3 h-5 w-5 text-teal-300" /><p className="text-sm font-medium">{feature.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{feature.description}</p></div>)}</div></div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Nextronic · Supervision industrielle</p>
      </section>

      <section className="flex min-h-svh flex-col overflow-y-auto px-4 py-6 sm:px-8 lg:h-svh lg:px-12 xl:px-20">
        <div className="flex items-center gap-3 pr-14 lg:hidden"><div className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm"><Image src="/logo.png" alt="Nextronic" width={38} height={38} className="h-9 w-9 object-contain" priority /></div><div><p className="font-semibold">Nextronic</p><p className="text-xs text-muted-foreground">Contrôle industriel</p></div></div>
        <div className="my-auto w-full py-8 sm:mx-auto sm:max-w-[460px] lg:py-10">
          <div className="mb-6 space-y-2"><p className="text-sm font-medium text-teal-700 dark:text-teal-400">Espace sécurisé</p><h2 className="text-3xl font-bold tracking-tight">{isSignUp ? "Créer votre compte" : "Bienvenue"}</h2><p className="text-sm text-muted-foreground">{isSignUp ? "Renseignez vos informations pour rejoindre la plateforme." : "Connectez-vous pour accéder à votre espace de supervision."}</p></div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-slate-200/60 dark:shadow-black/20">{isSignUp ? <SignUpForm /> : <SigninForm />}</div>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground"><span>{isSignUp ? "Vous avez déjà un compte ?" : "Nouveau sur la plateforme ?"}</span><Button variant="link" className="h-auto p-0 font-semibold" onClick={() => setIsSignUp((value) => !value)}>{isSignUp ? "Se connecter" : "Créer un compte"}</Button></div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Connexion chiffrée et données protégées</div>
        </div>
      </section>
    </div>
  </main>
}
