import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDiscord } from "@fortawesome/free-brands-svg-icons"

export function DiscordIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faDiscord} className={className} aria-hidden="true" />
}
