import { Container, Graphics, interaction, Text } from "pixi.js";
import { Point, calcAngleBetweenPoints, findPointWithAngle } from "../math/coordMath";

const walls: Square[] = []
const graphics = new Graphics()
const fovGraphics = new Graphics()
const gridWidth = 256
const gridHeight = 128
const gridCellSize = 8
const mouseLoc = { x: 0, y: 0 }
const statsText = new Text(`text`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300 })
let calcCounter = 0

export const initShadowcasting = (stage: Container) => {
    stage.addChild(graphics)
    stage.addChild(fovGraphics)
    stage.addChild(statsText)
    statsText.position.x = 100
    graphics.interactive = true
    graphics.buttonMode = true
    makeWallGrid(gridCellSize, gridWidth, gridHeight, 10)
    setupInteraction()
    return animateShadowCasting
}

const setupInteraction = () => {
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

const renderFov = () => {

    for (let wall of walls) {
        const squarePoints = [
            wall.x, wall.y,
            wall.x + wall.size, wall.y,
            wall.x + wall.size, wall.y + wall.size,
            wall.x, wall.y + wall.size
        ]

        // fovGraphics.beginFill(0xFF0000)
        // fovGraphics.drawCircle(wall.x, wall.y, 3)
        // fovGraphics.drawCircle(wall.x + wall.size, wall.y, 3)
        // fovGraphics.drawCircle(wall.x + wall.size, wall.y + wall.size, 3)
        // fovGraphics.drawCircle(wall.x, wall.y + wall.size, 3)
        // fovGraphics.endFill()
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

            const p1 = findPointWithAngle(s1, angle1 - 180, 500)
            const p2 = findPointWithAngle(s2, angle2 - 180, 500)

            calcCounter++

            // fovGraphics.lineStyle(1, 0x12FFAA)
            // fovGraphics.moveTo(s1.x, s1.y)
            // fovGraphics.lineTo(p1.x, p1.y)
            // fovGraphics.moveTo(s2.x, s2.y)
            // fovGraphics.lineTo(p2.x, p2.y)
            // fovGraphics.lineStyle(0)

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
    fovGraphics.clear()

    //draw bg
    graphics.beginFill(0x9AFF9A)
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

    renderFov()

    statsText.text = `calculations: ${calcCounter}`
}

interface Square {
    x: number,
    y: number,
    size: number
}