import { Graphics, Container, Loader, Text } from "pixi.js";
import { Body, Engine, World } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { Point } from "../math/coordMath";
const Combokeys = require('combokeys')

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world

let testBody = new PhysicsBody({ x: 1300, y: window.innerHeight - 80, width: 64, height: 64 })

const bodies: PhysicsBody[] = []
const borders: PhysicsBody[] = []
const env: PhysicsBody[] = []

let move = {
  left: false,
  right: false,
  jump: false,
  jumpTimer: 0
}

export const initPlatformerMovement = (parentContainer: Container) => {
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20

  World.add(world, testBody.physicsBody)

  makeBorders()
  initEnvironment()
  initControlls()

  engine.enableSleeping = true
  return update
}

const initControlls = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.code) {
      case 'KeyD': {
        move.right = true
        break
      }
      case 'KeyA': {
        move.left = true
        break
      }
      case 'Space': {
        move.jump = true
        jump()
      }
    }
  })

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.code) {
      case 'KeyD': {
        move.right = false
        break
      }
      case 'KeyA': {
        move.left = false
        break
      }
      case 'Space': {

      }
    }
  })

}

const horizontalMovementTick = () => {
  const body = testBody.physicsBody
  Body.setDensity(body, 0.6)
  const currentVelocity = body.velocity
  const maxVelocity = 9

  Body.set(body, 'restitution', 0)

  if (!move.left && !move.right) {
    Body.setVelocity(body, { x: currentVelocity.x * 0.9, y: currentVelocity.y })
  }

  if (move.left) {
    body.velocity.x > 0 ? Body.setVelocity(body, { x: 0, y: body.velocity.y }) : null
    Body.setVelocity(body, { x: Math.abs(body.velocity.x) < maxVelocity ? body.velocity.x - 1 : -maxVelocity, y: currentVelocity.y })
  }

  if (move.right) {
    body.velocity.x < 0 ? Body.setVelocity(body, { x: 0, y: body.velocity.y }) : null
    Body.setVelocity(body, { x: body.velocity.x < maxVelocity ? body.velocity.x + 1 : maxVelocity, y: currentVelocity.y })
  }
}

const jump = () => {
  testBody.physicsBody.frictionAir = 0.03
  Body.applyForce(testBody.physicsBody, testBody.physicsBody.position, { x: 0, y: -150 })
}

const initEnvironment = () => {
  env.push(new PhysicsBody({ x: 300, y: 100, width: 500, height: 50 }))
  env.push(new PhysicsBody({ x: 800, y: 300, width: 500, height: 50 }))
  env.push(new PhysicsBody({ x: 300, y: 500, width: 500, height: 50 }))
  env.push(new PhysicsBody({ x: 1100, y: 700, width: 500, height: 50 }))
  env.push(new PhysicsBody({ x: 500, y: 900, width: 500, height: 50 }))
  env.push(new PhysicsBody({ x: 1600, y: 500, width: 500, height: 50 }))

  for (let body of env) {
    body.physicsBody.isStatic = true
    body.physicsBody.friction = 1
    World.add(world, body.physicsBody)
  }
}

const updateBodyInfo = (body: Body) => {
  label.text = `
    mass        =     ${body.mass}
    velocityX   =     ${body.velocity.x.toFixed(4)}
    velocityY   =     ${body.velocity.y.toFixed(4)}
    airFriction =     ${body.frictionAir}
  `
}

const drawGround = () => {
  g.beginFill(0x121212)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()
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

  Body.setAngle(testBody.physicsBody, 0)
  Engine.update(engine)

  horizontalMovementTick()

  g.lineStyle(1, 0x999999)
  for (const border of borders) {
    border.draw(g)
  }
  g.lineStyle(0)

  //testbody
  g.lineStyle(2, 0xFFFFFF)
  testBody.draw(g)
  g.lineStyle(0)

  g.lineStyle(2, 0xFFFF00)
  for (const body of bodies) {
    body.draw(g)
  }

  for (const body of env) {
    body.draw(g)
  }
  g.lineStyle(0)
  updateBodyInfo(testBody.physicsBody)
}