export function createFloor(room) {
    const left = room.position.x - room.width / 2;
    const right = room.position.x + room.width / 2;
    const top = room.position.z - room.height / 2;
    const bottom = room.position.z + room.height / 2;

    return new Float32Array([
        left, 0, top,
        left, 0, bottom,
        right, 0, top,

        left, 0, bottom,
        right, 0, bottom,
        right, 0, top,
    ]);
}


export function createWalls(room) {
    const vertices = [];
    let x = room.position.x - room.width / 2;
    let z = room.position.z + room.height / 2;
    let angle = 0;

    const createWall = (length, turn, isBreak = false) => {
        angle += turn;
        const nextX = x + length * Math.cos(angle);
        const nextZ = z + length * Math.sin(angle);
        if (!isBreak) {
            vertices.push(...[
                x, floor, z,
                nextX, floor, nextZ,
                x, ceiling, z,

                x, ceiling, z,
                nextX, floor, nextZ,
                nextX, ceiling, nextZ,
            ]);
        }
        x = nextX;
        z = nextZ;
    }
    const floor = 0;
    const ceiling = 1;
    const length = room.width;
    const doorOffset = 1;
    const doorWidth = 1;
    createWall(doorOffset, 0);
    createWall(doorWidth, 0, true);
    createWall(length - doorWidth - doorOffset, 0);
    createWall(room.height, - Math.PI * 0.5);
    createWall(room.width, - Math.PI * 0.5);
    createWall(room.height, - Math.PI * 0.5);

    return new Float32Array(vertices);
}