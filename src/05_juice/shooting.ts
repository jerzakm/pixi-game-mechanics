import { Graphics, Container, Loader, interaction, Text, Texture, Sprite, filters, Rectangle, SCALE_MODES } from "pixi.js";
import { Body, Engine, World, Vector, Bodies, Events } from "matter-js";
import { PhysicsBody } from "../02_physics_with_matter/PhysicsBody";
import { findPointWithAngle, Point, distanceBetweenPoints, calcAngleBetweenPoints } from "../math/coordMath";
import { renderer, ticker, stage } from "../core/renderer";
import { Howl } from 'howler';
import * as particles from 'pixi-particles'
import * as PixiFilters from 'pixi-filters'
import { ShockwaveFilter } from "pixi-filters";
import { JuiceAlphaShader } from "./JuiceAlpha";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()
const topG = new Graphics()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const engine = Engine.create()
const world = engine.world;
world.gravity.x = 0
world.gravity.y = 0

let shockwave: undefined | ShockwaveFilter

const TARGET_FPS = 144

const listener: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

const bloodEmittersContainer = new Container()
const emitters: particles.Emitter[] = []

const shots = new Howl({
  src: ['gunshots.mp3'],
  volume: 1.3,
  loop: false,
  sprite: {
    f1: [5, 1500]
  }
});

const walker = {
  position: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  },
  angle: 90
}

const walkerGoal: Point = {
  x: 800,
  y: 300
}

const footsteps = new Howl({
  src: ['footsteps.mp3'],
  volume: 1.3,
  loop: false,
  sprite: {
    f1: [15, 600],
    f2: [1250, 600],
    f3: [2350, 600],
    f4: [3400, 600],
    f5: [4450, 650],
    f6: [5460, 650]
  }
});

const walkerStepTime = 50

interface Step {
  position: Point
  r: number
}
let walkingSpeed = 0
let leftStep = true
let nextStep = 0

const steps: Step[] = []

const running = false

const walk = (delta: number) => {
  walkingSpeed = running ? 2 : 1

  const angle = calcAngleBetweenPoints(walker.position, walkerGoal)
  walker.angle = angle
  // const angleDiff = player.angle - angle
  // if (Math.abs(angleDiff) > 0.3) {
  //   const rotate = (angleDiff / Math.abs(angleDiff)) * delta * Math.abs(angleDiff) * 0.1
  //   player.angle -= rotate
  // }
  const dist = distanceBetweenPoints(walker.position, walkerGoal)
  if (dist > 2) {
    const np = findPointWithAngle(walker.position, walker.angle, walkingSpeed * delta)
    walker.position = np
  } else if (dist < 2) {
    walkerGoal.x = window.innerWidth * Math.random() * 0.9 + 50
    walkerGoal.y = window.innerHeight * Math.random() * 0.9 + 50
  }

  nextStep > 0 ? nextStep -= delta * walkingSpeed : nextStep = walkerStepTime

  if (nextStep <= 0) {
    const anglemod = leftStep ? 90 : -90
    const sp = findPointWithAngle(walker.position, walker.angle + anglemod, 25)
    steps.push({
      position: sp,
      r: 15 * (1 + walkingSpeed / 10)
    })
    const soundPick = Math.ceil(Math.random() * 6)
    const soundloc = {
      x: -(listener.x - walker.position.x) / 65,
      y: 0,
      z: -(listener.y - walker.position.y) / 65,
    }
    footsteps.play(`f${soundPick}`)
    footsteps.pos(soundloc.x, soundloc.y, soundloc.z)
    leftStep ? leftStep = false : leftStep = true
    addShockWave(sp, 2)
  }
}

const renderSteps = (delta: number) => {
  g.lineStyle(1, 0x888888)
  for (const step of steps) {
    g.drawCircle(step.position.x, step.position.y, step.r)
    step.r -= delta * 0.5
  }
  g.lineStyle(0)
}

const borders: PhysicsBody[] = []

const player: Body = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 8)

let darkness: undefined | Sprite

const bullets: Body[] = []
const dummies: PhysicsBody[] = []
const playerData = {
  angle: 0,
  facing: { x: 0, y: 0 },
  moving: {
    x: 0,
    y: 0
  }
}

const shockwaves: ShockwaveFilter[] = []
const juiceAlpha = new JuiceAlphaShader()

export const initShootingJuice = (parentContainer: Container) => {
  ticker.maxFPS = TARGET_FPS
  parentContainer.addChild(container)
  container.addChild(g)
  darkness = Sprite.from('asd.png')
  container.addChild(darkness)
  container.addChild(label)
  container.addChild(bloodEmittersContainer)
  label.position.x = 300
  label.position.y = 20
  playerSetup()
  initControlls()
  makeBorders()
  spawnDummies(50, 45)
  collisionHandling()

  label.position.x = listener.x - 27
  label.position.y = listener.y - 10
  label.text = `LISTENER`

  parentContainer.addChild(topG)
  return update
}

const addShockWave = (location: Point, strength: number) => {
  const shockwave = new ShockwaveFilter([location.x, location.y], {
    amplitude: 1 * strength,
    speed: 10 * strength,
    brightness: 100,
    wavelength: 7 * strength,
    radius: 50 * strength
  })
  shockwaves.push(shockwave)
}

const processShaders = (delta: number) => {
  for (const s of shockwaves) {
    s.time += 0.1 * delta
  }

  if (darkness) {
    darkness.filters = [
      ...shockwaves,
      juiceAlpha
    ]
  }
}


const collisionHandling = () => {
  Events.on(engine, 'collisionActive', function (event) {
    for (let i = 0; i < event.pairs.length; i++) {
      const pair = event.pairs[i]
      if (pair.bodyA.label == 'bullet') {
        playImpactSound(pair.bodyA.position)
        World.remove(world, pair.bodyA)
        removeBullet(pair.bodyA.id)
        makeBloodEmitter(pair.bodyA)
        addShockWave(pair.bodyA.position, 5)
      }
      if (pair.bodyB.label == 'bullet') {
        World.remove(world, pair.bodyB)
        playImpactSound(pair.bodyB.position)
        removeBullet(pair.bodyB.id)
        makeBloodEmitter(pair.bodyA)
        addShockWave(pair.bodyB.position, 5)
      }
    }
  });
}

const playImpactSound = (position: Point) => {
  const impact = new Howl({
    src: ['bulletImpact.mp3'],
    volume: 0.3,
    loop: false,
    sprite: {
      f1: [240, 1500]
    }
  })

  const soundloc = {
    x: -(listener.x - position.x) / 100,
    y: 0,
    z: -(listener.y - position.y) / 100,
  }
  impact.pos(soundloc.x, soundloc.y, soundloc.z)

  impact.play('f1')
}

const makeBloodEmitter = (body: Body) => {
  const emitterOptions = {
    alpha: {
      start: 0.7,
      end: 0.3
    },
    scale: {
      start: 0.002 * body.mass / 150,
      end: 0.0024 * body.mass / 150,
      minimumScaleMultiplier: 60
    },
    color: {
      start: '#ff0000',
      end: '#e30707'
    },
    speed: {
      start: 1,
      end: 5,
      minimumSpeedMultiplier: 1
    },
    acceleration: {
      x: 0,
      y: 25
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
    frequency: 0.005,
    emitterLifetime: 0.6,
    maxParticles: 20,
    pos: {
      x: 0,
      y: 0
    },
    addAtBack: true,
    spawnType: 'point'
  }

  const emitter = new particles.Emitter(
    bloodEmittersContainer,
    [Texture.from('blood.png')],
    emitterOptions
  )
  emitter.updateSpawnPos(body.position.x, body.position.y)
  emitter.emit = true
  emitter.playOnceAndDestroy()
  emitters.push(emitter)
}

const removeBullet = (id: number) => {
  for (var i = bullets.length - 1; i >= 0; --i) {
    if (bullets[i].id == id) {
      bullets.splice(i, 1);
    }
  }
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
  topG.lineStyle(1, 0xCECECE)
  topG.drawCircle(player.position.x, player.position.y, 8)
  playerData.facing = findPointWithAngle(player.position, playerData.angle, 15)
  topG.moveTo(player.position.x, player.position.y)
  topG.lineTo(playerData.facing.x, playerData.facing.y)
  topG.lineStyle(0)
  player.angularSpeed = 0
}

const shoot = () => {
  const bullet = Bodies.rectangle(playerData.facing.x, playerData.facing.y, 3, 3)
  bullet.label = 'bullet'
  bullets.push(bullet)

  Body.setDensity(bullet, 0.05)
  bullet.restitution = 0
  bullet.frictionAir = 0

  World.add(world, bullet)
  const bulletVelocity = Vector.mult(Vector.normalise(Vector.sub(playerData.facing, player.position)), 15)
  Body.setVelocity(bullet, bulletVelocity)

  const kickbackForce = Vector.neg(Vector.div(Vector.normalise(Vector.sub(playerData.facing, player.position)), 4))
  Body.applyForce(player, bullet.position, kickbackForce)
  shakesCount = 2

  const soundloc = {
    x: -(listener.x - player.position.x) / 100,
    y: 0,
    z: -(listener.y - player.position.y) / 100,
  }
  shots.pos(soundloc.x, soundloc.y, soundloc.z)
  shots.play('f1')

  addShockWave(player.position, 10)

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
  topG.clear()
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
    if (bullet) {
      g.drawCircle(bullet.position.x, bullet.position.y, 2)
    } else console.log('undef bullet')
  }
  g.lineStyle(2, 0xFFFFFF)
  for (const dummy of dummies) {
    dummy.draw(g)
  }
  for (const emitter of emitters) {
    emitter.update(delta)
  }
  g.lineStyle(0)

  if (shockwave) {
    shockwave.time > 3 ? shockwave.time = 0 : shockwave.time += 0.01
  }

  // player draw
  g.beginFill(0xFF0000)
  g.drawCircle(walker.position.x, walker.position.y, 20)
  g.endFill()
  //goal draw
  g.lineStyle(2, 0xAA1010)
  g.drawCircle(walkerGoal.x, walkerGoal.y, 15)
  g.lineStyle(0)

  renderSteps(delta)

  walk(delta)

  processShaders(delta)
  listener.x = player.position.x
  listener.y = player.position.y
}