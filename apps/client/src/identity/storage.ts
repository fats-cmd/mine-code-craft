import { DEFAULT_LOOK, checkName, parseLook, type JoinOptions } from "@mcc/shared"

const KEY = "mcc.identity.v1"

/**
 * The guest identity from last visit, if any. Storage can be missing or
 * throw (private windows, blocked site data), so this never fails: it falls
 * back to an empty name and the default look.
 */
export function loadIdentity(): JoinOptions {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<JoinOptions> | null
        const name = checkName(raw?.name)
        return { name: name.ok ? name.name : "", look: parseLook(raw?.look) }
    } catch {
        return { name: "", look: DEFAULT_LOOK }
    }
}

export function saveIdentity(identity: JoinOptions): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(identity))
    } catch {
        // Not fatal: the player just picks again next visit.
    }
}
