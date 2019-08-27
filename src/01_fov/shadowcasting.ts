import { Container, Graphics, interaction } from "pixi.js";

const walls:Square[] = []
const graphics = new Graphics()
const fovGraphics = new Graphics()
const gridWidth = 30
const gridHeight = 20
const gridCellSize = 32
const mouseLoc = {x:0, y:0}

export const initShadowcasting = (stage: Container)=> {
    stage.addChild(graphics)    
    stage.addChild(fovGraphics)
    fovGraphics.alpha = 0.5
    graphics.interactive = true
    graphics.buttonMode = true
    makeWallGrid(gridCellSize,gridWidth,gridHeight, 10)
    setupInteraction()
    return animateShadowCasting
}

const setupInteraction = ()=> {
    graphics.on('mousemove', (e:interaction.InteractionEvent) => {
        mouseLoc.x = e.data.getLocalPosition(graphics).x
        mouseLoc.y = e.data.getLocalPosition(graphics).y
    })
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

const renderFov = ()=> {
    for(let wall of walls){
        const squarePoints = [
            wall.x, wall.y, 
            wall.x + wall.size, wall.y,
            wall.x + wall.size, wall.y + wall.size,
            wall.x, wall.y + wall.size
        ]


    }
}

const animateShadowCasting = ()=> {    
    graphics.clear()
    fovGraphics.clear()

    //draw bg
    graphics.beginFill(0x9A9A9A)
    graphics.drawRect(0,0, gridWidth*gridCellSize,gridHeight*gridCellSize)

    //draw walls
    graphics.beginFill(0x77CCFF)
    for(let wall of walls){        
        graphics.drawRect(wall.x,wall.y,wall.size, wall.size)
    }
    graphics.endFill()

    //draw pointer
    graphics.beginFill(0xFFFFFF)
    graphics.drawCircle(mouseLoc.x, mouseLoc.y, 3)
    graphics.endFill()

    renderFov()
}

interface Square {
    x: number,
    y: number,
    size: number
}