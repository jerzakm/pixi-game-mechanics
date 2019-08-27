import { Container, Graphics } from "pixi.js";

const walls:Square[] = []
const graphics = new Graphics()
const gridWidth = 30
const gridHeight = 20
const gridCellSize = 32

export const initShadowcasting = (stage: Container)=> {
    stage.addChild(graphics)    
    graphics.interactive = true
    graphics.buttonMode = true
    makeWallGrid(gridCellSize,gridWidth,gridHeight, 10)
    return animateShadowCasting
}

const makeWallGrid = (cellsize: number, width:number, height: number, density: number)=> {
    for(let x = 0; x<width;x++){
        for(let y = 0; y<height;y++){
            const chance = Math.random()
            if(chance<density/100){
                walls.push({
                    x: x*cellsize,
                    y: y*cellsize,
                    size: cellsize
                })
            }
        }
    }
}

const animateShadowCasting = ()=> {    
    graphics.clear()

    //draw bg
    graphics.beginFill(0x9A9A9A)
    graphics.drawRect(0,0, gridWidth*gridCellSize,gridHeight*gridCellSize)

    //draw walls
    graphics.beginFill(0x121212)
    for(let wall of walls){        
        graphics.drawRect(wall.x,wall.y,wall.size, wall.size)
    }
    graphics.endFill()
}

interface Square {
    x: number,
    y: number,
    size: number
}