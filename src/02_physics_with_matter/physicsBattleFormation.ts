import { Graphics, Container, Loader, interaction } from "pixi.js";
import { Body, Engine, World, Vector, Constraint } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
import { findPointWithAngle, Point } from "../math/coordMath";

const loader = Loader.shared;

const g = new Graphics()
const engine = Engine.create()

const world = engine.world;

const container = new Container()

const formations: Formation[] = []

let goal: Point = { x: 300, y: 300 }

export const initPhysicsBattleFormation = (parentContainer: Container) => {
  parentContainer.addChild(container)
  parentContainer.addChild(g)
  world.gravity.x = 0
  world.gravity.y = 0

  formations.push(makeWedgeFormation(5))

  setupInteraction()

  return update
}

const setupInteraction = () => {
  g.interactive = true
  g.buttonMode = true

  g.on('pointerdown', (e: interaction.InteractionEvent) => {
    goal = e.data.getLocalPosition(g)
    formations[0].members[0].body.physicsBody.position = goal
  })
}

const update = (delta: number) => {
  g.clear()
  Engine.update(engine, delta)


  g.beginFill(0x458B00)
  g.drawRect(0, 0, window.innerWidth, window.innerHeight)
  g.endFill()

  g.lineStyle(2, 0x121212)
  for (const formation of formations) {
    const leaderX = formation.members[0].body.physicsBody.position.x
    const leaderY = formation.members[0].body.physicsBody.position.y
    g.beginFill(0xffd700)
    g.drawCircle(leaderX, leaderY, 10)
    g.endFill()


    for (const member of formation.members) {
      member.body.draw(g)
      g.beginFill(0xFF0000)
      g.drawCircle(leaderX + member.coreTranslate.x, leaderY + member.coreTranslate.y, 3)
      g.endFill()
    }
  }

  tightenFormation()

  g.lineStyle(2, 0xFFFFFF)
  g.drawCircle(goal.x, goal.y, 15)
}

const tightenFormation = () => {
  for (const formation of formations) {
    const leaderPos = formation.members[0].body.physicsBody.position
    g.lineStyle(2, 0x12FF12, 0.8)
    g.moveTo(leaderPos.x, leaderPos.y)
    const formationAngle = findPointWithAngle(leaderPos, formation.angle - 90, 100)
    g.lineTo(formationAngle.x, formationAngle.y)

    g.lineStyle(2, 0xFF1212, 0.8)
    g.moveTo(leaderPos.x, leaderPos.y)
    const leaderAngle = findPointWithAngle(leaderPos, formation.members[0].body.physicsBody.angle - 90, 100)
    g.lineTo(leaderAngle.x, leaderAngle.y)

    for (const member of formation.members) {
      const pos = member.body.physicsBody.position
      const goal = { x: member.coreTranslate.x + leaderPos.x, y: member.coreTranslate.y + leaderPos.y }
      const force = Vector.neg(Vector.div(Vector.sub(pos, goal), 20000))
      const fScale = force.x / 0.001
      console.log(force)
      console.log(fScale)
      const ratedForce = { x: force.x * fScale, y: force.y * fScale }
      member.body.physicsBody.angle = Vector.angle(pos, goal)
      Body.applyForce(
        member.body.physicsBody,
        pos,
        force,
      )

      g.lineStyle(2, 0xFF1212, 0.8)
      g.moveTo(pos.x, pos.y)
      const memberAngle = findPointWithAngle(pos, member.body.physicsBody.angle - 90, 100)
      g.lineTo(memberAngle.x, memberAngle.y)
    }
  }
}

const makeWedgeFormation = (rows: number) => {
  const width = 32
  const height = 32

  const formation: Formation = {
    angle: 0,
    members: []
  }

  const padding = 64

  for (let i = -1; i <= rows; i++) {
    const rowMembers = i + 2
    for (let j = 0; j < rowMembers; j++) {
      const xPos = (j * padding) - (padding / 2) * (i + 1)
      const yPos = i * padding + padding
      const member: FormationMember = {
        coreTranslate: {
          x: xPos,
          y: yPos
        },
        body: new PhysicsBody({ x: 700 + j * 64, y: i * padding + 128, width, height })
      }
      World.add(world, [member.body.physicsBody])
      formation.members.push(member)
    }
  }

  return formation
}


interface Formation {
  angle: number
  members: FormationMember[]
}

interface FormationMember {
  coreTranslate: {
    x: number
    y: number
  }
  body: PhysicsBody
}