import type { Language } from "@mcc/shared"

// The player's code per Challenge and language, kept in this browser only.
// Storage can be missing or blocked; then drafts just don't persist.
const key = (slug: string, language: Language) => `mcc.draft.${slug}.${language}`

export function loadDraft(slug: string, language: Language): string | null {
    try {
        return localStorage.getItem(key(slug, language))
    } catch {
        return null
    }
}

export function saveDraft(slug: string, language: Language, text: string | null) {
    try {
        if (text === null) localStorage.removeItem(key(slug, language))
        else localStorage.setItem(key(slug, language), text)
    } catch {
        // not persisted; fine
    }
}
