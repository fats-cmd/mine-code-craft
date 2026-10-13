/** True while a text field has focus: game keys (WASD, Space) must not move the avatar. */
export function isTyping(): boolean {
    const el = document.activeElement
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable)
}
