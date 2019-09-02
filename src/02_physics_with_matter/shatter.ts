import { Graphics, Container, Loader, Text, Sprite } from "pixi.js";
import { Body, Engine, World, Pairs, Vector, Vertices, Render, IRendererOptions } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { renderer } from "../core/renderer";
import { Point, findPointWithAngle, Line } from "../math/coordMath";
import * as hull from 'hull.js'
import * as PolyK from 'polyk'
import { calcHexPoints } from "../math/polyMath";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const engine = Engine.create()
const world = engine.world

const posX = 300
const posY = 500

const borders: PhysicsBody[] = []

const spritePoints: Point[] = []
const hullPoints: any[] = []

const shatteredPolygons: number[][] = []
const shatteredBodies: Body[] = []

const cuttingLines: Line[] = []

const shatteredSprites: Sprite[] = []
const shatteredMasks: Graphics[] = []
const shatteredLabels: Text[] = []

let matterRender: Render | undefined


let orcSprite: Sprite | undefined

export const initShatterDemo = (parentContainer: Container) => {
  makeBorders()
  loader
    .add('orc', 'orc.png')
    .load(() => {
      parentContainer.addChild(container)
      container.addChild(g)
      initObj()
      interactiveGraphics()
      initCuttingLines()
      sliceObj()
      debugRenderer()
    })

  return update
}

const debugRenderer = () => {
  const options: IRendererOptions = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  matterRender = Render.create({
   element: document.body,
   engine: engine,
   options: options
 })
 matterRender.canvas.style.zIndex = '100'
}

const interactiveGraphics = () => {
  g.interactive = true
  g.buttonMode = true
}

const drawGround = () => {
  g.beginFill(0x121212)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()
}

const initObj = () => {
  const sprite = Sprite.from(loader.resources['orc'].texture)

  const pixels = renderer.extract.pixels(sprite)

  const getColorIndicesForCoord = (x: number, y: number, width: number) => {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  };

  const verticalStep = 5
  const horizontalStep = 5

  for (let y = 0; y < sprite.height; y += verticalStep) {
    for (let x = 0; x < sprite.width; x += horizontalStep) {
      const indices = getColorIndicesForCoord(x, y, sprite.width)
      const r = pixels[indices[0]]
      const g = pixels[indices[1]]
      const b = pixels[indices[2]]
      const a = pixels[indices[3]]
      if (a == 255) {
        spritePoints.push({ x: x + sprite.position.x + posX, y: y + sprite.position.y + posY })
      }
    }
  }

  sprite.position.x = posX
  sprite.position.y = posY

  let r: any[] = []
  for (let point of spritePoints) {
    r.push([point.x, point.y])
  }

  hullPoints.push(...hull.default(r, 100))
  container.addChild(sprite)

  sprite.alpha = 0.5

  orcSprite = sprite
}

const initCuttingLines = () => {
  if(orcSprite){
    const c = {
      x: orcSprite.x + orcSprite.width/2,
      y: orcSprite.y + orcSprite.height/2
    }

    const radialCuts = 15
    const hexCuts = 2

    for(let i = 0; i< radialCuts; i++){
      const angle = 0 + i * (360/radialCuts)
      const p1 = findPointWithAngle(c, angle, Math.sqrt(orcSprite.width*orcSprite.height)+50)
      const p2 = findPointWithAngle(c, angle-180, Math.sqrt(orcSprite.width*orcSprite.height)+50)
      cuttingLines.push({from: p1, to: p2})
    }


    for(let i = 0; i< hexCuts; i++){
      const r = (i+1)*45
      const h = r * Math.sqrt(3)
      const hexPoly = calcHexPoints(r,h, false)
      
    
      for(let j = 0; j<6;j++){
        cuttingLines.push({
          from: {
            x: hexPoly[j*2] + posX+ orcSprite.width/2,
            y: hexPoly[j*2 +1]+ posY+ orcSprite.height/2
          },
          to: {
            x: hexPoly[(j+1)*2>=hexPoly.length? 0:(j+1)*2] + posX + orcSprite.width/2,
            y: hexPoly[(j+1)*2>=hexPoly.length? 1: (j+1)*2 +1]+ posY  + orcSprite.height/2
          }
        })
      }
    }    
  }
}

const sliceObj = () => {
  if (orcSprite) {
    const y = orcSprite.height / 2 + orcSprite.position.y
    const fromX = orcSprite.position.x - 100
    const toX = orcSprite.position.x + orcSprite.width + 100
    const polygon: number[] = []
    for (let h of hullPoints) {
      polygon.push(h[0], h[1])
    }

    let currentSlices = PolyK.Slice(polygon, 0, 0, 0, 0)

    for(const line of cuttingLines){
      let newSlices:number[][] = []
      for(const slice of currentSlices){
        try{
          let fresh = PolyK.Slice(slice, line.from.x, line.from.y, line.to.x, line.to.y)
          newSlices.push(...fresh)
        }catch(e){
          console.log(e)
        }        
      }
      currentSlices = newSlices
    }

    for (const slice of currentSlices) {
      let path = ''
      slice.map(s => path += `${s}, `)
      let body = Body.create({})
      const vert = Vertices.fromPath(path, body)      
      body.vertices = vert
      World.add(world, body)
      shatteredBodies.push(body)
      // Body.applyForce(body, body.position, { x: Math.random() / 200, y: Math.random() / 200 })
      shatteredSprites.push(Sprite.from(loader.resources['orc'].texture))
      shatteredMasks.push(new Graphics())
      shatteredLabels.push(new Text(`label`, { fill: '#ffffff', wordWrap: false, wordWrapWidth: 300, fontSize: 12 }))
    }

    shatteredPolygons.push(...currentSlices)
  }

  for (let sprite of shatteredSprites) {
    sprite.alpha = 0.5
    container.addChild(sprite)
  }
  for (let mask of shatteredMasks) {
    container.addChild(mask)
  }
  for (let label of shatteredLabels) {
    // container.addChild(label)
  }
}

const makeBorders = () => {
  const borderThickness = 100
  const bottom = new PhysicsBody({ x: window.innerWidth / 2, y: window.innerHeight, width: window.innerWidth, height: borderThickness })
  bottom.physicsBody.isStatic = true
  World.addBody(world, bottom.physicsBody)
  borders.push(bottom)

  const top = new PhysicsBody({ x: window.innerWidth / 2, y: 0, width: window.innerWidth, height: borderThickness })
  top.physicsBody.isStatic = true
  World.addBody(world, top.physicsBody)
  borders.push(top)

  const right = new PhysicsBody({ x: window.innerWidth, y: window.innerHeight / 2, width: borderThickness, height: window.innerHeight })
  right.physicsBody.isStatic = true
  World.addBody(world, right.physicsBody)
  borders.push(right)

  const left = new PhysicsBody({ x: 0, y: window.innerHeight / 2, width: borderThickness, height: window.innerHeight })
  left.physicsBody.isStatic = true
  World.addBody(world, left.physicsBody)
  borders.push(left)
}


const update = (delta: number) => {
  Engine.update(engine)  
  // matterRender? Render.run(matterRender) : null
  g.clear()
  // drawGround()
  g.beginFill(0x888888)
  for (const border of borders) {
    border.draw(g)
  }
  g.endFill()

  g.lineStyle(2, 0xFF0000)
  if (hullPoints.length > 0) {
    g.moveTo(hullPoints[0][0], hullPoints[0][1])
    for (const point of hullPoints) {
      g.lineTo(point[0], point[1])
    }
  }
  g.lineStyle(0)

  for(const l of cuttingLines){
    g.lineStyle(3, 0xFFFFFF)
    g.moveTo(l.from.x, l.from.y)
    g.lineTo(l.to.x, l.to.y)
    g.lineStyle(0)
  }

  

  for (let i = 0; i < shatteredBodies.length; i++) {
    const poly: number[] = []

    shatteredSprites[i].anchor.x = 0
    shatteredSprites[i].anchor.y = 0

    shatteredBodies[i].vertices.map(v => {
      poly.push(v.x, v.y)
      g.beginFill(0xFFFF00)
      // g.drawCircle(v.x, v.y,5)
      g.endFill()
    }
    )
    shatteredSprites[i].position.x = shatteredBodies[i].position.x + posX
    shatteredSprites[i].position.y = shatteredBodies[i].position.y + posY
    shatteredSprites[i].rotation = shatteredBodies[i].angle

    shatteredLabels[i].position.x = shatteredBodies[i].position.x + posX
    shatteredLabels[i].position.y = shatteredBodies[i].position.y + posY
    shatteredLabels[i].text = `
      spriteLoc       =   ${shatteredSprites[i].position.x.toFixed(1)} ${shatteredSprites[i].position.y.toFixed(1)}
      bodyLoc       =   ${shatteredBodies[i].position.x.toFixed(1)} ${shatteredBodies[i].position.y.toFixed(1)}
    `

    shatteredMasks[i].clear()
    shatteredMasks[i].beginFill(0x000000)
    shatteredMasks[i].drawPolygon(poly)
    shatteredMasks[i].endFill()

    shatteredSprites[i].mask = shatteredMasks[i]
    g.lineStyle(2, 0xFF00FF)  
    g.drawPolygon(poly)
    g.lineStyle(0)    
  }
  
}