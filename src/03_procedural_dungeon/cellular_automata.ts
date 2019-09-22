import { Graphics, Container, Loader, Sprite } from "pixi.js";
import { Body, Engine, World } from "matter-js";
import { Viewport } from "pixi-viewport";

const loader = Loader.shared;

const g = new Graphics()

const initialGrid: boolean[][] = []
const currentGrid: boolean[][] = []
const newGrid: boolean[][] = []

const gridSize = 64
const cellSize = 4

const spawnRate = 0.4
const survivalTreshold = 4
const birthTreshhold = 4


const stepsPerFrame = gridSize ** 2
const maxIterations = 6

let stepX = 0
let stepY = 0
let iterationsCount = 0

let parent: Container | undefined


export const initCellularAutomata = (parentContainer: Container) => {
    parent = parentContainer
    initializeArrays()
    renderAutomata()

    parentContainer.addChild(g)
    return update
}

const initializeArrays = () => {
    for (let x = 0; x < gridSize; x++) {
        initialGrid[x] = []
        currentGrid[x] = []
        newGrid[x] = []
        for (let y = 0; y < gridSize; y++) {
            currentGrid[x][y] = Math.random() >= spawnRate ? true : false
            newGrid[x][y] = currentGrid[x][y]
            initialGrid[x][y] = currentGrid[x][y]
        }
    }
}

const isOffGrid = (x: number, y: number) => {
    return x > gridSize - 1 || x < 0 || y > gridSize - 1 || y < 0 ? true : false
}

const neighbourValues = (x: number, y: number, radius?: number) => {
    const neighbourValues: boolean[] = []

    neighbourValues.push(
        //values out of bound are alive
        isOffGrid(x - 1, y - 1) ? true : currentGrid[x - 1][y - 1],
        isOffGrid(x - 1, y) ? true : currentGrid[x - 1][y],
        isOffGrid(x - 1, y + 1) ? true : currentGrid[x - 1][y + 1],
        isOffGrid(x, y - 1) ? true : currentGrid[x][y - 1],
        isOffGrid(x, y + 1) ? true : currentGrid[x][y + 1],
        isOffGrid(x + 1, y - 1) ? true : currentGrid[x + 1][y - 1],
        isOffGrid(x + 1, y) ? true : currentGrid[x + 1][y],
        isOffGrid(x + 1, y + 1) ? true : currentGrid[x + 1][y + 1],
    )

    return neighbourValues
}

const calculateNewCellValue = (x: number, y: number) => {
    const vals = neighbourValues(x, y)
    let count = 0

    vals.map(v => v ? count++ : null)
    count > survivalTreshold ? newGrid[x][y] = true : newGrid[x][y] = false
    count > birthTreshhold && !currentGrid[x][y] ? newGrid[x][y] = true : null
}

const makeStep = () => {
    if (stepY < gridSize) {
        calculateNewCellValue(stepX, stepY)
        stepX++
        if (stepX == gridSize) {
            stepX = 0
            stepY++
        }
    } else {
        console.log('fullstep')
        reassignGrids()
        stepX = 0
        stepY = 0
        iterationsCount++
    }
}

const reassignGrids = () => {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            currentGrid[x][y] = newGrid[x][y]
        }
    }
}

const renderAutomata = () => {
    const viewport = initViewport()

    loader
        .add('gravel0', 'cave/FloorGravel.png')
        .add('gravel1', 'cave/FloorGravel1.png')
        .add('gravel2', 'cave/FloorGravel2.png')
        .add('gravel3', 'cave/FloorGravel3.png')
        .add('gravel4', 'cave/FloorGravel4.png')
        .add('wallFull', 'cave/WallFull.png')
        .load(() => {
            for (let x = 0; x < newGrid.length; x++) {
                for (let y = 0; y < newGrid.length; y++) {
                    const floor = newGrid[x][y]
                    const sprite = Sprite.from(loader.resources[`gravel${Math.floor(Math.random() * 5)}`].texture)
                    sprite.position.x = x * 140
                    sprite.position.y = y * 140
                    viewport.addChild(sprite)

                    if (!floor) {
                        const sprite = Sprite.from(loader.resources[`wallFull`].texture)
                        sprite.position.x = x * 140
                        sprite.position.y = y * 140
                        viewport.addChild(sprite)
                        const lu = newGrid[x - 1][y - 1]
                        const ln = newGrid[x - 1][y]
                        const ld = newGrid[x - 1][y + 1]
                        const nt = newGrid[x][y - 1]
                        const nd = newGrid[x][y + 1]
                        const ru = newGrid[x + 1][y - 1]
                        const rn = newGrid[x + 1][y]
                        const rd = newGrid[x + 1][y + 1]
                    }
                }
            }
        })
}

const initViewport = () => {
    const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 1000,
        worldHeight: 1000,
    })
    viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()
    if (parent) {
        parent.addChild(viewport)
    }
    return viewport
}

export const generateCellularAutomataGrid = () => {
    initializeArrays()
    let stepCount = 0
    while (stepCount < stepsPerFrame && iterationsCount < maxIterations) {
        makeStep()
        stepCount++
    }
    return newGrid
}

const update = (delta: number) => {
    g.clear()
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (newGrid[x][y]) {
                g.beginFill(0x121212)
                g.drawRect(x * cellSize, y * cellSize, cellSize, cellSize)
                g.endFill()
            }
        }
    }

    let stepCount = 0

    while (stepCount < stepsPerFrame && iterationsCount < maxIterations) {
        makeStep()
        stepCount++
    }
}