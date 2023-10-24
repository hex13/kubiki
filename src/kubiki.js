export function createFloor(room) {
    const left = - room.width / 2;
    const right = room.width / 2;
    const top = - room.height / 2;
    const bottom = room.height / 2;

    return new Float32Array([
        left, 0, top,
        left, 0, bottom,
        right, 0, top,

        left, 0, bottom,
        right, 0, bottom,
        right, 0, top,
    ]);
}