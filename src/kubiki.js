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


export function createWalls(room) {
    const vertices = [];
    let x = - room.width / 2;
    let z = room.height / 2;
    let angle = 0;

    const createWall = (length, turn) => {
        angle += turn;
        const nextX = x + length * Math.cos(angle);
        const nextZ = z + length * Math.sin(angle);

        vertices.push(...[
            x, floor, z,
            nextX, floor, nextZ,
            x, ceiling, z,

            x, ceiling, z,
            nextX, floor, nextZ,
            nextX, ceiling, nextZ,
        ]);
        x = nextX;
        z = nextZ;
    }
    const floor = 0;
    const ceiling = 1;

    createWall(room.width, 0);
    createWall(room.height, - Math.PI * 0.5);
    createWall(room.width, - Math.PI * 0.5);
    createWall(room.height, - Math.PI * 0.5);

    return new Float32Array(vertices);
}