import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useKeyboard } from "../custom_hooks/hooks/useKeyboard";

const SPEED = 4;
const JUMP_FORCE = 4;
const PLAYER_RADIUS = 0.5;
// Vertical velocity below this counts as "not moving vertically", i.e. grounded.
const GROUNDED_THRESHOLD = 0.05;

// Hoisted out of the frame loop: reused every frame instead of reallocated 60x/sec.
const frontVector = new Vector3();
const sideVector = new Vector3();
const direction = new Vector3();

export default function Player() {
    const { camera } = useThree();

    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: "Dynamic",
        position: [0, 1, 10],
        args: [PLAYER_RADIUS],
        fixedRotation: true, // a player that rolls is not a player
    }));

    const actions = useKeyboard();

    // Local mirrors of state the physics worker owns. The worker is the source
    // of truth; these let us read it synchronously inside useFrame.
    const position = useRef<[number, number, number]>([0, 1, 10]);
    const velocity = useRef<[number, number, number]>([0, 0, 0]);

    // subscribe() returns its own unsubscribe, so returning it is the whole
    // cleanup. Without it, every HMR reload stacks up another subscription.
    useEffect(() => api.position.subscribe((p) => (position.current = p)), [api.position]);
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

    useFrame(() => {
        camera.position.fromArray(position.current);

        // Turn key state into a direction, then rotate it by the camera so
        // "forward" means where you are looking, not a fixed world axis.
        frontVector.set(0, 0, Number(actions.moveBackward) - Number(actions.moveForward));
        sideVector.set(Number(actions.moveLeft) - Number(actions.moveRight), 0, 0);
        direction.subVectors(frontVector, sideVector).applyEuler(camera.rotation);

        // Flatten to the horizontal plane, then normalise: this both stops
        // diagonals travelling 1.41x faster and stops looking up or down from
        // changing your walking speed.
        direction.y = 0;
        direction.normalize().multiplyScalar(SPEED);

        const grounded = Math.abs(velocity.current[1]) < GROUNDED_THRESHOLD;

        // One write per frame. X and Z come from input; Y passes straight
        // through so gravity keeps accumulating, except on the jump frame.
        api.velocity.set(
            direction.x,
            actions.jump && grounded ? JUMP_FORCE : velocity.current[1],
            direction.z,
        );
    });

    return <mesh ref={ref} />;
}
