import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { Body, Engine, World, Vector, Constraint, Bodies } from "matter-js";
import { PhysicsBody } from "../02_physics_with_matter/PhysicsBody";
import { findPointWithAngle, Point, distanceBetweenPoints, calcAngleBetweenPoints } from "../math/coordMath";
import { renderer, ticker, stage } from "../core/renderer";
import { Howl } from 'howler';

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world;
world.gravity.x = 0
world.gravity.y = 0

const TARGET_FPS = 75

const listener: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

const shots = new Howl({
  src: ['gunshots.mp3'],
  volume: 1.3,
  loop: false,
  sprite: {
    f1: [5, 1500]
  }
});

const borders: PhysicsBody[] = []

const player: Body = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 8)

interface Bullet {
  body: Body,
  sound: Howl
}

const bullets: PhysicsBody[] = []
const dummies: PhysicsBody[] = []
const playerData = {
  angle: 0,
  facing: { x: 0, y: 0 },
  moving: {
    x: 0,
    y: 0
  }
}

export const initShootingJuice = (parentContainer: Container) => {
  ticker.maxFPS = TARGET_FPS
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20
  playerSetup()
  initControlls()
  makeBorders()
  spawnDummies(100, 30)
  return update
}

const playerSetup = () => {
  World.add(world, player)

  player.frictionAir = 0.2

  g.interactive = true
  g.buttonMode = true

  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    shoot()
  })

  g.on('pointermove', (e: interaction.InteractionEvent) => {
    const pos = e.data.getLocalPosition(g)
    const angle = calcAngleBetweenPoints(player.position, pos)
    playerData.angle = angle
  })
}

const initControlls = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.code) {
      case 'KeyD': {
        playerData.moving.x = 1
        break
      }
      case 'KeyA': {
        playerData.moving.x = -1
        break
      }
      case 'KeyW': {
        playerData.moving.y = -1
        break
      }
      case 'KeyS': {
        playerData.moving.y = 1
        break
      }
    }
  })

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    e.preventDefault()
    switch (e.code) {
      case 'KeyD': {
        playerData.moving.x = 0
        break
      }
      case 'KeyA': {
        playerData.moving.x = 0
        break
      }
      case 'KeyW': {
        playerData.moving.y = 0
        break
      }
      case 'KeyS': {
        playerData.moving.y = 0
        break
      }
    }
  })
}

const drawPlayer = () => {
  g.lineStyle(1, 0xCECECE)
  g.drawCircle(player.position.x, player.position.y, 8)
  playerData.facing = findPointWithAngle(player.position, playerData.angle, 15)
  g.moveTo(player.position.x, player.position.y)
  g.lineTo(playerData.facing.x, playerData.facing.y)
  g.lineStyle(0)
  player.angularSpeed = 0
}

const shoot = () => {
  const bullet = new PhysicsBody({
    x: playerData.facing.x,
    y: playerData.facing.y,
    width: 2,
    height: 2
  })
  bullets.push(bullet)

  Body.setDensity(bullet.physicsBody, 0.05)
  bullet.physicsBody.restitution = 0
  bullet.physicsBody.frictionAir = 0

  World.add(world, bullet.physicsBody)
  const bulletVelocity = Vector.mult(Vector.normalise(Vector.sub(playerData.facing, player.position)), 8)
  Body.setVelocity(bullet.physicsBody, bulletVelocity)

  const kickbackForce = Vector.neg(Vector.div(Vector.normalise(Vector.sub(playerData.facing, player.position)), 4))
  Body.applyForce(player, bullet.physicsBody.position, kickbackForce)
  shakesCount = 2

  const soundloc = {
    x: -(listener.x - player.position.x) / 100,
    y: 0,
    z: -(listener.y - player.position.y) / 100,
  }
  shots.pos(soundloc.x, soundloc.y, soundloc.z)
  shots.play('f1')
}

const drawGround = () => {
  g.beginFill(0x222222)
  g.drawRect(-100, -100, window.innerWidth + 100, window.innerHeight + 100)
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

const spawnDummies = (count: number, size: number) => {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth
    const y = Math.random() * window.innerHeight
    const width = size
    const height = size
    const obj = new PhysicsBody({ x, y, width, height })
    Body.setDensity(obj.physicsBody, 0.2)
    obj.physicsBody.restitution = 0

    World.addBody(world, obj.physicsBody)
    dummies.push(obj)
  }
}

let shakesCount = 0
const shakeTime = 2
let lastShake = shakeTime + 1
const shakeStr = 0.1

const shakeScreen = () => {
  const r1 = Math.random() * shakeStr * 50
  const r2 = Math.random() * shakeStr * 50
  shakesCount % 2 == 0 ? stage.position.x -= r1 : stage.position.x += r1
  shakesCount % 2 == 0 ? stage.position.y -= r2 : stage.position.y += r2
  shakesCount -= 1
}

const movementTick = () => {
  const maxVelocity = 2
  const moveVector = Vector.mult(Vector.normalise(playerData.moving), maxVelocity)
  Body.setVelocity(player, moveVector)
}

const update = (delta: number) => {
  if (shakesCount > 0 && lastShake > shakeTime) {
    shakeScreen()
    lastShake = 0
  } else {
    lastShake += delta
    stage.position.x = 0
    stage.position.y = 0
  }
  movementTick()
  g.clear()
  drawGround()

  g.beginFill(0x888888)
  g.drawCircle(listener.x, listener.y, 40)
  g.endFill()

  Engine.update(engine, delta)

  //player
  drawPlayer()

  //borders
  // g.lineStyle(2, 0xFFFFFF)
  // for (const border of borders) {
  //   border.draw(g)
  // }

  g.lineStyle(2, 0xEECC00)
  for (const bullet of bullets) {
    bullet.draw(g)
  }
  g.lineStyle(2, 0xFFFFFF)
  for (const dummy of dummies) {
    dummy.draw(g)
  }
  g.lineStyle(0)
}