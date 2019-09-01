import { Graphics, Container, Loader, Text, Sprite } from "pixi.js";
import { Body, Engine, World, Pairs, Vector, Vertices } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { renderer } from "../core/renderer";
import { Point, findPointWithAngle } from "../math/coordMath";
import * as hull from 'hull.js'
import * as PolyK from 'polyk'

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const engine = Engine.create()
const world = engine.world
world.gravity.x = 0
world.gravity.y = 0.01

const posX = 10
const posY = 10

const borders: PhysicsBody[] = []

const spritePoints: Point[] = []
const hullPoints: any[] = []

const shatteredPolygons: number[][] = []
const shatteredBodies: Body[] = []

const shatteredSprites: Sprite[] = []
const shatteredMasks: Graphics[] = []
const shatteredLabels: Text[] = []

let orcSprite: Sprite | undefined

export const initShatterDemo = (parentContainer: Container) => {
  loader
    .add('orc', 'orc.png')
    .load(() => {
      parentContainer.addChild(container)
      container.addChild(g)
      makeBorders()
      initObj()
      interactiveGraphics()
      implode()
    })

  return update
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

  hullPoints.push(...hull.default(r, 80))
  container.addChild(sprite)

  sprite.alpha = 0.5

  orcSprite = sprite
}

const implode = () => {
  if (orcSprite) {
    const y = orcSprite.height / 2 + orcSprite.position.y
    const fromX = orcSprite.position.x - 100
    const toX = orcSprite.position.x + orcSprite.width + 100
    const polygon: number[] = []
    for (let h of hullPoints) {
      polygon.push(h[0], h[1])
    }

    const sliced = PolyK.Slice(polygon, fromX, y, toX, y)
    shatteredPolygons.push(...sliced)

    for (const slice of sliced) {
      let path = ''
      slice.map(s => path += `${s} `)
      let body = Body.create({})
      const vert = Vertices.fromPath(path, body)
      body.vertices = vert
      World.add(world, body)
      shatteredBodies.push(body)
      Body.applyForce(body, body.position, { x: Math.random() / 100, y: Math.random() / 100 })
      shatteredSprites.push(Sprite.from(loader.resources['orc'].texture))
      shatteredMasks.push(new Graphics())
      shatteredLabels.push(new Text(`label`, { fill: '#ffffff', wordWrap: false, wordWrapWidth: 300, fontSize: 12 }))
    }
  }

  for (let sprite of shatteredSprites) {
    sprite.alpha = 0.5
    container.addChild(sprite)
  }
  for (let mask of shatteredMasks) {
    container.addChild(mask)
  }
  for (let label of shatteredLabels) {
    container.addChild(label)
  }
}

const makeBorders = () => {
  const bottom = new PhysicsBody({ x: window.innerWidth / 2, y: window.innerHeight, width: window.innerWidth, height: 30 })
  bottom.physicsBody.isStatic = true
  World.addBody(world, bottom.physicsBody)
  borders.push(bottom)

  const top = new PhysicsBody({ x: window.innerWidth / 2, y: 0, width: window.innerWidth, height: 30 })
  top.physicsBody.isStatic = true
  World.addBody(world, top.physicsBody)
  borders.push(top)

  const right = new PhysicsBody({ x: window.innerWidth, y: window.innerHeight / 2, width: 30, height: window.innerHeight })
  right.physicsBody.isStatic = true
  World.addBody(world, right.physicsBody)
  borders.push(right)

  const left = new PhysicsBody({ x: 0, y: window.innerHeight / 2, width: 30, height: window.innerHeight })
  left.physicsBody.isStatic = true
  World.addBody(world, left.physicsBody)
  borders.push(left)
}


const update = (delta: number) => {
  g.clear()
  Engine.update(engine)
  drawGround()
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

  // g.lineStyle(2, 0x00FF00)
  // if (orcSprite) {
  //   const fromY = orcSprite.height / 2 + orcSprite.position.y
  //   const fromX1 = orcSprite.position.x - 100
  //   const toX1 = orcSprite.position.x + orcSprite.width + 100
  //   g.moveTo(fromX1, fromY)
  //   g.lineTo(toX1, fromY)
  // }
  // g.lineStyle(0)

  g.lineStyle(2, 0xFF00FF)
  g.beginFill(0xFFFFFF, 0.5)

  for (let i = 0; i < shatteredBodies.length; i++) {
    const poly: number[] = []

    shatteredSprites[i].anchor.x = 0
    shatteredSprites[i].anchor.y = 0

    shatteredBodies[i].vertices.map(v => poly.push(v.x, v.y))
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

    // g.drawPolygon(poly)
  }

  g.endFill()
  g.lineStyle(0)
}