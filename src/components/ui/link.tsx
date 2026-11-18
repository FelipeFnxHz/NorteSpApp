import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useRouter } from '@/contexts/RouterContext'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string
}

export function Link({ to, onClick, ...rest }: LinkProps) {
    const { navigate } = useRouter()

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        onClick?.(event)
        if (event.defaultPrevented) return
        // Let modified clicks (new tab, etc.) behave natively.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return

        event.preventDefault()
        navigate(to)
    }

    return <a href={to} onClick={handleClick} {...rest} />
}