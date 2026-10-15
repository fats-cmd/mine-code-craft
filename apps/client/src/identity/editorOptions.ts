import {
    ACCENT_COLORS,
    BODY_COLORS,
    BOTTOMS,
    BUILD,
    CLOTH_COLORS,
    HAIR,
    HEADWEAR,
    IDLE,
    SHOES,
    SKIN_COLORS,
    TOP,
    VISOR,
    type AvatarPart,
    type Look,
    type PaintMark,
} from "@mcc/shared"
import { rigFor } from "../avatar/avatarVoxels"

// What the character editor offers, and how it names things. Option ids live
// in packages/shared/src/identity.ts (the server checks them); labels are
// presentation only.

export const LABELS: Record<string, string> = {
    // hair
    none: "None", spiky: "Spiky", bun: "Bun", mohawk: "Mohawk", messy: "Messy", long: "Long", buzz: "Buzz cut", flame: "Flame",
    // headwear
    cap: "Cap", beanie: "Beanie", headband: "Headband", crown: "Crown",
    // eyes
    eyes: "Plain", band: "Visor band", goggles: "Goggles", shades: "Shades",
    // tops
    tee: "T-shirt", hoodie: "Hoodie", jacket: "Open jacket", tank: "Tank top", bare: "No top",
    // bottoms
    pants: "Trousers", shorts: "Shorts", baggy: "Baggy", skirt: "Skirt",
    // shoes
    sneakers: "Sneakers", boots: "Boots", sandals: "Sandals",
    // build
    slim: "Slim", regular: "Regular", broad: "Broad",
    // stance
    relaxed: "Relaxed", pockets: "Hands in pockets", fighter: "Fighter", proud: "Hands on hips",
}
/** "long" means long hair in the Hair tab and long sleeves in the Top tab. */
export const label = (id: string, slot?: string) => (id === "long" && slot === "top" ? "Long sleeves" : (LABELS[id] ?? id))

export type TabId = "body" | "hair" | "head" | "top" | "bottoms" | "shoes" | "paint"

/** Where the camera goes for each tab: target height (m) and distance. */
export const FOCUS: Record<"full" | "head" | "body" | "legs" | "feet", { y: number; distance: number }> = {
    full: { y: 0.92, distance: 5.4 },
    head: { y: 1.65, distance: 2.7 },
    body: { y: 1.05, distance: 3 },
    legs: { y: 0.45, distance: 2.8 },
    feet: { y: 0.15, distance: 2.2 },
}
export type FocusId = keyof typeof FOCUS

export const TABS: { id: TabId; label: string; focus: FocusId }[] = [
    { id: "body", label: "Body", focus: "full" },
    { id: "hair", label: "Hair", focus: "head" },
    { id: "head", label: "Face & hats", focus: "head" },
    { id: "top", label: "Top", focus: "body" },
    { id: "bottoms", label: "Bottoms", focus: "legs" },
    { id: "shoes", label: "Shoes", focus: "feet" },
    { id: "paint", label: "Paint", focus: "full" },
]

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]

/** A random outfit. Paint is kept: it's the part of a look that takes effort. */
export function randomLook(keep: Look): Look {
    return {
        body: pick(BODY_COLORS),
        skin: pick(SKIN_COLORS),
        accent: pick(ACCENT_COLORS),
        hair: pick(HAIR),
        headwear: Math.random() < 0.6 ? "none" : pick(HEADWEAR),
        visor: Math.random() < 0.6 ? "eyes" : pick(VISOR),
        top: pick(TOP),
        bottoms: pick(BOTTOMS),
        bottomsColor: pick(CLOTH_COLORS),
        shoes: pick(SHOES),
        shoesColor: pick(CLOTH_COLORS),
        build: pick(BUILD),
        idle: pick(IDLE),
        paint: keep.paint,
    }
}

const MIRROR_PART: Record<AvatarPart, AvatarPart> = { head: "head", torso: "torso", armL: "armR", armR: "armL", legL: "legR", legR: "legL" }

/**
 * The same voxel on the other side of the body. Head and torso are built
 * symmetric around x = 0; each arm and leg is built around its own pivot, so
 * the mirror swaps sides and flips within the limb.
 */
export function mirrorMark(m: PaintMark, look: Look): PaintMark {
    const rig = rigFor(look.build)
    const part = MIRROR_PART[m.part]
    if (part === m.part) return { ...m, x: -m.x }
    const width = m.part.startsWith("arm") ? rig.armWidth : rig.legWidth
    const [lo, hi] = width === 3 ? [-1, 1] : [-1, 0]
    return { ...m, part, x: lo + hi - m.x }
}

export const markKey = (m: Pick<PaintMark, "part" | "x" | "y" | "z">) => `${m.part}:${m.x}:${m.y}:${m.z}`
