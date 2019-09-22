import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { Point, findPointWithAngle } from "../math/coordMath";
import { Howl, Howler } from 'howler';
import { Vector } from "matter-js";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })

const center: Point = { x: 600, y: 500 }
const circleDistance = 300;
let circlingAngle = 0
const circlingPos: Point = { x: 0, y: 0 }

const sound = new Howl({
  src: ['rc.mp3'],
  volume: 0.5,
  loop: true,
  sprite: {
    test: [500, 100000, true]
  }
});

export const initAudioPlayLocation = (parentContainer: Container) => {
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20

  // sound.pos(0, 0, 0.5)
  sound.play('test')

  return update
}


const update = (delta: number) => {
  g.clear()

  circlingAngle += 0.5
  const np = findPointWithAngle(center, circlingAngle, circleDistance)
  circlingPos.x = np.x
  circlingPos.y = np.y

  g.beginFill(0x121212)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()

  g.beginFill(0x77aaee)
  g.drawCircle(center.x, center.y, 10)
  g.endFill()

  g.lineStyle(2, 0x666666)
  g.drawCircle(center.x, center.y, circleDistance)
  g.lineStyle(0)

  g.beginFill(0xeeaa77)
  g.drawCircle(circlingPos.x, circlingPos.y, 10)
  g.endFill()

  // console.log(soundVec)
  // sound.pos(1, 0, 0.5, 0)
  const soundloc = {
    x: -(center.x - circlingPos.x) / 100,
    y: 0,
    z: -(center.y - circlingPos.y) / 100,
  }
  label.position.x = circlingPos.x + 15
  label.position.y = circlingPos.y - 20
  label.text = `
    soundX: ${soundloc.x}
    soundY: ${soundloc.y}
    soundZ: ${soundloc.z}
  `
  sound.pos(soundloc.x, soundloc.y, soundloc.z)
}