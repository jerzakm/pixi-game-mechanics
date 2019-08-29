import { Graphics, Container } from "pixi.js";
import { Engine, Bodies, World } from "matter-js";
// import Matter from 'matter-js'

const g = new Graphics()
const engine = Engine.create()
const world = engine.world;
const box = Bodies.rectangle(100,100,50,50, {restitution: 0.5})

export const initPhysicsDemo = (parentContainer: Container) => {
    world.gravity.scale = 0.0001
    parentContainer.addChild(g)
    World.addBody(world, box)
    return update
}



const update = () => {    
    Engine.update(engine)
    g.clear()
    g.lineStyle(2, 0x121212)
    g.drawRect(box.position.x, box.position.y, 50,50)    
}

