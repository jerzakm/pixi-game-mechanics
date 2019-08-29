import { Graphics, Container } from "pixi.js";
import { Body, Engine, Bodies, World } from "matter-js";
import { PhysicsBody } from "./PhysicsBody";
// import Matter from 'matter-js'

const g = new Graphics()
const engine = Engine.create()
const world = engine.world;

const bodies1: PhysicsBody[] = []
const bodies2: PhysicsBody[] = []

export const initPhysicsDemo = (parentContainer: Container) => {    
    parentContainer.addChild(g)
    world.gravity.x = 0
    world.gravity.y = 0
    spawnT1(256, 500, 0, 32)
    spawnT2(256, 500, 800, 32)    

    return update
}

const applyForces = (delta: number) => {
    const force = 0.0001 * delta
    for (let i = 0; i< bodies1.length; i++){
        const obj = bodies1[i].physicsBody
        Body.applyForce( obj, {x: obj.position.x, y: obj.position.y}, {x: force, y: 0});
    }    
    for (let i = 0; i< bodies2.length; i++){
        const obj = bodies2[i].physicsBody
        Body.applyForce( obj, {x: obj.position.x, y: obj.position.y}, {x: -force, y: 0});
    }    
}

const spawnT1 = (count: number, xw: number, posx:number, size: number)=> {
    for(let i = 0; i<count; i++){
        const x = Math.random()*xw + posx
        const y = Math.random()*window.innerHeight
        const width = size
        const height = size
        const obj = new PhysicsBody({x, y, width, height})        
        World.addBody(world, obj.physicsBody)
        bodies1.push(obj)
    }
}

const spawnT2 = (count: number, xw: number, posx:number, size: number) => {
    for(let i = 0; i<count; i++){
        const x = Math.random()*xw + posx
        const y = Math.random()*window.innerHeight
        const width = size
        const height = size
        const obj = new PhysicsBody({x, y, width, height})        
        World.addBody(world, obj.physicsBody)
        bodies2.push(obj)        
    }
}


const update = (delta: number) => {
    Engine.update(engine)
    g.clear()
    g.lineStyle(2, 0x121212)    
    for(const body of bodies1){
        body.draw(g)
    }
    g.lineStyle(2, 0xFF1212)    
    for(const body of bodies2){
        body.draw(g)
    }
    applyForces(delta)
}