import { useMemo, useState } from "react"
import { ArrowRight, Calculator, Percent, Repeat } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMoney } from "@/lib/modules"

const num = (value: string) => {
  const parsed = Number(value.replace(/\./g, "").replace(",", "."))
  return Number.isFinite(parsed) ? parsed : 0
}

function Field({ label, value, onChange, suffix, hint }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <div className="relative">
        <Input inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} className={suffix ? "pr-10" : ""} />
        {suffix && <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">{suffix}</span>}
      </div>
      {hint && <span className="text-muted-foreground text-[11px]">{hint}</span>}
    </div>
  )
}

function Result({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="border-border/60 bg-foreground/[0.03] flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${tone === "good" ? "text-[#34d399]" : tone === "bad" ? "text-[#f0464f]" : ""}`}>{value}</span>
    </div>
  )
}

function TransferTab() {
  const [amount, setAmount] = useState("100000")
  const [fee, setFee] = useState("5")
  const result = useMemo(() => { const a = num(amount); const f = a * (num(fee) / 100); return { fee: f, net: a - f } }, [amount, fee])
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-4"><Field label="Valor da troca" value={amount} onChange={setAmount} suffix="$" /><Field label="Taxa da transação" value={fee} onChange={setFee} suffix="%" hint="Use a taxa praticada no servidor." /></div>
      <div className="grid gap-3 sm:grid-cols-3"><Result label="Taxa cobrada" value={formatMoney(Math.round(result.fee))} tone="bad" /><Result label="Destinatário recebe" value={formatMoney(Math.round(result.net))} tone="good" /><Result label="Custo total" value={formatMoney(num(amount))} /></div>
    </div>
  )
}

function ConvertTab() {
  const [amount, setAmount] = useState("1000")
  const [rate, setRate] = useState("10")
  const [reverse, setReverse] = useState(false)
  const a = num(amount), r = num(rate)
  const out = r > 0 ? (reverse ? a / r : a * r) : 0
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-4">
        <Field label={reverse ? "Quantidade em coins" : "Quantidade em dinheiro ($)"} value={amount} onChange={setAmount} />
        <Field label="Cotação" value={rate} onChange={setRate} hint="1 coin = quantos $ no servidor." />
        <button type="button" onClick={() => setReverse(v => !v)} className="text-primary flex w-fit items-center gap-1.5 text-xs font-medium hover:underline"><Repeat className="size-3.5" /> Inverter sentido ({reverse ? "coins → $" : "$ → coins"})</button>
      </div>
      <div className="grid content-start gap-3"><Result label={reverse ? "Você recebe em dinheiro" : "Você recebe em coins"} value={reverse ? formatMoney(Math.round(out)) : `${out.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} coins`} tone="good" /></div>
    </div>
  )
}

function CompanyTab() {
  const [revenue, setRevenue] = useState("500000")
  const [tax, setTax] = useState("12")
  const [costs, setCosts] = useState("80000")
  const [partners, setPartners] = useState("2")
  const r = useMemo(() => {
    const gross = num(revenue), taxValue = gross * (num(tax) / 100), profit = gross - taxValue - num(costs)
    return { taxValue, profit, share: profit / Math.max(1, Math.round(num(partners))) }
  }, [revenue, tax, costs, partners])
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="grid gap-4"><Field label="Faturamento bruto" value={revenue} onChange={setRevenue} suffix="$" /><Field label="Imposto sobre o faturamento" value={tax} onChange={setTax} suffix="%" /><Field label="Custos operacionais" value={costs} onChange={setCosts} suffix="$" /><Field label="Sócios (rateio do lucro)" value={partners} onChange={setPartners} /></div>
      <div className="grid content-start gap-3 sm:grid-cols-2"><Result label="Imposto a pagar" value={formatMoney(Math.round(r.taxValue))} tone="bad" /><Result label="Lucro líquido" value={formatMoney(Math.round(r.profit))} tone={r.profit >= 0 ? "good" : "bad"} /><Result label="Por sócio" value={formatMoney(Math.round(r.share))} /></div>
    </div>
  )
}

export function CalculatorPage() {
  const [tab, setTab] = useState("transfer")
  return (
    <DashboardLayout title="Calculadora de Economia" description="Simule trocas, conversões e impostos de empresa antes de fazer no jogo. Tudo é calculado no seu navegador.">
      <Card className="gap-5 px-4 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="transfer"><ArrowRight className="size-4" /> Troca de dinheiro</TabsTrigger>
            <TabsTrigger value="convert"><Repeat className="size-4" /> Conversão de coins</TabsTrigger>
            <TabsTrigger value="company"><Percent className="size-4" /> Impostos de empresa</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "transfer" && <TransferTab />}
        {tab === "convert" && <ConvertTab />}
        {tab === "company" && <CompanyTab />}
        <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]"><Calculator className="size-3.5" /> Valores e taxas são simulações: confirme as regras vigentes do servidor.</p>
      </Card>
    </DashboardLayout>
  )
}
