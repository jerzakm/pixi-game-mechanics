import { Graphics, Container, Loader, Text, Sprite, Texture } from "pixi.js";
import { Body, Bodies, Engine, World, Pairs, Vector, Vertices, Render, IRendererOptions } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { renderer } from "../core/renderer";
import { Point, findPointWithAngle, Line } from "../math/coordMath";
import * as particles from 'pixi-particles'
import * as hull from 'hull.js'
import * as PolyK from 'polyk'
const decomp = require('poly-decomp')

import { calcHexPoints } from "../math/polyMath";


const debugMode = false


const loader = Loader.shared;

const g = new Graphics()
const container = new Container()
const bloodEmitters = new Container()

const engine = Engine.create()
engine.constraintIterations = 5
engine.positionIterations = 5
engine.velocityIterations = 5
const world = engine.world
// world.gravity.y = 0

const radialCuts = 9
const hexCuts = 3


const borders: PhysicsBody[] = []
const cuttingLines: Line[] = []
const sliceableObjects: SliceableObject[] = []

let cutDebug: number[] = []

export const initShatterDemo = (parentContainer: Container) => {
  createBorders()
  loader
    .add('orc', 'orc.png')
    .add('blood', 'blood.png')
    .load(() => {
      parentContainer.addChild(container)
      container.addChild(g)
      container.addChild(bloodEmitters)
      interactivity()
    })

  return update
}

const interactivity = ()=> {
  g.interactive = true
  g.buttonMode = true
  
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if(e.code=='Space'){
      spawnObject(Math.random()*(window.innerWidth*0.8)+60, 700)
    }
  })
}

interface SliceableObject {
  object: PhysicsBody
  objectPolyVec: Vector[]
  objectPoly: number[]
  slicedBodyParts: Body[]
  slicedBodySprites: Sprite[]
  slicedBodyMask: Graphics[]
  bloodEmitters: particles.Emitter[]
  cuttingLines: Line[]
}

const spawnObject = (x: number, y: number) => {
  const sprite = Sprite.from(loader.resources['orc'].texture)
  const spritePoly = makePolygonFromSprite(sprite)  
  sprite.interactive = true
  sprite.buttonMode = true
  const obj = new PhysicsBody({x: x, y:y, width: sprite.width, height:sprite.height})
  obj.setSprite(sprite)
  container.addChild(sprite)  

  const cl: Line[] = []
  const sliceable = {
    object: obj,
    objectPolyVec: spritePoly.vector,
    objectPoly: spritePoly.points,
    slicedBodyParts: [],
    slicedBodyMask: [],
    slicedBodySprites: [],
    bloodEmitters: [],
    cuttingLines: cl
  }
  
  

  sliceableObjects.push(sliceable)
  sprite.addListener('pointerdown', ()=> {    
    const cuttingLines: Line[] = createCuttingLines(sliceable)
    sliceable.cuttingLines.push(...cuttingLines)    

    sliceSprite(sliceable)
  })

  World.add(world, obj.physicsBody)
}

const makeEmitter = (body: Body) => {
  const emitterOptions = {
    alpha: {
      start: 0.7,
      end: 0.3
    },
    scale: {
      start: 0.003 * body.mass/50,
      end: 0.007 * body.mass/50,
      minimumScaleMultiplier: 60
    },
    color: {
      start: '#ff0000',
      end: '#e30707'
    },
    speed: {
      start: 5,
      end: 15,
      minimumSpeedMultiplier: 1
    },
    acceleration: {
      x: 0,
      y: 15
    },
    maxSpeed: 0,
    startRotation: {
      min: -75,
      max: 75
    },
    noRotation: false,
    rotationSpeed: {
      min: 0,
      max: 50
    },
    lifetime: {
      min: 1,
      max: 2
    },
    blendMode: 'normal',
    frequency: 0.00005,
    emitterLifetime: -1,
    maxParticles: 20,
    pos: {
      x: 0,
      y: 0
    },
    addAtBack: true,
    spawnType: 'point'
  }

  const emitter = new particles.Emitter(
    bloodEmitters,
    [Texture.from('blood.png')],
    emitterOptions
  )
  emitter.emit = true
  return emitter
}

const makeBloodEmitters = () => {
  for (const bodyPart of sliceable.slicedBodyParts) {
    makeEmitter(bodyPart)
  }
}

const makePolygonFromSprite = (sprite: Sprite) => {  
  const spritePoints: Point[] = []
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
        spritePoints.push({ x: x + sprite.position.x, y: y + sprite.position.y })
      }
    }
  }

  let r: any[] = []
  for (let point of spritePoints) {
    r.push([point.x, point.y])
  }

  const h:any = []
  h.push(...hull.default(r, 500))

  const vectorArray: Vector[] = []
  const polyArray = []
  for(const point of h){
    polyArray.push(point[0],point[1])
    vectorArray.push({x: point[0], y: point[1]})
  }
  
  return {
    vector: vectorArray,
    points: polyArray
  }
}

const createCuttingLines = (sliceable: SliceableObject): Line[] => {  
  const clArray: Line[] = []
  if (sliceable.object.sprite) {
    const c = {
      x: sliceable.object.sprite.x,
      y: sliceable.object.sprite.y
    }

    for (let i = 0; i < radialCuts; i++) {
      const angle = 0 + i * (360 / radialCuts)
      const p1 = findPointWithAngle(c, angle, Math.sqrt(sliceable.object.sprite.width * sliceable.object.sprite.height) / 2 + 50)
      const p2 = findPointWithAngle(c, angle - 180, Math.sqrt(sliceable.object.sprite.width * sliceable.object.sprite.height) / 2 + 50)
      clArray.push({ from: p1, to: p2 })
    }


    for (let i = 0; i < hexCuts; i++) {
      const r = (i + 1) * (Math.sqrt(sliceable.object.sprite.width * sliceable.object.sprite.height) / 6)
      const h = r * Math.sqrt(3)
      const hexPoly = calcHexPoints(r, h, false)


      for (let j = 0; j < 6; j++) {
        clArray.push({
          from: {
            x: hexPoly[j * 2] + c.x,
            y: hexPoly[j * 2 + 1] + c.y
          },
          to: {
            x: hexPoly[(j + 1) * 2 >= hexPoly.length ? 0 : (j + 1) * 2] + c.x,
            y: hexPoly[(j + 1) * 2 >= hexPoly.length ? 1 : (j + 1) * 2 + 1] + c.y
          }
        })
      }
    }
  }

  return clArray
}

const sliceSprite = (sliceable: SliceableObject) => {
  if (sliceable.object.sprite) {
    const polygon: number[] = []

    const sprite = sliceable.object.sprite
    const offX = sprite.width*sprite.anchor.x
    const offY = sprite.height*sprite.anchor.y

    for(let i = 0; i<sliceable.objectPoly.length;i++){
      i%2==0? polygon.push(sliceable.objectPoly[i]+sprite.x - offX) : polygon.push(sliceable.objectPoly[i]+sprite.y-offY)
    }

    let preDecompSlices = PolyK.Slice(polygon, 0, 0, 0, 0)        
    cutDebug.push(...polygon)

    for (const line of sliceable.cuttingLines) {
      let newSlices: number[][] = []      
      for (const slice of preDecompSlices) {
        try {
          let freshPolyGroup = PolyK.Slice(slice, line.from.x, line.from.y, line.to.x, line.to.y)
          for (const freshPoly of freshPolyGroup) {
            let decompArray = []
            for (let i = 0; i < freshPoly.length - 1; i++) {
              decompArray.push([freshPoly[i], freshPoly[i + 1]])
            }
            decomp.makeCCW(decompArray)
            // decomp.removeCollinearPoints(decompArray, 5)
            const cwPoly = []
            for (const p of decompArray.reverse()) {
              cwPoly.push(p[0], p[1])
            }
            // newSlices.push(cwPoly)
            newSlices.push(freshPoly)
          }

        } catch (e) {

        }
      }
      preDecompSlices = newSlices
    }    

    for (const slice of preDecompSlices) {
      let path = ''
      slice.map(s => path += `${s}, `)
      const vert = Vertices.fromPath(path, Body.create({}))
      const sliceCenter = Vertices.centre(vert)

      const options: Matter.IBodyDefinition = {
        vertices: vert,
        isStatic: false,
        position: sliceCenter
      }

      const body = Body.create(options)

      sliceable.slicedBodyParts.push(body)
      sliceable.slicedBodySprites.push(Sprite.from(loader.resources['orc'].texture))
      sliceable.slicedBodyMask.push(new Graphics())            
    }
      const hullVert: Vector[] = sliceable.objectPolyVec      
      const hullCenter = Vertices.centre(hullVert)

      const min = {
        x: sliceable.object.sprite.x,
        y: sliceable.object.sprite.position.y
      }
      const max = {
        x: sliceable.object.sprite.position.x + sliceable.object.sprite.width,
        y: sliceable.object.sprite.position.y + sliceable.object.sprite.height
      }



  for (let i = 0; i < sliceable.slicedBodySprites.length; i++) {
    const cc = Vertices.centre(sliceable.slicedBodyParts[i].vertices)
    Body.setDensity(sliceable.slicedBodyParts[i], 0.01)
    const force = Vector.mult(Vector.normalise(Vector.sub(hullCenter, cc)), 0.1*(sliceable.slicedBodyParts[i].mass))
    Body.applyForce(sliceable.slicedBodyParts[i], { x: cc.x, y: cc.y + 30 }, force)

    sliceable.slicedBodySprites[i].anchor.x = ((hullCenter.x - cc.x) / -(max.x - min.x)) + 0.5
    sliceable.slicedBodySprites[i].anchor.y = ((hullCenter.y - cc.y) / -(max.y - min.y)) + 0.5
    sliceable.slicedBodySprites[i].alpha = 1
    container.addChild(sliceable.slicedBodySprites[i])

    sliceable.slicedBodySprites[i].mask = sliceable.slicedBodyMask[i]
    container.addChild(sliceable.slicedBodyMask[i])
  }
  World.remove(world, sliceable.object.physicsBody)
  sliceable.slicedBodyParts.map(body => World.add(world, body))
  }

  
}

const createBorders = () => {
  const borderThickness = 100

  const bottom = new PhysicsBody({ x: window.innerWidth / 2, y: window.innerHeight, width: window.innerWidth, height: borderThickness })
  World.addBody(world, bottom.physicsBody)
  borders.push(bottom)

  const top = new PhysicsBody({ x: window.innerWidth / 2, y: 0, width: window.innerWidth, height: borderThickness })
  World.addBody(world, top.physicsBody)
  borders.push(top)

  const right = new PhysicsBody({ x: window.innerWidth, y: window.innerHeight / 2, width: borderThickness, height: window.innerHeight })
  World.addBody(world, right.physicsBody)
  borders.push(right)

  const left = new PhysicsBody({ x: 0, y: window.innerHeight / 2, width: borderThickness, height: window.innerHeight })
  World.addBody(world, left.physicsBody)
  borders.push(left)

  for (const border of borders) {
    Body.setStatic(border.physicsBody, true)
  }
}

const drawHull = (sliceable: SliceableObject) => {
  if(sliceable.object.sprite){
    const sprite = sliceable.object.sprite
    const offX = sprite.width*sprite.anchor.x
    const offY = sprite.height*sprite.anchor.y
    g.lineStyle(2, 0xFF0000)
    if (sliceable.objectPolyVec.length > 0) {
      g.moveTo(sliceable.objectPolyVec[0].x + sprite.x- offX,sliceable.objectPolyVec[0].y+sprite.y-offY)
      for (const point of sliceable.objectPolyVec) {
        g.lineTo(point.x+sprite.x-offX, point.y+sprite.y-offY)
      }
    }
    g.lineStyle(0) 
  }  
}

const drawCuttingLines = (sliceable: SliceableObject) => {
  if(sliceable.cuttingLines.length>0){
    g.lineStyle(2, 0x000000)
    for(const line of sliceable.cuttingLines){
      g.moveTo(line.from.x, line.from.y)
      g.lineTo(line.to.x, line.to.y)
    }
    g.lineStyle(0)
  }
}

const drawHullCenter = () => {
  const hullVert: Vector[] = []
  hullPoints.map(hp => hullVert.push({ x: hp[0], y: hp[1] }))
  const hullCenter = Vertices.centre(hullVert)
  g.beginFill(0x7777FF)
  g.drawCircle(hullCenter.x, hullCenter.y, 5)
  g.endFill()
}

const drawSliceCenters = () => {
  for (const body of sliceable.slicedBodyParts) {
    const sliceCenter = Vertices.centre(body.vertices)
    g.beginFill(0x7777FF)
    g.drawCircle(sliceCenter.x, sliceCenter.y, 5)
    g.endFill()
  }
}

const update = (delta: number) => {
  Engine.update(engine)
  g.clear()
  //draw borders
  g.beginFill(0x888888)
  for (const border of borders) {
    border.draw(g)
  }
  g.endFill()

  for(const sliceable of sliceableObjects){
    sliceable.object.draw(g)    
    Body.setAngle(sliceable.object.physicsBody, 0) //prevents rotating of a preslicedbody
    
    g.lineStyle(2,0xFFFFFF)
    drawHull(sliceable)
    drawCuttingLines(sliceable)    
    g.lineStyle(0)
  }

  for(const body of world.bodies){
    const poly: number[] = []
    body.vertices.map(v => poly.push(v.x, v.y))
    g.lineStyle(1, 0x660066)
    g.drawPolygon(poly)
    g.lineStyle(0)
  }

  if(cutDebug.length>0){
    g.lineStyle(2, 0x000000)
    g.drawPolygon(cutDebug)
    g.lineStyle(0)
  }
}