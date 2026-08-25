# R3F — what is what

Everything used in `Interactive_plane`, with props and what they're for.

Versions in this project: `@react-three/fiber` 9.7, `@react-three/drei` 10.7, `@react-three/cannon` 6.6, `three` 0.185.

## What is a Canvas

A Canvas is a declarative component used to create a scene etc. in react three fibre its a full package. when i say declarative i mean that it handles everything automatically you just state what you want.

(Full prop table further down.)

## The one rule that explains the syntax

There are **two kinds of element** in an R3F tree:

| Kind | Example | What it is |
| --- | --- | --- |
| **Capitalized** | `<Canvas>`, `<Physics>`, `<OrbitControls>`, `<Earth>` | Real React components. Someone wrote them, you import them. |
| **lowercase** | `<mesh>`, `<planeGeometry>`, `<ambientLight>` | Not components. R3F capitalizes the tag name and looks it up on the `THREE` namespace. `<meshStandardMaterial />` **is** `new THREE.MeshStandardMaterial()`. |

You never import the lowercase ones, and there's no list of them in the R3F docs — **the list is the entire three.js API**. `<torusKnotGeometry>`, `<pointLight>`, `<fog>`, `<gridHelper>` all work right now, with nothing installed.

## The three kinds of prop

| Syntax | Means | Watch out |
| --- | --- | --- |
| `args={[100, 100]}` | Constructor arguments | Changing `args` **destroys and rebuilds** the object — React can't re-run a constructor. Never put animated values here. |
| `map={texture}`, `intensity={0.6}` | A property assigned after construction | Just `obj.map = texture`. Anything the class exposes works. |
| `position-x={5}`, `material-color="red"` | Dot-path into nested properties | Shorthand for `obj.position.x = 5`. Works to any depth. |
| `attach='geometry'` | How the child binds to its parent | A geometry isn't a *child* of a mesh in three.js, it's `mesh.geometry = …`. R3F already knows this for geometries and materials, so writing it is redundant. |

---

## `@react-three/fiber`

### `<Canvas>`

The boundary between DOM and 3D. Creates the WebGL renderer, a `Scene`, a default camera, the render loop, and a raycaster for pointer events. Provides the R3F context, so `useThree` / `useFrame` / cannon hooks only work **inside** it. Also wraps children in its own `<Suspense>`, which is why suspending hooks like `useTexture` are safe in here and not outside.

| Prop | Type | What it's for |
| --- | --- | --- |
| `camera` | object | **Initial** camera config: `{ position, fov, near, far, zoom }`. Defaults to a PerspectiveCamera at `[0,0,5]`, `fov: 75`. R3F calls `lookAt(0,0,0)` for you *unless* you pass `rotation`. See the gotcha below. |
| `shadows` | `boolean \| 'basic' \| 'percentage' \| 'soft' \| 'variance'` | Turns on the shadow map. Needed *plus* `castShadow` on the light and `receiveShadow` on receivers. |
| `dpr` | `number \| [min, max]` | Pixel ratio. `[1, 2]` is the standard clamp — keeps retina sharp without rendering 4× the pixels. |
| `gl` | object | Props for the renderer: `{ antialias, alpha, powerPreference, toneMapping }`. |
| `orthographic` | boolean | Use an OrthographicCamera instead (no perspective — isometric look). |
| `frameloop` | `'always' \| 'demand' \| 'never'` | `'demand'` only renders when something changes — big battery win for static scenes. `'never'` means you drive it yourself. |
| `flat` | boolean | `NoToneMapping` instead of ACES Filmic. Use for flat/pixel-art looks. |
| `linear` | boolean | Switches off sRGB encoding and gamma correction. |
| `legacy` | boolean | Disables three r139+ colour management. |
| `performance` | object | Adaptive performance — `{ min, max, debounce }` for movement regression. |
| `raycaster` | object | Props for the default raycaster (e.g. `{ params }` to change pointer hit testing). |
| `scene` | `Scene \| object` | Supply your own scene, or props for the default one (e.g. `{ fog }`). |
| `eventSource` | `HTMLElement \| RefObject` | Listen for pointer events on a different element — for HTML overlaid on the canvas. |
| `eventPrefix` | `'offset' \| 'client' \| 'page' \| 'layer' \| 'screen'` | Which coordinate space pointer events use. Default `'offset'`. |
| `resize` | object | Options passed to `react-use-measure`, e.g. `{ debounce: 0 }`. |
| `fallback` | ReactNode | Shown if WebGL isn't available — like `img`'s `alt`. |
| `onCreated` | `(state) => void` | Escape hatch, runs once with the full R3F state. |
| `onPointerMissed` | `(e) => void` | Fires on a click that hit nothing. Good for "deselect". |
| `style` / `className` | | Applied to the wrapper div. **`<Canvas>` is `height: 100%` and has no intrinsic size** — it fills its parent, so the parent needs a real height. |

### Hooks

| Hook | Signature | What it's for |
| --- | --- | --- |
| `useThree` | `useThree(selector?)` | Reads R3F state: `gl`, `scene`, `camera`, `size`, `viewport`, `clock`, `controls`, `raycaster`, `invalidate`, `advance`, `set`, `get`. Always pass a selector (`useThree(s => s.camera)`) so you only re-render on that slice. |
| `useFrame` | `useFrame((state, delta) => {}, priority?)` | Runs every frame, before the render. **Multiply movement by `delta`** or speed depends on framerate. Mutate objects directly here — never `setState`. |
| `useLoader` | `useLoader(Loader, url, extensions?, onProgress?)` | Suspense-based asset loading with a global cache. drei's `useTexture` wraps it. |

---

## three.js elements (the lowercase ones)

### Shared by every `Object3D` — `<mesh>`, lights, `<group>`, cameras

| Prop | What it's for |
| --- | --- |
| `position` | `[x, y, z]`. **Don't set this on a mesh that cannon controls** — it gets overwritten every frame. |
| `rotation` | `[x, y, z]` in **radians**. `Math.PI` = 180°, `Math.PI / 2` = 90°. |
| `scale` | `number` or `[x, y, z]`. |
| `quaternion` | Alternative to `rotation`, no gimbal lock. |
| `visible` | Hide without unmounting — cheaper than conditional rendering. |
| `castShadow` / `receiveShadow` | Opt in per object. Both needed, on the caster and the receiver. |
| `renderOrder` | Manual draw-order override. Mostly for sorting transparent objects. |
| `frustumCulled` | Set `false` to stop three skipping it when it thinks it's off-screen. |
| `name` / `userData` | Your own labels and metadata. Useful for `scene.getObjectByName()`. |
| `layers` | Visibility channels — lets one camera see objects another can't. |
| `onClick`, `onPointerOver`, `onPointerOut`, `onPointerMove`, `onPointerDown`, `onPointerUp`, `onDoubleClick`, `onContextMenu`, `onWheel` | R3F raycasts pointer events onto real geometry. The event carries `point`, `distance`, `face`, `object`, and `stopPropagation()`. |

### `<mesh>`

`new THREE.Mesh()` — the thing that actually renders. Geometry (shape) + material (appearance) + transform. Needs one of each as children.

### Geometries — the shape

| Element | `args` | Notes |
| --- | --- | --- |
| `<planeGeometry>` | `[width, height, widthSegments?, heightSegments?]` | A flat rectangle in the **XY plane facing +Z**. That's exactly why a floor needs `rotation={[-Math.PI/2, 0, 0]}`. |
| `<boxGeometry>` | `[width, height, depth, wSeg?, hSeg?, dSeg?]` | The cube. Your blocks. |
| `<sphereGeometry>` | `[radius, widthSegments?, heightSegments?]` | Segments are the poly count — 32/16 is a sane default. |
| `<cylinderGeometry>` | `[radiusTop, radiusBottom, height, radialSegments?]` | Set `radiusTop: 0` for a cone. |

Segment counts only matter if you're deforming the geometry or need smooth curves. A flat floor wants `1, 1`.

### Materials — the appearance

| Element | Responds to light? | Use for |
| --- | --- | --- |
| `<meshStandardMaterial>` | Yes (PBR) | The default choice. Realistic lighting. |
| `<meshBasicMaterial>` | **No** | Flat colour, ignores all lights. **The best debugging tool in three.js** — see below. |
| `<meshLambertMaterial>` | Yes (cheap) | Fast diffuse-only shading. |
| `<meshPhysicalMaterial>` | Yes (PBR+) | Standard plus clearcoat, transmission, iridescence. Expensive. |

`<meshStandardMaterial>` props:

| Prop | What it's for |
| --- | --- |
| `map` | The colour / albedo texture. |
| `color` | Tint, multiplied with `map`. Leave at white unless you mean to tint. |
| `roughness` | 0 = mirror, 1 = fully matte. |
| `metalness` | 0 = dielectric, 1 = metal. Metals need an `envMap` to look right. |
| `normalMap` | Fakes surface detail via lighting. No extra geometry. |
| `aoMap` | Baked ambient occlusion — contact shadows in crevices. |
| `displacementMap` | Actually moves vertices. Needs geometry segments to have any effect. |
| `emissive` / `emissiveIntensity` | Self-lit colour. Doesn't light other objects (that needs bloom). |
| `transparent` + `opacity` | `transparent` must be `true` for `opacity` to do anything. |
| `alphaMap` | Per-pixel transparency from a texture. |
| `side` | `FrontSide` (default), `BackSide`, `DoubleSide`. A plane is invisible from behind unless `DoubleSide`. |
| `wireframe` | Draw edges only. Great for seeing what your geometry actually is. |
| `flatShading` | Faceted instead of smooth. |
| `envMapIntensity` | How strongly the environment reflects. |

### Lights

| Element | Key props | What it's for |
| --- | --- | --- |
| `<ambientLight>` | `intensity`, `color` | Uniform light from **no direction**. No shading, no shadows. Purely the "don't let unlit faces go pure black" knob. Alone, everything looks like a flat silhouette. |
| `<directionalLight>` | `intensity`, `color`, `position`, `castShadow`, `target` | Parallel rays, like the sun. **Only the direction matters, not the distance** — `position` just expresses a direction toward its target (origin by default). This is what produces shading. |
| `<pointLight>` | `intensity`, `distance`, `decay` | A bulb, radiating in all directions. Falls off with distance. Torches, lava. |
| `<spotLight>` | `angle`, `penumbra`, `distance`, `decay` | A cone. `penumbra` softens the edge. |
| `<hemisphereLight>` | `color`, `groundColor`, `intensity` | Sky colour from above, bounce colour from below. Cheap and convincing outdoor fill. |

Shadow tuning happens through dot-paths: `shadow-mapSize={[2048, 2048]}` for resolution, and `shadow-camera-left/right/top/bottom/near/far` to fit the shadow frustum tightly around your scene. Too loose a frustum is the usual cause of blocky shadows.

---

## `@react-three/cannon`

### `<Physics>`

The physics world's context provider. **Not an `Object3D`** — it renders no 3D node, only context. Any component calling a body hook must live underneath it. The simulation runs in a **web worker**, on its own clock, independent of the render loop.

| Prop | Default | What it's for |
| --- | --- | --- |
| `gravity` | `[0, -9.81, 0]` | World gravity. Lower it for floaty, moon-like movement. |
| `isPaused` | `false` | Freeze the simulation. |
| `stepSize` | `1/60` | Fixed timestep. Smaller = more accurate, more CPU. |
| `maxSubSteps` | `10` | How many catch-up steps allowed after a slow frame. |
| `iterations` | `5` | Solver iterations. Raise if stacked bodies jitter or sink. |
| `tolerance` | `0.001` | Solver convergence threshold. |
| `allowSleep` | `false` | Let idle bodies stop being simulated. Big win with many bodies. |
| `broadphase` | `'Naive'` | `'SAP'` is much faster for many bodies — worth it for a voxel world. |
| `axisIndex` | `0` | Which axis SAP sorts along. |
| `defaultContactMaterial` | | `{ friction, restitution }` — global bounciness and grip. |
| `frictionGravity` | | Separate gravity used for friction, for non-standard setups. |
| `quatNormalizeFast` / `quatNormalizeSkip` | | Accuracy-vs-speed knobs on quaternion normalisation. |
| `shouldInvalidate` | `true` | Whether stepping triggers an R3F re-render. Set `false` with `frameloop='demand'`. |
| `size` | `1000` | Max number of bodies to allocate for. |
| `solver` | `'GS'` | `'GS'` (Gauss-Seidel) or `'Split'`. |

### Body hooks

`usePlane`, `useBox`, `useSphere`, `useCylinder`, `useTrimesh`, `useHeightfield`, `useParticle`, `useConvexPolyhedron`, `useCompoundBody`.

All share the signature `useXxx(() => config, fwdRef?, deps?)` and return `[ref, api]`.

The config is a **factory function**, not an object — cannon calls it, and with `useBox` it calls it once per instance for instanced bodies.

| Config prop | What it's for |
| --- | --- |
| `mass` | **Defaults to `0`, and `mass <= 0` means the body is Static.** This is why a floor with no `mass` doesn't fall. |
| `type` | `'Dynamic'` (moved by forces) / `'Static'` (immovable) / `'Kinematic'` (you move it, it pushes others). Overrides the mass inference. |
| `position` | `[x, y, z]` — set it here, **not** as a mesh prop. |
| `rotation` | `[x, y, z]` radians. Or `quaternion` as `[x, y, z, w]`. |
| `args` | Collider dimensions. Note these are the *physics* shape and are **separate from the visual geometry** — `useBox` args `[1,1,1]` with a `boxGeometry` of `[2,2,2]` gives you a collider half the size of what you see. |
| `material` | `{ friction, restitution }` for this body. `restitution: 1` is a perfect bounce. |
| `velocity` / `angularVelocity` | Starting motion. |
| `linearDamping` / `angularDamping` | Passive drag, `0`–`1`. Stops things sliding forever. |
| `fixedRotation` | Body translates but never rotates. **This is what you want for a player capsule** — otherwise you tip over. |
| `linearFactor` / `angularFactor` | Per-axis multipliers. `[1,1,0]` locks motion to a 2D plane. |
| `collisionFilterGroup` / `collisionFilterMask` | Bitmask channels deciding what collides with what. |
| `collisionResponse` | `false` = detects collisions but passes through. |
| `isTrigger` | A volume that reports overlaps without pushing anything. Checkpoints, pickups. |
| `onCollide` / `onCollideBegin` / `onCollideEnd` | Collision callbacks. `onCollide` gives you `contact.impactVelocity` — how hard the hit was, i.e. fall damage. |
| `allowSleep`, `sleepSpeedLimit`, `sleepTimeLimit` | Per-body sleeping. |
| `userData` | Your own metadata, echoed back in collision events. |

**The `ref` is the whole bridge between the two worlds.** Cannon has a collider with no appearance; three has an appearance with no physics. Cannon writes `position` and `quaternion` into that ref every frame. Nothing else connects them.

### The `api` (second element of the returned tuple)

For imperative control from outside the simulation. Every value is write-only from your side — read it with `.subscribe()`.

| Call | What it's for |
| --- | --- |
| `api.position.set(x, y, z)` | Teleport. Also `.copy(vec3)`. |
| `api.velocity.set(x, y, z)` | Set motion directly. **This is how you do player movement** — not by changing position. |
| `api.rotation.set(x, y, z)` / `api.quaternion.set(x, y, z, w)` | Orientation. |
| `api.applyImpulse(impulse, worldPoint)` | An instant kick. Jumping, explosions. |
| `api.applyForce(force, worldPoint)` | Continuous push, applied over time. |
| `api.applyLocalImpulse` / `applyLocalForce` | Same, in the body's own coordinate space. |
| `api.applyTorque(torque)` | Spin it. |
| `api.mass.set(n)`, `api.material.set({...})` | Change any atomic prop at runtime. |
| `api.velocity.subscribe(cb)` | **How you read a value back.** The worker owns the state, so reads are async through a subscription. Returns an unsubscribe function. |
| `api.sleep()` / `api.wakeUp()` | Manual sleep control. |
| `api.at(index)` | Address one instance of an instanced body. |

---

## `@react-three/drei`

Helper library. Everything here is optional convenience over raw three.js.

### `<OrbitControls>`

Drag to orbit, scroll to zoom, right-drag to pan. Mutates the default camera each frame. **This is how you find a camera position** — fly around until it looks right, then hardcode what you found.

| Prop | What it's for |
| --- | --- |
| `makeDefault` | Publishes it as `state.controls` so other drei helpers can find it — and temporarily disable it, which is how gizmos avoid fighting your mouse. Basically always pass this. |
| `target` | The point being orbited. Default origin. |
| `enablePan` / `enableZoom` / `enableRotate` | Switch off individual gestures. |
| `minDistance` / `maxDistance` | Zoom clamps. |
| `minPolarAngle` / `maxPolarAngle` | Vertical angle clamps. `maxPolarAngle={Math.PI/2}` stops the camera going below the floor. |
| `minAzimuthAngle` / `maxAzimuthAngle` | Horizontal angle clamps. |
| `enableDamping` / `dampingFactor` | Inertia after you let go. On by default, feels good. |
| `autoRotate` / `autoRotateSpeed` | Slow idle spin. Nice for showcases. |
| `rotateSpeed` / `zoomSpeed` / `panSpeed` | Sensitivity. |
| `keyEvents` | Arrow-key panning. |
| `regress` | Drop render quality while moving, restore when idle. |
| `onChange` / `onStart` / `onEnd` | Interaction callbacks. |

Any property of three's underlying `OrbitControls` class works as a prop, not just these.

### Other drei worth knowing here

| Thing | What it's for |
| --- | --- |
| `useTexture(url, onLoad?)` | Loads a texture with suspense + caching. `onLoad` runs in a **layout effect, before the GPU upload** — the correct place to set `wrapS`/`repeat`/`magFilter`. Mutating the returned texture during render is what the React Compiler lint rejects. Also `useTexture.preload(url)`. |
| `<PerspectiveCamera makeDefault position={…} />` | The **reactive** way to control a camera — a real component, so prop changes just apply. |
| `<PointerLockControls />` | FPS mouse-look. Drops into the same slot as OrbitControls when you get to player movement. |
| `<Sky />`, `<Stars />` | Instant atmosphere. |
| `<Environment preset="…" />` | Image-based lighting. Makes `metalness` materials actually look like metal. |
| `<Stats />` | FPS counter overlay. |
| `<Grid />` / `<axesHelper>` | Ground reference and orientation. Invaluable while building. |
| `<Instances>` / `<Merged>` | Draw thousands of identical meshes in one call. **You will need this for a voxel world** — a few thousand individual `<mesh>` elements will not hold framerate. |

---

## This project's own

| Thing | Props / returns | What it does |
| --- | --- | --- |
| `<Earth />` | none | The ground. A `usePlane` static body bridged by ref to a 100×100 textured `<mesh>`. |
| `useEarthTexture()` | returns `Texture` | Loads `dry_grass.png` and configures it: `RepeatWrapping` both axes, `repeat 100×100`, `NearestFilter` for crisp pixels. Config lives in a module-scope `configure` callback so its identity is stable and drei's layout effect runs it once. |

---

## Gotchas worth memorising

**Canvas has no intrinsic size.** It's `height: 100%`, so it needs an unbroken chain of resolved heights above it — `html`, `body`, `#root` all need a height, or use `h-dvh`. Width looks fine regardless because block elements fill their parent's width by default. That asymmetry is why `w-full` seemed to work and `h-full` didn't.

**The `camera` prop is initial config, not a binding.** R3F shallow-compares it against the previous value and **builds a whole new camera** when it differs — discarding wherever the user had orbited to. Keep it a static literal. For anything reactive use `<PerspectiveCamera makeDefault>`; for anything animated grab `useThree(s => s.camera)` and mutate in `useFrame`.

**Projection vs transform.** Changing `fov` / `aspect` / `near` / `far` requires `camera.updateProjectionMatrix()` afterwards. Changing `position` / `rotation` requires nothing. Projection matrices are cached; transforms aren't.

**Cannon's plane collider is infinite.** The 100×100 `planeGeometry` is just a visible window onto an unbounded surface. Walk past the edge and you're still standing on something.

**R3F draws nothing.** It's a reconciler for the three.js *object graph* — React only creates, destroys, and updates objects when JSX changes. The actual drawing happens in a WebGL loop 60×/second, entirely outside React. That's why mutating in `useFrame` is idiomatic, and why `setState` per frame is the classic performance mistake.

**`args` rebuilds, props mutate.** Animated values belong in props or `useFrame`, never in `args`.

### Debugging ladder

| Symptom | First thing to try |
| --- | --- |
| Object renders black | Swap to `<meshBasicMaterial>`. If it appears, it's a **lighting** problem. If it's still invisible, it's **geometry, transform, or camera**. That one swap halves your search space. |
| Nothing renders at all | Check the canvas has a height (DevTools → is the element 0px?). |
| Object invisible from one side | `side={DoubleSide}` — planes are one-sided by default. |
| Can't tell what shape you've got | `wireframe` on the material. |
| Physics body ignores its mesh position | You set `position` as a mesh prop. It belongs in the `usePlane`/`useBox` config. |
| Body falls through the floor | Timestep too coarse for the speed. Lower `stepSize`, raise `iterations`, or use a thicker collider. |
| Movement speed varies with framerate | Multiply by `delta` in `useFrame`. |
| Texture blurry when you wanted pixels | `texture.magFilter = NearestFilter`. |
| Texture stretched instead of tiled | `wrapS` **and** `wrapT` set to `RepeatWrapping`, **and** `repeat.set(x, y)`. All three, or nothing happens. |
| Hook rules not being enforced | Component name must be Capitalized or `use`-prefixed, or the lint plugin skips the whole file. |
