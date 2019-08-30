import "../src/_scss/main.scss"
import * as renderer from './core/renderer'
import * as Stats from 'stats.js'
import { initShadowcasting } from "./01_fov/shadowcasting";
import { initPhysicsDemo } from "./02_physics_with_matter/physicsSquares";
import { initPhysicsBattleFormation } from "./02_physics_with_matter/physicsBattleFormation";

renderer.initRenderer()

var stats = new Stats.default()
stats.showPanel(0)
document.body.appendChild(stats.dom)

// const shadowcasting = initShadowcasting(renderer.stage)
// const physicsDemo = initPhysicsDemo(renderer.stage)

const physicsBattleFormation = initPhysicsBattleFormation(renderer.stage)


renderer.ticker.add((delta: number) => {
    stats.begin()

    // shadowcasting()
    // physicsDemo(delta)
    physicsBattleFormation(delta)

    stats.end()
})