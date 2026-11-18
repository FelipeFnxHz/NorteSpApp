import type { ReactNode } from "react"

/** Menções do Discord viram texto legível; **negrito** vira <strong>. */
export function cleanLogText(text: string): string {
  return text
    .replace(/<@&\d+>/g, "@cargo")
    .replace(/<@!?\d+>/g, "@usuário")
    .replace(/<#\d+>/g, "#canal")
    .replace(/`/g, "")
}

export function renderLogText(text: string): ReactNode[] {
  return cleanLogText(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      ),
    )
}
