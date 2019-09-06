import { Graphics, Container, Loader, Sprite } from "pixi.js";
import { Body, Engine, World } from "matter-js";

const loader = Loader.shared;

const g = new Graphics()

const initialGrid: boolean[][] = []
const currentGrid: boolean [][] = []
const newGrid: boolean [][] = []

const gridSize = 64
const cellSize = 8

const spawnRate = 0.75
const survivalTreshold = 2
const birthTreshhold = 4


const stepsPerFrame = gridSize**2
const maxIterations = 3

let stepX = 0
let stepY = 0
let iterationsCount = 0


export const initCellularAutomata = (parentContainer: Container) => {
    parentContainer.addChild(g)

    
    for(let x =0; x<gridSize;x++){
        initialGrid[x] = []
        currentGrid[x] = []
        newGrid[x] = []
        for(let y= 0; y< gridSize; y++) {
            currentGrid[x][y] = Math.random()>=spawnRate? true : false
            newGrid[x][y] = currentGrid[x][y]
            initialGrid[x][y] = currentGrid[x][y]
        }
    }

    return update
}

const isOffGrid = (x: number, y: number) => {
    return x>gridSize-1 || x<0 || y>gridSize-1 || y<0? true: false
}

const neighbourValues = (x: number, y: number, radius?:number) => {
    const neighbourValues: boolean [] = []

    neighbourValues.push(
        //values out of bound are alive
        isOffGrid(x-1,y-1)? true : currentGrid[x-1][y-1],
        isOffGrid(x-1,y)? true : currentGrid[x-1][y], 
        isOffGrid(x-1,y+1)? true : currentGrid[x-1][y+1], 
        isOffGrid(x,y-1)? true : currentGrid[x][y-1], 
        isOffGrid(x,y+1)? true : currentGrid[x][y+1], 
        isOffGrid(x+1,y-1)? true : currentGrid[x+1][y-1],
        isOffGrid(x+1,y)? true : currentGrid[x+1][y], 
        isOffGrid(x+1,y+1)? true : currentGrid[x+1][y+1],  
    )

    return neighbourValues
}

const calculateNewCellValue = (x: number, y: number) => {
    const vals = neighbourValues(x,y)
    let count = 0
        
    vals.map(v => v? count++ : null)
    count>survivalTreshold? newGrid[x][y] = true : newGrid[x][y] = false
    count>birthTreshhold && !currentGrid[x][y] ? newGrid[x][y] = true : null
}

const makeStep = () => {
    if(stepY<gridSize){
        calculateNewCellValue(stepX, stepY)
        stepX++
        if(stepX == gridSize){
            stepX = 0
            stepY++
        }
    } else {
        reassignGrids()
        stepX = 0
        stepY = 0
        iterationsCount++
    }  
}

const reassignGrids = () => {
    for(let x =0; x<gridSize;x++){
        for(let y= 0; y< gridSize; y++) {
            currentGrid[x][y] = newGrid[x][y]
        }
    }
}

const update = (delta: number) => {
    g.clear()    
    for(let x =0; x<gridSize;x++){
        for(let y= 0; y< gridSize; y++) {
            if(newGrid[x][y]){
                g.beginFill(0x121212)
                g.drawRect(x*cellSize,y*cellSize, cellSize,cellSize)
                g.endFill()
            }            
        }
    }    

    let stepCount = 0

    while(stepCount<stepsPerFrame&&iterationsCount<maxIterations) {
        makeStep()    
        stepCount++
    }
}