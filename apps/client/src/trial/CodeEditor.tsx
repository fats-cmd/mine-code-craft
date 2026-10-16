import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { indentUnit } from "@codemirror/language"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import type { Language } from "@mcc/shared"

/**
 * CodeMirror 6 in Python or JS mode. Uncontrolled: `initial` seeds it once,
 * `onChange` reports edits. Give it a `key` that changes with the Challenge
 * and language so switching starts a fresh editor.
 */
export default function CodeEditor({
    initial,
    language,
    onChange,
    readOnly = false,
    onRun,
}: {
    initial: string
    language: Language
    onChange?: (text: string) => void
    readOnly?: boolean
    /** Ctrl/Cmd+Enter. */
    onRun?: () => void
}) {
    const host = useRef<HTMLDivElement>(null)
    // The editor is built once; read the latest callbacks through refs.
    const change = useRef(onChange)
    const run = useRef(onRun)
    useEffect(() => {
        change.current = onChange
        run.current = onRun
    })

    useEffect(() => {
        const view = new EditorView({
            parent: host.current!,
            state: EditorState.create({
                doc: initial,
                extensions: [
                    basicSetup,
                    keymap.of([
                        { key: "Mod-Enter", run: () => (run.current?.(), true) },
                        indentWithTab,
                    ]),
                    language === "python" ? python() : javascript(),
                    indentUnit.of(language === "python" ? "    " : "  "),
                    oneDark,
                    EditorView.theme({ "&": { height: "100%", fontSize: "14px" }, ".cm-scroller": { fontFamily: "ui-monospace, monospace" } }),
                    EditorState.readOnly.of(readOnly),
                    EditorView.editable.of(!readOnly),
                    EditorView.updateListener.of((u) => {
                        if (u.docChanged) change.current?.(u.state.doc.toString())
                    }),
                ],
            }),
        })
        return () => view.destroy()
        // Seeded once per mount by design (see the doc comment).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <div ref={host} className="h-full overflow-hidden rounded border border-white/10" />
}
