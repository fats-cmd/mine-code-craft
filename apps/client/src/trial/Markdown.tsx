import { Fragment, type ReactNode } from "react"

/**
 * Just enough Markdown for Challenge statements: paragraphs, `- ` lists,
 * fenced code, `inline code`, **bold** and *italic*. Content is ours, but this
 * builds React nodes, never HTML strings.
 */
export default function Markdown({ text }: { text: string }) {
    const blocks: ReactNode[] = []
    const lines = text.replace(/\r\n?/g, "\n").split("\n")
    for (let i = 0; i < lines.length; ) {
        const line = lines[i]
        if (line.startsWith("```")) {
            const body: string[] = []
            for (i++; i < lines.length && !lines[i].startsWith("```"); i++) body.push(lines[i])
            i++
            blocks.push(<pre key={blocks.length} className="my-2 overflow-x-auto rounded bg-black/40 p-3 text-sm">{body.join("\n")}</pre>)
        } else if (/^\s*[-*] /.test(line)) {
            const items: string[] = []
            for (; i < lines.length && /^\s*[-*] /.test(lines[i]); i++) items.push(lines[i].replace(/^\s*[-*] /, ""))
            blocks.push(<ul key={blocks.length} className="my-2 list-disc pl-6">{items.map((t, k) => <li key={k}>{inline(t)}</li>)}</ul>)
        } else if (line.trim() === "") {
            i++
        } else {
            const para: string[] = []
            for (; i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("```") && !/^\s*[-*] /.test(lines[i]); i++) para.push(lines[i])
            blocks.push(<p key={blocks.length} className="my-2">{inline(para.join(" "))}</p>)
        }
    }
    return <div className="leading-relaxed">{blocks}</div>
}

function inline(text: string): ReactNode {
    return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return <code key={i} className="rounded bg-black/40 px-1 text-amber-200">{part.slice(1, -1)}</code>
        if (part.startsWith("**") && part.endsWith("**") && part.length > 3) return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith("*") && part.endsWith("*") && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>
        return <Fragment key={i}>{part}</Fragment>
    })
}
