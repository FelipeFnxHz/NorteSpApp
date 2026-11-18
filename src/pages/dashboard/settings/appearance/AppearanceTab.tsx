import { useState } from "react"
import { AlertCircle, Check, Globe, Loader2, Lock, RotateCcw, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useAppearance, type SaveState } from "@/contexts/AppearanceContext"
import { DEFAULT_APPEARANCE, prefsEqual } from "@/lib/appearance"
import { cn } from "@/lib/utils"
import { AccentPicker } from "./AccentPicker"
import { BrandingCard } from "./BrandingCard"
import { Segmented } from "./Segmented"
import { ThemePicker } from "./ThemePicker"

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium" role="status">
        <Loader2 className="size-3.5 animate-spin" /> Salvando...
      </span>
    )
  if (state === "saved")
    return (
      <span className="text-accent flex items-center gap-1.5 text-xs font-medium" role="status">
        <Check className="size-3.5" /> Salvo no seu perfil
      </span>
    )
  if (state === "error")
    return (
      <span className="text-destructive flex items-center gap-1.5 text-xs font-medium" role="alert">
        <AlertCircle className="size-3.5" /> Não foi possível salvar
      </span>
    )
  return <span className="text-muted-foreground text-xs">As mudanças são aplicadas e salvas automaticamente.</span>
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
      </div>
      {children}
    </section>
  )
}

function LivePreview() {
  return (
    <div className="border-border bg-background/50 flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Botão principal</Button>
        <Button size="sm" variant="outline">
          Secundário
        </Button>
        <Badge variant="success">Ativo</Badge>
        <Badge variant="secondary">Neutro</Badge>
      </div>
      <Input placeholder="Campo de texto de exemplo" aria-label="Campo de exemplo" readOnly />
      <div className="flex items-center gap-2.5">
        <Switch checked aria-label="Exemplo de interruptor" />
        <span className="text-muted-foreground text-xs">Assim os componentes aparecem com as suas escolhas.</span>
      </div>
    </div>
  )
}

function PersonalAppearance() {
  const { prefs, saveState, update, reset } = useAppearance()
  const isDefault = prefsEqual(prefs, DEFAULT_APPEARANCE)

  return (
    <Card className="gap-7 px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">Preferências visuais</h3>
            <p className="text-muted-foreground mt-1 text-xs">Valem só para a sua conta e acompanham você em qualquer dispositivo.</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={isDefault} onClick={reset}>
            <RotateCcw className="size-3.5" />
            Restaurar padrão
          </Button>
        </div>

        <Section title="Tema" description="Escolha entre o modo escuro, o claro ou deixe o aparelho decidir.">
          <ThemePicker value={prefs.theme} onChange={theme => update({ theme })} />
        </Section>

        <Section title="Cor de destaque" description="Usada em botões, links, seleções e gráficos de toda a Dashboard.">
          <AccentPicker accent={prefs.accent} customAccent={prefs.customAccent} onChange={update} />
        </Section>

        <div className="grid gap-7 md:grid-cols-3">
          <Section title="Densidade" description="Espaço entre os elementos.">
            <Segmented
              label="Densidade"
              value={prefs.density}
              onChange={density => update({ density })}
              options={[
                { value: "comfortable", label: "Confortável" },
                { value: "compact", label: "Compacta" },
              ]}
            />
          </Section>
          <Section title="Cantos" description="Arredondamento de cards e botões.">
            <Segmented
              label="Cantos"
              value={prefs.radius}
              onChange={radius => update({ radius })}
              options={[
                { value: "sharp", label: "Retos" },
                { value: "default", label: "Padrão" },
                { value: "round", label: "Suaves" },
              ]}
            />
          </Section>
          <Section title="Tamanho do texto" description="Escala toda a interface.">
            <Segmented
              label="Tamanho do texto"
              value={prefs.fontSize}
              onChange={fontSize => update({ fontSize })}
              options={[
                { value: "small", label: "A-" },
                { value: "default", label: "A" },
                { value: "large", label: "A+" },
              ]}
            />
          </Section>
        </div>

        <Section title="Acessibilidade" description="Ajustes para conforto e foco.">
          <label className="border-border flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3.5">
            <span>
              <span className="block text-sm font-medium">Reduzir animações</span>
              <span className="text-muted-foreground block text-xs">Remove transições e movimentos da interface.</span>
            </span>
            <Switch checked={prefs.reduceMotion} onCheckedChange={reduceMotion => update({ reduceMotion })} aria-label="Reduzir animações" />
          </label>
        </Section>

        <Section title="Pré-visualização" description="Veja as suas escolhas aplicadas em componentes reais.">
          <LivePreview />
        </Section>

        <div className="border-border flex min-h-5 items-center border-t pt-4">
          <SaveIndicator state={saveState} />
        </div>
    </Card>
  )
}

type Scope = "personal" | "global"

const SCOPES: Array<{ value: Scope; label: string; hint: string; icon: typeof User }> = [
  { value: "personal", label: "Minha aparência", hint: "Só você vê", icon: User },
  { value: "global", label: "Global do servidor", hint: "Afeta todos os usuários", icon: Globe },
]

function ScopeSwitch({ value, onChange }: { value: Scope; onChange: (scope: Scope) => void }) {
  return (
    <div role="radiogroup" aria-label="Escopo das configurações" className="grid gap-2 sm:grid-cols-2">
      {SCOPES.map(scope => {
        const active = scope.value === value
        return (
          <button
            key={scope.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(scope.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150",
              active ? "border-primary/60 bg-primary/[0.06] ring-primary/20 ring-4" : "border-border hover:border-white/20 hover:bg-white/[0.03]",
            )}
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-primary/15 text-primary" : "bg-white/[0.05] text-muted-foreground")}>
              <scope.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{scope.label}</span>
              <span className="text-muted-foreground block text-xs">{scope.hint}</span>
            </span>
            {scope.value === "global" && (
              <Badge variant="outline" className="ml-auto h-5 shrink-0 gap-1 px-1.5 text-[10px] font-medium">
                <Lock className="size-2.5" />
                Staff
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Aparência pessoal: todos os usuários. Identidade global: só quem tem permissão
 * (Staff/Moderadores). O servidor valida a permissão de novo em cada requisição.
 */
export function AppearanceTab({ canManageGlobal }: { canManageGlobal: boolean }) {
  const [scope, setScope] = useState<Scope>("personal")

  if (!canManageGlobal) return <PersonalAppearance />

  return (
    <div className="flex flex-col gap-5">
      <ScopeSwitch value={scope} onChange={setScope} />
      {scope === "personal" ? <PersonalAppearance /> : <BrandingCard />}
    </div>
  )
}
