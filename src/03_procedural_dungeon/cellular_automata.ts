import { Graphics, Container, Loader, Sprite } from "pixi.js";
import { Body, Engine, World } from "matter-js";

const loader = Loader.shared;

const g = new Graphics()

const grid: boolean [][] = []
const newGrid: boolean [][] = []

const gridSize = 64
const cellSize = 8

const spawnRate = 0.5
const survivalTreshold = 4
const birthTreshhold = 4

const stepsPerFrame = 64


export const initCellularAutomata = (parentContainer: Container) => {
    parentContainer.addChild(g)

    
    for(let x =0; x<gridSize;x++){
        grid[x] = []
        newGrid[x] = []
        for(let y= 0; y< gridSize; y++) {
            grid[x][y] = Math.random()>=spawnRate? true : false
            newGrid[x][x] = false
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
        isOffGrid(x-1,y-1)? true : grid[x-1][y-1],
        isOffGrid(x-1,y)? true : grid[x-1][y], 
        isOffGrid(x-1,y+1)? true : grid[x-1][y+1], 
        isOffGrid(x,y-1)? true : grid[x][y-1], 
        isOffGrid(x,y+1)? true : grid[x][y+1], 
        isOffGrid(x+1,y-1)? true : grid[x+1][y-1],
        isOffGrid(x+1,y)? true : grid[x+1][y], 
        isOffGrid(x+1,y+1)? true : grid[x+1][y+1],  
    )

    return neighbourValues
}

const calculateNewCellValue = (x: number, y: number) => {
    const vals = neighbourValues(x,y)
    let count = 0
        
    vals.map(v => v? count++ : null)
    count>survivalTreshold? newGrid[x][y] = true : newGrid[x][y] = false
    count>birthTreshhold && !grid[x][y] ? newGrid[x][y] = true : null
}

let stepX = 0
let stepY = 0

const makeStep = () => {
    if(stepY<gridSize){
        calculateNewCellValue(stepX, stepY)
        stepX++
        if(stepX == gridSize){
            stepX = 0
            stepY++
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

    while(stepCount<stepsPerFrame) {
        makeStep()    
        stepCount++
    }
}