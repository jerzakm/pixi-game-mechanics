import { Graphics, Container, Loader, Sprite } from "pixi.js";
import { Body, Engine, World } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";

const loader = Loader.shared;

const g = new Graphics()
const engine = Engine.create()
const world = engine.world;

const bodies1: PhysicsBody[] = []
const bodies2: PhysicsBody[] = []
const borders: PhysicsBody[] = []

let mainContainer: Container

let counter = 0

export const initPhysicsDemo = (parentContainer: Container) => {
    engine.constraintIterations = 1
    engine.positionIterations = 1
    engine.velocityIterations = 1
    parentContainer.addChild(g)
    mainContainer = parentContainer
    loader
        .add('orc', 'orc.png')
        .add('knight', 'knight.png')
        .add('gorilla', 'gorilla.png')
        .add('zombie', 'zombie.png')
        .load(() => {
            world.gravity.x = -10
            world.gravity.y = 0
            makeBorders()
            spawnT1(256, 500, 0, 38, parentContainer)
            spawnT2(40, 500, 800, 96, parentContainer)
        })

    return update
}

const applyForces = (delta: number) => {
    const force = 0.016 * delta
    for (let i = 0; i < bodies1.length; i++) {
        const obj = bodies1[i].physicsBody
        Body.applyForce(obj, { x: obj.position.x, y: obj.position.y }, { x: force, y: 0 });
    }
    for (let i = 0; i < bodies2.length; i++) {
        const obj = bodies2[i].physicsBody
        Body.applyForce(obj, { x: obj.position.x, y: obj.position.y }, { x: -force, y: 0 });
    }
}

const spawnT1 = (count: number, xw: number, posx: number, size: number, parentContainer: Container) => {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * xw + posx
        const y = Math.random() * window.innerHeight
        const width = size
        const height = size
        const obj = new PhysicsBody({ x, y, width, height })

        // const sprite = Sprite.from(loader.resources['zombie'].texture)
        // obj.setSprite(sprite)
        // parentContainer.addChild(sprite)

        World.addBody(world, obj.physicsBody)
        bodies1.push(obj)
    }
}

const spawnT2 = (count: number, xw: number, posx: number, size: number, parentContainer: Container) => {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * xw + posx
        const y = Math.random() * window.innerHeight
        const width = size
        const height = size
        const obj = new PhysicsBody({ x, y, width, height })

        // const sprite = Sprite.from(loader.resources['gorilla'].texture)
        // sprite.scale.x *= -1
        // obj.setSprite(sprite)
        // parentContainer.addChild(sprite)

        World.addBody(world, obj.physicsBody)
        bodies2.push(obj)
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

    if (mainContainer) {
        mainContainer.sortChildren()
    }

    g.lineStyle(2, 0x1212ee)
    for (const body of bodies1) {
        body.draw(g)
    }
    g.lineStyle(2, 0xff1212)
    for (const body of bodies2) {
        body.draw(g)
    }
    g.lineStyle(0, 0xFFFFFF)
    g.beginFill(0x121212, 1)
    for (const border of borders) {
        border.draw(g)
    }
    g.endFill()

    counter++
    if (counter % 1 == 0) {
        applyForces(delta)
        Engine.update(engine, delta)
    }
}