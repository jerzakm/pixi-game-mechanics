import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { Body, Engine, World, Vector, Constraint } from "matter-js";
import { PhysicsBody } from "../02_physics_with_matter/PhysicsBody";
import { findPointWithAngle, Point, distanceBetweenPoints } from "../math/coordMath";
import { renderer, ticker } from "../core/renderer";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world;
world.gravity.x = 0
world.gravity.y = 0

const TARGET_FPS = 60

let testBody = new PhysicsBody({ x: window.innerWidth/2-32, y: window.innerHeight/2-32, width: 64, height: 64 })
const borders: PhysicsBody[] = []

export const initFpsJuice = (parentContainer: Container) => {
    ticker.maxFPS = TARGET_FPS
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20
  setupInteraction()

  World.add(world, testBody.physicsBody)

  makeBorders()
  

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
      const body = testBody.physicsBody
      const click = e.data.getLocalPosition(g)        
      const force = Vector.mult(Vector.normalise(Vector.sub(click, body.position)), 1)      
      Body.applyForce(body, body.position, force)
      ticker.maxFPS = 3
  })
}

const drawGround = () => {
  g.beginFill(0x999999)
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
  ticker.maxFPS<TARGET_FPS? ticker.maxFPS+=1 : null
  g.clear()
  drawGround()

  Engine.update(engine, delta)

  //testbody
  g.lineStyle(2, 0xFFFFFF)
  testBody.draw(g)
  g.lineStyle(0)

  updateBodyInfo(testBody.physicsBody)

}