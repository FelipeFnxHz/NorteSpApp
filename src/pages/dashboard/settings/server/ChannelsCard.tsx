import { Hash, ScrollText } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ServerChannelGroup, ServerSettings } from "@/types"
import { BindingRow, type BindingOption } from "./BindingRow"

interface ChannelsCardProps {
  group: ServerChannelGroup
  options: ServerSettings["options"]
  savingKey: string | null
  onChange: (key: string, channelId: string | null) => void
}

/** Canais do bot (logs ou sistema). Admin escolhe entre os canais de texto; staff só visualiza. */
export function ChannelsCard({ group, options, savingKey, onChange }: ChannelsCardProps) {
  const selectable: BindingOption[] | null = options
    ? options.channels.map(channel => ({ value: channel.id, label: `#${channel.name}`, group: channel.category }))
    : null
  const Icon = group.id === "logs" ? ScrollText : Hash

  return (
    <Card className="px-4 sm:px-6">
      <h3 className="mb-1 flex items-center gap-2 font-semibold">
        <Icon className="size-4" />
        {group.label}
      </h3>
      <p className="text-muted-foreground mb-5 text-xs">{group.description}</p>

      <div className="flex flex-col">
        {group.items.map(item => (
          <BindingRow
            key={item.key}
            label={item.label}
            leading={<span className="bg-white/[0.05] text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg"><Hash className="size-4" /></span>}
            status={item.status}
            value={item.channelId}
            readOnlyText={item.name ? `#${item.name}` : "—"}
            options={selectable}
            saving={savingKey === item.key}
            placeholder="— Nenhum —"
            onChange={channelId => onChange(item.key, channelId)}
          />
        ))}
      </div>
    </Card>
  )
}
