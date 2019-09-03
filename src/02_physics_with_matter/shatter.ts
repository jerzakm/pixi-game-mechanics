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
container.addChild(bloodEmitters)

const engine = Engine.create()
engine.constraintIterations = 5
engine.positionIterations = 5
engine.velocityIterations = 5
const world = engine.world
// world.gravity.y = 0

const posX = 600
const posY = 650

const radialCuts = 9
const hexCuts = 3


const borders: PhysicsBody[] = []

const spritePoints: Point[] = []
const hullPoints: any[] = []

const slicedBodyParts: Body[] = []

const cuttingLines: Line[] = []

const shatteredSprites: Sprite[] = []
const shatteredMasks: Graphics[] = []
const shatteredLabels: Text[] = []
const emitters: particles.Emitter[] = []

let orcSprite: Sprite | undefined

export const initShatterDemo = (parentContainer: Container) => {
  createBorders()
  loader
    .add('orc', 'orc.png')
    .add('blood', 'blood.png')
    .load(() => {
      parentContainer.addChild(container)
      container.addChild(g)
      makePolygonFromSprite()
      createCuttingLines()
      sliceSprite()
      makeBloodEmitters()
    })

  return update
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
  emitters.push(emitter)
}

const makeBloodEmitters = () => {
  for (const bodyPart of slicedBodyParts) {
    makeEmitter(bodyPart)
  }
}

const makePolygonFromSprite = () => {
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

  hullPoints.push(...hull.default(r, 500))
  container.addChild(sprite)

  debugMode ? sprite.alpha = 0.5 : sprite.alpha = 0

  orcSprite = sprite
}

const createCuttingLines = () => {
  if (orcSprite) {
    const c = {
      x: orcSprite.x + orcSprite.width / 2,
      y: orcSprite.y + orcSprite.height / 2
    }

    for (let i = 0; i < radialCuts; i++) {
      const angle = 0 + i * (360 / radialCuts)
      const p1 = findPointWithAngle(c, angle, Math.sqrt(orcSprite.width * orcSprite.height) / 2 + 50)
      const p2 = findPointWithAngle(c, angle - 180, Math.sqrt(orcSprite.width * orcSprite.height) / 2 + 50)
      cuttingLines.push({ from: p1, to: p2 })
    }


    for (let i = 0; i < hexCuts; i++) {
      const r = (i + 1) * (Math.sqrt(orcSprite.width * orcSprite.height) / 6)
      const h = r * Math.sqrt(3)
      const hexPoly = calcHexPoints(r, h, false)


      for (let j = 0; j < 6; j++) {
        cuttingLines.push({
          from: {
            x: hexPoly[j * 2] + posX + orcSprite.width / 2,
            y: hexPoly[j * 2 + 1] + posY + orcSprite.height / 2
          },
          to: {
            x: hexPoly[(j + 1) * 2 >= hexPoly.length ? 0 : (j + 1) * 2] + posX + orcSprite.width / 2,
            y: hexPoly[(j + 1) * 2 >= hexPoly.length ? 1 : (j + 1) * 2 + 1] + posY + orcSprite.height / 2
          }
        })
      }
    }
  }
}

const sliceSprite = () => {
  if (orcSprite) {
    const polygon: number[] = []
    for (let h of hullPoints) {
      polygon.push(h[0], h[1])
    }

    let preDecompSlices = PolyK.Slice(polygon, 0, 0, 0, 0)

    for (const line of cuttingLines) {
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

      slicedBodyParts.push(body)
      shatteredSprites.push(Sprite.from(loader.resources['orc'].texture))
      shatteredMasks.push(new Graphics())
      shatteredLabels.push(new Text(`label`, { fill: '#ffffff', wordWrap: false, fontSize: 12 }))
    }
  }

  const hullVert: Vector[] = []
  hullPoints.map(hp => hullVert.push({ x: hp[0], y: hp[1] }))
  const hullCenter = Vertices.centre(hullVert)

  const min = {
    x: orcSprite.position.x,
    y: orcSprite.position.y
  }
  const max = {
    x: orcSprite.position.x + orcSprite.width,
    y: orcSprite.position.y + orcSprite.height
  }



  for (let i = 0; i < shatteredSprites.length; i++) {
    const cc = Vertices.centre(slicedBodyParts[i].vertices)
    console.log(force)
    Body.setDensity(slicedBodyParts[i], 0.01)
    const force = Vector.mult(Vector.normalise(Vector.sub(hullCenter, cc)), 0.1*(slicedBodyParts[i].mass))
    Body.applyForce(slicedBodyParts[i], { x: cc.x, y: cc.y + 30 }, force)
    console.log(slicedBodyParts[i].density)

    shatteredSprites[i].anchor.x = ((hullCenter.x - cc.x) / -(max.x - min.x)) + 0.5
    shatteredSprites[i].anchor.y = ((hullCenter.y - cc.y) / -(max.y - min.y)) + 0.5
    shatteredSprites[i].alpha = 1
    container.addChild(shatteredSprites[i])

    shatteredSprites[i].mask = shatteredMasks[i]
    container.addChild(shatteredMasks[i])
    // container.addChild(shatteredLabels[i])
  }
  slicedBodyParts.map(body => World.add(world, body))

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

const drawHull = () => {
  g.lineStyle(2, 0xFF0000)
  if (hullPoints.length > 0) {
    g.moveTo(hullPoints[0][0], hullPoints[0][1])
    for (const point of hullPoints) {
      g.lineTo(point[0], point[1])
    }
  }
  g.lineStyle(0)
}

const drawCuttingLines = () => {
  for (const l of cuttingLines) {
    g.lineStyle(2, 0xFFFFFF)
    g.moveTo(l.from.x, l.from.y)
    g.lineTo(l.to.x, l.to.y)
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
  for (const body of slicedBodyParts) {
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


  for (let i = 0; i < slicedBodyParts.length; i++) {
    const poly: number[] = []

    slicedBodyParts[i].vertices.map(v => {
      poly.push(v.x, v.y)
      if (debugMode) { //draw circles on vertices
        g.beginFill(0xFFFF00)
        g.drawCircle(v.x, v.y, 4)
        g.endFill()
      }
    })

    shatteredSprites[i].position.x = slicedBodyParts[i].position.x
    shatteredSprites[i].position.y = slicedBodyParts[i].position.y
    shatteredSprites[i].rotation = slicedBodyParts[i].angle

    if (emitters[i]) {
      emitters[i].update(delta * 0.04)
      emitters[i].updateSpawnPos(slicedBodyParts[i].position.x, slicedBodyParts[i].position.y)
    }

    shatteredMasks[i].clear()
    shatteredMasks[i].beginFill(0x000000)
    shatteredMasks[i].drawPolygon(poly)
    shatteredMasks[i].endFill()

    if (debugMode) {
      g.lineStyle(2, 0xFF00FF)
      g.drawPolygon(poly)
      g.lineStyle(0)
      shatteredLabels[i].position.x = slicedBodyParts[i].position.x
      shatteredLabels[i].position.y = slicedBodyParts[i].position.y
      shatteredLabels[i].text = `
        spriteLoc       =   ${shatteredSprites[i].position.x.toFixed(1)} ${shatteredSprites[i].position.y.toFixed(1)}
        bodyLoc       =   ${slicedBodyParts[i].position.x.toFixed(1)} ${slicedBodyParts[i].position.y.toFixed(1)}
      `
    }
  }

  //if debug draw helper graphics
  if (debugMode) {
    drawHull()
    drawCuttingLines()
    drawHullCenter()
    drawSliceCenters()
  }


}