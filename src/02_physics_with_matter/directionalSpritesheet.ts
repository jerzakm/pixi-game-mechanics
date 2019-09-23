import { Graphics, Container, Loader, interaction, Text, AnimatedSprite, Texture } from "pixi.js";
import { Point, findPointWithAngle, calcAngleBetweenPoints, distanceBetweenPoints } from "../math/coordMath";

const g = new Graphics()
const container = new Container()
const loader = Loader.shared;

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const goal: Point = { x: 500, y: 500 }
let angle = 0

const splashes: Splash[] = []
const splashG = new Graphics()

let spr: undefined | AnimatedSprite

export const initDirectionalSpritesheet = (parentContainer: Container) => {
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(splashG)
  container.addChild(label)
  loader
    .add('sj', 't.json')
    // .add('sg', 't.png')
    .load(() => {
      let sheet = loader.resources["sj"].spritesheet
      if (sheet) {
        const texture: Texture[] = []
        Object.values(sheet.textures).map(tx => texture.push(tx))
        spr = new AnimatedSprite(texture)
        spr.x = 300
        spr.y = 300
        spr.scale.x = 0.2
        spr.scale.y = 0.2
        spr.play()
        spr.animationSpeed = 0.7

        container.addChild(spr)
      }
    })


  g.interactive = true
  g.buttonMode = true

  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    const pos = e.data.getLocalPosition(g)
    goal.x = pos.x
    goal.y = pos.y
  })

  return update
}

let time = 1
let ticker = 0
const tickermax = 1000


const update = (delta: number) => {
  g.clear()
  ticker >= tickermax ? ticker = 0 : ticker += 1
  console.log(ticker)
  splashG.clear()
  g.beginFill(0x112318)
  g.drawRect(0, 0, 1920, 1080)
  g.endFill()
  if (spr) {
    // spr.currentFrame > spr.totalFrames ? spr.gotoAndStop(0) : spr.gotoAndStop(spr.currentFrame + 1)
    // g.lineStyle(2, 0xEE9999)
    g.moveTo(spr.position.x, spr.position.y)
    const facing = findPointWithAngle({ x: spr.position.x, y: spr.position.y }, angle - 90, 100)
    g.lineTo(facing.x, facing.y)
    g.lineStyle(0)
    angle = spr.angle
    spr.animationSpeed = delta * 0.29

    if (ticker % 13 == 0) {
      splashes.push(
        makeSplash(
          {
            x: spr.position.x + 10 * Math.random(),
            y: spr.position.y + 10 * Math.random()
          }
        )
      )
    }
  }
  g.lineStyle(2, 0x99EEaa)
  g.drawCircle(goal.x, goal.y, 30)
  g.lineStyle(0)

  spriteHandler(delta)
  splashHandler(delta)


}

const turningSpeed = 1

const spriteHandler = (delta: number) => {
  if (spr) {
    const pos: Point = spr.position
    const goalAngle = calcAngleBetweenPoints(pos, goal)
    const angleDiff = goalAngle + 90 - spr.angle
    const dst = distanceBetweenPoints(pos, goal)

    if (dst > spr.height / 2) {
      spr.angle += (angleDiff / Math.abs(angleDiff)) * turningSpeed * (Math.abs(angleDiff) * 0.2) * delta
    }
    if (angleDiff < 3) {
      spr.angle = goalAngle + 90
    }

    const newPos = findPointWithAngle(pos, angle - 90, 7 * delta)
    spr.x = newPos.x
    spr.y = newPos.y
  }
}

const splashTime = 2000

const splashHandler = (delta: number) => {
  for (let i = 0; i < splashes.length; i++) {
    const s = splashes[i]
    if (s.time > 0) {
      s.time -= 5 * Math.random()
      s.r -= Math.random() / 2
      splashG.lineStyle(2, 0xaaEEbb, s.r / 35)
      splashG.drawCircle(s.pos.x, s.pos.y, s.r)
      splashG.lineStyle(0)
    }
  }
}

const makeSplash = (pos: Point): Splash => {
  const np = pos
  const splash = {
    time: splashTime,
    r: 35,
    pos: np
  }
  return splash
}

interface Splash {
  time: number
  pos: Point
  r: number
}