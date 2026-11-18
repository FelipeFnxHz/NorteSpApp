import { Building2, LayoutDashboard, Settings, Shield, Ticket, UserPlus, Users } from "lucide-react"

const NAV = [LayoutDashboard, Building2, Ticket, Users, Settings]

const CORPS = [
  { name: "Polícia Militar", short: "PM", color: "#5b8def", patentes: 12, people: 48 },
  { name: "Samu", short: "SM", color: "#f0616d", patentes: 6, people: 21 },
  { name: "Bombeiros", short: "BB", color: "#f59e42", patentes: 8, people: 17 },
]

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="bg-primary/20 absolute -inset-6 -z-10 rounded-[40px] blur-3xl" />

      <div className="glass overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
        <div className="border-border flex items-center gap-2 border-b bg-white/[0.02] px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="text-muted-foreground mx-auto min-w-0 truncate rounded-md bg-white/[0.04] px-4 py-1 text-[11px] sm:px-16">
            dashboard / corporações
          </span>
        </div>

        <div className="flex">
          <div className="border-border hidden flex-col items-center gap-3 border-r bg-black/20 px-3.5 py-4 sm:flex">
            {NAV.map((Icon, index) => (
              <span
                key={index}
                className={
                  index === 1
                    ? "bg-primary/15 text-primary grid size-9 place-items-center rounded-lg"
                    : "text-muted-foreground grid size-9 place-items-center rounded-lg"
                }
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold">Corporações</p>
                <p className="text-muted-foreground text-[11px]">Hierarquia e efetivo em um só lugar</p>
              </div>
              <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">
                <UserPlus className="size-3" />
                Contratar
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {CORPS.map(corp => (
                <div key={corp.name} className="border-border rounded-xl border bg-white/[0.03] p-3">
                  <div
                    className="mb-3 grid size-9 place-items-center rounded-lg text-xs font-bold"
                    style={{ background: `${corp.color}26`, color: corp.color }}
                  >
                    {corp.short}
                  </div>
                  <p className="text-[13px] font-semibold">{corp.name}</p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                    <Shield className="size-3" />
                    {corp.patentes} patentes · {corp.people} pessoas
                  </p>
                </div>
              ))}
            </div>

            <div className="border-border mt-3 overflow-hidden rounded-xl border">
              {["Sd. Almeida", "Cb. Ferreira", "Sgt. Ribeiro"].map((name, index) => (
                <div
                  key={name}
                  className="border-border flex items-center gap-3 border-b bg-white/[0.02] px-3 py-2.5 last:border-0"
                >
                  <span className="bg-secondary grid size-6 place-items-center rounded-full text-[9px] font-bold">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex-1 text-xs font-medium">{name}</span>
                  <span className="bg-accent/12 text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {index === 2 ? "Afastado" : "Ativo"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass animate-float absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-xl px-4 py-3 shadow-xl sm:flex">
        <span className="bg-accent/15 text-accent grid size-8 place-items-center rounded-lg">
          <UserPlus className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">Novo contratado</p>
          <p className="text-muted-foreground text-[11px]">Sd. Almeida entrou na PM</p>
        </div>
      </div>
    </div>
  )
}
