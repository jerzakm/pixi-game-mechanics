import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { Point, findPointWithAngle, calcAngleBetweenPoints, distanceBetweenPoints } from "../math/coordMath";
import { Howl, Howler } from 'howler';
import { Vector } from "matter-js";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })
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

const listener: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

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

let running = false

export const initFootstepsAudio = (parentContainer: Container) => {
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20

  g.interactive = true
  g.buttonMode = true
  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    const p = e.data.getLocalPosition(g)
    walkerGoal.x = p.x
    walkerGoal.y = p.y
  })

  window.addEventListener('keydown', (e) => {
    if (e.key == `Shift`) {
      running = true
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.key == `Shift`) {
      running = false
    }
  })

  return update
}

const walkerStepTime = 50

interface Step {
  position: Point
  r: number
}

let walkingSpeed = 0
let leftStep = true
let nextStep = 0

const steps: Step[] = []

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

    label.text = `
      soundX: ${soundloc.x.toFixed(3)}
      soundY: ${soundloc.y.toFixed(3)}
      soundZ: ${soundloc.z.toFixed(3)}

      spookLoc:     x:${walker.position.x} y: ${walker.position.y}
      listenerLoc:   x:${listener.x} y: ${listener.y}

      running[SHIFT] : ${running}
    `
  }
}

const renderSteps = (delta: number) => {
  g.lineStyle(1, 0x888888)
  for (const step of steps) {
    g.drawCircle(step.position.x, step.position.y, step.r)
    step.r -= delta
  }
  g.lineStyle(0)
}


const update = (delta: number) => {
  g.clear()

  g.beginFill(0x080808)
  g.drawRect(0, 0, 1920, 1080)
  g.endFill()

  g.beginFill(0x77aaee)
  g.drawCircle(listener.x, listener.y, 10)
  g.endFill()

  // player draw
  g.lineStyle(1, 0x999999)
  g.drawCircle(walker.position.x, walker.position.y, 8)
  const facing = findPointWithAngle(walker.position, walker.angle, 15)
  g.moveTo(walker.position.x, walker.position.y)
  g.lineTo(facing.x, facing.y)
  g.lineStyle(0)
  //goal draw
  g.lineStyle(2, 0xAA1010)
  g.drawCircle(walkerGoal.x, walkerGoal.y, 15)
  g.lineStyle(0)

  renderSteps(delta)

  walk(delta)
}