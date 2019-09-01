import { Graphics, Container, Loader, interaction, Text, Sprite } from "pixi.js";
import { Bodies, Body, Engine, World, Sleeping, Vector } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { findPointWithAngle, Point, distanceBetweenPoints, calcAngleBetweenPoints } from "../math/coordMath";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world;

let aimPos: Point = { x: 500, y: 300 }

let testBody = new PhysicsBody({ x: 1300, y: window.innerHeight - 80, width: 64, height: 64 })

const arrows: PhysicsBody[] = []
const bodies: PhysicsBody[] = []
const borders: PhysicsBody[] = []

export const initShootingArrows = (parentContainer: Container) => {
  loader
    .add('arrow', 'arrow.png')
    .add('bow', 'bow.png')
    .load(() => {
      parentContainer.addChild(container)
      container.addChild(g)
      container.addChild(label)
      label.position.x = 300
      label.position.y = 20
      setupInteraction()

      spawnBodies(50, 64)

      World.add(world, testBody.physicsBody)

      makeBorders()

      engine.enableSleeping = true
    })
  return update
}

const updateArrowInfo = (body: Body) => {
  label.text = `
    mass      =    ${body.mass}
    velocityX =    ${body.velocity.x.toFixed(4)}
    velocityY =    ${body.velocity.y.toFixed(4)}
  `
}

const setupInteraction = () => {
  g.interactive = true
  g.buttonMode = true

  g.on('pointermove', (e: interaction.InteractionEvent) => {
    aimPos = e.data.getLocalPosition(g)
  })

  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    shootArrow()
  })
}

const drawArrowPreview = () => {
  g.beginFill(0xFF0000)
  const shooter = testBody.physicsBody
  const angle = calcAngleBetweenPoints(shooter.position, aimPos)
  const tip = findPointWithAngle(shooter.position, angle, 200)
  const tip1 = findPointWithAngle(tip, angle - 15, -20)
  const tip2 = findPointWithAngle(tip, angle + 15, -20)

  const head = [
    tip1.x, tip1.y,
    tip.x, tip.y,
    tip2.x, tip2.y
  ]

  g.drawPolygon(head)
  g.endFill()
}

const shootArrow = () => {
  for (let i = 0; i < 1; i++) {
    const shooter = testBody.physicsBody
    const angle = calcAngleBetweenPoints(shooter.position, aimPos)
    const tip = findPointWithAngle(shooter.position, angle - 10 * i, 48)

    // let shootVector = Vector.normalise(Vector.neg(Vector.sub(shooter.position, aimPos)))

    let shootVector = Vector.normalise(Vector.neg(Vector.sub(shooter.position, aimPos)))
    shootVector = Vector.div(shootVector, 0.3)

    const size = 6

    const arrowHead = new PhysicsBody({ x: tip.x, y: tip.y, width: size, height: size })
    const arrowBody = arrowHead.physicsBody
    Body.setDensity(arrowBody, 1)

    arrowHead.sprite = Sprite.from(loader.resources['arrow'].texture)
    arrowHead.sprite.position.x = tip.x
    arrowHead.sprite.position.y = tip.y
    arrowHead.sprite.anchor.y = 0.5
    arrowHead.sprite.scale.x = 0.3
    arrowHead.sprite.scale.y = 0.3

    arrowHead.physicsBody.sleepThreshold = 30

    container.addChild(arrowHead.sprite)

    World.addBody(world, arrowHead.physicsBody)

    arrows.push(arrowHead)

    Body.applyForce(arrowHead.physicsBody, arrowHead.physicsBody.position, shootVector)
  }

}

const drawGround = () => {
  g.beginFill(0x121212)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()
}

const spawnBodies = (count: number, size: number) => {
  for (let i = 0; i < count; i++) {
    const rx = Math.random() * window.innerWidth / 3
    const x = rx
    const y = i % 4 * 100
    const width = size
    const height = size
    const obj = new PhysicsBody({ x, y, width, height })
    // Body.setDensity(obj.physicsBody, 0.02)
    obj.physicsBody.restitution = 0

    World.addBody(world, obj.physicsBody)
    bodies.push(obj)
  }
}

const makeBorders = () => {
  const bottom = new PhysicsBody({ x: window.innerWidth / 2, y: window.innerHeight, width: window.innerWidth, height: 20 })
  bottom.physicsBody.isStatic = true
  World.addBody(world, bottom.physicsBody)
  borders.push(bottom)

  const top = new PhysicsBody({ x: window.innerWidth / 2, y: 0, width: window.innerWidth, height: 20 })
  top.physicsBody.isStatic = true
  World.addBody(world, top.physicsBody)
  borders.push(top)

  const right = new PhysicsBody({ x: window.innerWidth, y: window.innerHeight / 2, width: 20, height: window.innerHeight })
  right.physicsBody.isStatic = true
  World.addBody(world, right.physicsBody)
  borders.push(right)

  const left = new PhysicsBody({ x: 0, y: window.innerHeight / 2, width: 20, height: window.innerHeight })
  left.physicsBody.isStatic = true
  World.addBody(world, left.physicsBody)
  borders.push(left)
}


const update = (delta: number) => {
  g.clear()
  drawGround()

  Engine.update(engine)

  g.lineStyle(1, 0x999999)
  for (const border of borders) {
    border.draw(g)
  }
  g.lineStyle(0)

  //testbody
  g.lineStyle(2, 0xFFFFFF)
  testBody.draw(g)
  g.lineStyle(0)

  //arrows
  drawArrowPreview()
  g.beginFill(0xFFFFFF)
  for (const arrow of arrows) {
    arrow.draw(g)
    if (arrow.sprite) {
      const rotation = Vector.angle(arrow.physicsBody.velocity, { x: 0, y: 0 })
      arrow.sprite.rotation = rotation
    }
  }
  g.endFill()

  //goal
  g.lineStyle(2, 0xFF0000)
  g.drawCircle(aimPos.x, aimPos.y, 25)
  g.lineStyle(0)

  g.lineStyle(2, 0xFFFF00)
  for (const body of bodies) {
    body.draw(g)
  }

  g.lineStyle(0)
  updateArrowInfo(testBody.physicsBody)
}