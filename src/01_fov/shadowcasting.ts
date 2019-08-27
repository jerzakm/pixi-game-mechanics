import { Container, Graphics, interaction, Text, filters } from "pixi.js";
import { Point, calcAngleBetweenPoints, findPointWithAngle } from "../math/coordMath";

const walls: Square[] = []
const graphics = new Graphics()
const fovGraphics = new Graphics()
const gridCellSize = 8
const gridWidth = Math.floor((window.innerWidth - 100) / gridCellSize)
const gridHeight = Math.floor((window.innerHeight - 100) / gridCellSize)
const mouseLoc = { x: 0, y: 0 }
const statsText = new Text(`text`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300 })

let calcCounter = 0
let updateNeeded = true

const chunks: Square[][][] = []
const chunkSize = gridCellSize * 10
const chunkRenderRadius = 3
const shadowCastingDistance = Math.SQRT2 * (chunkRenderRadius + 1) * chunkSize

export const initShadowcasting = (stage: Container) => {
    stage.addChild(graphics)
    stage.addChild(fovGraphics)
    fovGraphics.filters = [
        new filters.AlphaFilter(0.7)
    ]
    stage.addChild(statsText)
    statsText.position.x = 100
    graphics.interactive = true
    graphics.buttonMode = true
    makeWallGrid(gridCellSize, gridWidth, gridHeight, 10)
    calculateChunks()
    setupInteraction()
    return animateShadowCasting
}

const setupInteraction = () => {
    window.addEventListener('mousemove', () => updateNeeded = true)

    graphics.on('mousemove', (e: interaction.InteractionEvent) => {
        mouseLoc.x = e.data.getLocalPosition(graphics).x
        mouseLoc.y = e.data.getLocalPosition(graphics).y
    })
}

const makeWallGrid = (cellsize: number, width: number, height: number, density: number) => {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const chance = Math.random()
            if (chance < density / 100) {
                walls.push({
                    x: x * cellsize,
                    y: y * cellsize,
                    size: cellsize
                })
            }
        }
    }
}

const calculateChunks = () => {
    const xChunks = (gridWidth * gridCellSize) / chunkSize
    const yChunks = (gridHeight * gridCellSize) / chunkSize

    for (let x = 0; x < xChunks; x++) {
        chunks[x] = []
        for (let y = 0; y < yChunks; y++) {
            chunks[x][y] = []
            for (const wall of walls) {
                const minX = x * chunkSize
                const maxX = minX + chunkSize
                const minY = y * chunkSize
                const maxY = minY + chunkSize
                if (wall.x >= minX && wall.x < maxX && wall.y >= minY && wall.y < maxY) {
                    chunks[x][y].push(wall)
                }
            }
        }
    }
}

const renderFov = (squaresToRender: Square[] = walls) => {

    for (let wall of squaresToRender) {
        const squarePoints = [
            wall.x, wall.y,
            wall.x + wall.size, wall.y,
            wall.x + wall.size, wall.y + wall.size,
            wall.x, wall.y + wall.size
        ]
        fovGraphics.beginFill(0x000000)
        for (let side = 0; side < 4; side++) {
            const s1: Point = {
                x: squarePoints[side * 2],
                y: squarePoints[side * 2 + 1]
            }
            const s2: Point = {
                x: squarePoints[(side + 1 == 4 ? 0 : side + 1) * 2],
                y: squarePoints[(side + 1 == 4 ? 0 : side + 1) * 2 + 1]
            }

            const angle1 = calcAngleBetweenPoints(s1, mouseLoc)
            const angle2 = calcAngleBetweenPoints(s2, mouseLoc)
            //
            const p1 = findPointWithAngle(s1, angle1 - 180, shadowCastingDistance)
            const p2 = findPointWithAngle(s2, angle2 - 180, shadowCastingDistance)

            calcCounter++

            fovGraphics.drawPolygon([
                p1.x, p1.y,
                s1.x, s1.y,
                s2.x, s2.y,
                p2.x, p2.y,
            ])
        }
        fovGraphics.endFill()
    }

}

const animateShadowCasting = () => {
    calcCounter = 0
    graphics.clear()

    //draw bg
    graphics.beginFill(0xEEEEEE)
    graphics.drawRect(0, 0, gridWidth * gridCellSize, gridHeight * gridCellSize)

    //draw walls
    graphics.beginFill(0x77CCFF)
    for (let wall of walls) {
        graphics.drawRect(wall.x, wall.y, wall.size, wall.size)
    }
    graphics.endFill()

    //draw pointer
    graphics.beginFill(0xFFFFFF)
    graphics.drawCircle(mouseLoc.x, mouseLoc.y, 3)
    graphics.endFill()

    //draw chunks
    const squaresToRender: Square[] = []

    //chunk render range
    const chunkX = Math.floor(mouseLoc.x / chunkSize)
    const chunkY = Math.floor(mouseLoc.y / chunkSize)
    const cminX = chunkX - chunkRenderRadius >= 0 ? chunkX - chunkRenderRadius : 0
    const cmaxX = chunkX + chunkRenderRadius < chunks.length ? chunkX + chunkRenderRadius : chunks.length
    const cminY = chunkY - chunkRenderRadius >= 0 ? chunkY - chunkRenderRadius : 0
    const cmaxY = chunkY + chunkRenderRadius < chunks[0].length ? chunkY + chunkRenderRadius : chunks[0].length

    for (let x = 0; x < chunks.length; x++) {
        for (let y = 0; y < chunks[x].length; y++) {
            const chunkX = x * chunkSize
            const chunkY = y * chunkSize
            if (x >= cminX && x <= cmaxX && y >= cminY && y <= cmaxY) {
                squaresToRender.push(...chunks[x][y])
                graphics.lineStyle(2, 0x77FF77)
                graphics.beginFill(0x33FF33, 0.3)
            } else {
                graphics.lineStyle(2, 0xFF3333)
                graphics.beginFill(0xFF3333, 0.3)
            }
            graphics.drawRect(chunkX, chunkY, chunkSize - 2, chunkSize - 2)
            graphics.endFill()
        }
    }

    if (updateNeeded) {
        fovGraphics.clear()
        renderFov(squaresToRender)
        updateNeeded = false
        fovGraphics.beginFill(0x000000)
        fovGraphics.drawRect(0, 0, cminX * chunkSize, chunks[0].length * chunkSize)
        fovGraphics.drawRect(cminX * chunkSize, 0, (cmaxX - cminX + 1) * chunkSize, cminY * chunkSize)
        fovGraphics.drawRect(cminX * chunkSize, (cmaxY + 1) * chunkSize, (cmaxX - cminX + 1) * chunkSize, (chunks[0].length - cmaxY) * chunkSize)
        fovGraphics.drawRect((cmaxX + 1) * chunkSize, 0, (chunks.length - cmaxX) * chunkSize, chunks[0].length * chunkSize)
        fovGraphics.endFill()
    }

    statsText.text = `calculations: ${calcCounter}`
}

interface Square {
    x: number,
    y: number,
    size: number
}