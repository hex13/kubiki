export function createFloor(room) {
    const left = room.position.x;
    const right = room.position.x + room.width;
    const top = room.position.z - room.height;
    const bottom = room.position.z;

    return new Float32Array([
        left, 0, top,
        left, 0, bottom,
        right, 0, top,

        left, 0, bottom,
        right, 0, bottom,
        right, 0, top,
    ]);
}

export class Doors extends Array {
    constructor(bottom = [], right = [], top = [], left = []) {
        super();
        this.push(bottom);
        this.push(right);
        this.push(top);
        this.push(left);
    }
}

export function createWalls(room) {
    const vertices = [];
    let x = room.position.x;
    let z = room.position.z;
    let angle = 0;

    const createSegment = (length, turn, isBreak = false, floor = 0, ceiling = 1) => {

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
    };

    const createWall = (length, doors) => {
        const segments = [{offset: 0, width: length}];
        for (let i = 0; i < doors.length; i++) {
            const door = doors[i];
            const prev = segments.pop();

            segments.push({offset: prev.offset, width: door.offset - prev.offset });
            segments.push({...door, isBreak: true});
            segments.push({offset: door.offset + door.width, width: prev.width - (door.offset - prev.offset) - door.width });
        }

        segments.forEach((segment, i) => {
            const lastX = x;
            const lastZ = z;
            createSegment(segment.width, 0, false, segment.isBreak? 0.9 : 0.0);
            if (segment.isBreak) {
                x = lastX;
                z = lastZ;
                createSegment(segment.width, 0, false, 0, 0.1);
            }
        });

    }

    for (let i = 0; i < 4; i++) {
        createWall(i % 2 == 0? room.width : room.height, room.doors[i]);
        angle -= Math.PI * 0.5;
    }

    return new Float32Array(vertices);
}