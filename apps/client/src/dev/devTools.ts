import { useControls } from "leva"

/** Add ?debug to the URL for the tweak panel, the performance overlay and collider outlines. */
export const DEV_TOOLS = new URLSearchParams(window.location.search).has("debug")

/**
 * Switches in the Leva panel. Register any value you want to tune live here
 * (or with your own useControls in the component that uses it): it only
 * shows up with ?debug, and normal players get the defaults.
 */
export function useDevControls() {
    const { colliders, perf } = useControls("Debug", {
        colliders: { value: true, label: "draw colliders" },
        perf: { value: true, label: "perf overlay" },
    })
    return { physicsDebug: DEV_TOOLS && colliders, showPerf: DEV_TOOLS && perf }
}
