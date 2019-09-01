export const polarCoords = (r: number, angle: number) => {
    return {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
    }
}

export const distanceBetweenPoints = (p1: Point, p2: Point) => {
    return Math.sqrt(((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2))
}

export const findPointWithAngle = (from: Point, angle: number, distance: number): Point => {
    return {
        x: Math.round(Math.cos(angle * Math.PI / 180) * distance + from.x),
        y: Math.round(Math.sin(angle * Math.PI / 180) * distance + from.y)
    }
}

export const calcAngleBetweenPoints = (p1: Point, p2: Point): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
}

export const isPointInLineSegment = (line: Line, point: Point) => {
    const L2 = (((line.to.x - line.from.x) * (line.to.x - line.from.x)) + ((line.to.y - line.from.y) * (line.to.y - line.from.y)));
    if (L2 == 0) return false;

    const r = (((point.x - line.from.x) * (line.to.x - line.from.x)) + ((point.y - line.from.y) * (line.to.y - line.from.y))) / L2;

    return (0 <= r) && (r <= 1);
}

export interface Point {
    x: number,
    y: number
}

export interface Line {
    from: Point,
    to: Point
}