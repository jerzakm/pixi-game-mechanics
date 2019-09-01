import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { Body, Engine, World, Vector, Constraint } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { findPointWithAngle, Point, distanceBetweenPoints } from "../math/coordMath";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world;
world.gravity.x = 0
world.gravity.y = 0

let goal: Point = { x: 500, y: 300 }

let testBody = new PhysicsBody({ x: 1300, y: 300, width: 64, height: 64 })
const bodies: PhysicsBody[] = []
const borders: PhysicsBody[] = []

export const initPhysicsBattleFormation = (parentContainer: Container) => {
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20
  setupInteraction()

  World.add(world, testBody.physicsBody)

  makeBorders()

  spawnBodies(800, 16)
  engine.constraintIterations = 2
  engine.positionIterations = 2
  engine.velocityIterations = 2

  return update
}

const updateBodyInfo = (body: Body) => {
  label.text = `
    mass      =    ${body.mass}
    velocityX =    ${body.velocity.x.toFixed(4)}
    velocityY =    ${body.velocity.y.toFixed(4)}
  `
}

const setupInteraction = () => {
  g.interactive = true
  g.buttonMode = true

  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    goal = e.data.getLocalPosition(g)
  })
}

const drawGround = () => {
  g.beginFill(0x121212)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()
}

const moveBody = (body: Body, goal: Point) => {
  const moveSpeed = 10
  let moveVector = Vector.neg(Vector.sub(body.position, goal))
  const ratio = Vector.magnitude(moveVector) / moveSpeed
  moveVector = Vector.div(moveVector, ratio)
  if (distanceBetweenPoints(testBody.physicsBody.position, goal) < 5) {
    Body.setVelocity(
      body,
      { x: 0, y: 0 }
    )
    goal = body.position
  } else {
    Body.setVelocity(
      body,
      moveVector
    )
  }
}

const spawnBodies = (count: number, size: number) => {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth
    const y = Math.random() * window.innerHeight
    const width = size
    const height = size
    const obj = new PhysicsBody({ x, y, width, height })
    // Body.setDensity(obj.physicsBody, i % 2 + 1)

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

  //testbody
  g.lineStyle(2, 0xFFFFFF)
  testBody.draw(g)
  g.lineStyle(0)

  //goal
  g.lineStyle(2, 0xFF0000)
  g.drawCircle(goal.x, goal.y, 25)
  g.lineStyle(0)

  g.lineStyle(2, 0xFFFF00)
  for (const body of bodies) {
    body.draw(g)
  }
  g.lineStyle(0)

  moveBody(testBody.physicsBody, goal)
  updateBodyInfo(testBody.physicsBody)
}