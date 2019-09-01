import "../src/_scss/main.scss"
import * as renderer from './core/renderer'
import * as Stats from 'stats.js'
import { initShadowcasting } from "./01_fov/shadowcasting";
import { initPhysicsDemo } from "./02_physics_with_matter/physicsSquares";
import { initPhysicsBattleFormation as initBodyMovement } from "./02_physics_with_matter/bodyMovement";
import { initShootingArrows } from "./02_physics_with_matter/shootingArrows";
import { initPlatformerMovement } from "./02_physics_with_matter/platformerMovement";

// window.decomp = require('poly-decomp')

// console.log(window.decomp)

renderer.initRenderer()

var stats = new Stats.default()
stats.showPanel(0)
document.body.appendChild(stats.dom)

// const shadowcasting = initShadowcasting(renderer.stage)

// const physicsDemo = initPhysicsDemo(renderer.stage)
// const bodyMovement = initBodyMovement(renderer.stage)
const shootingArrows = initShootingArrows(renderer.stage)
// const platformerMovement = initPlatformerMovement(renderer.stage)


renderer.ticker.add((delta: number) => {
    stats.begin()

    // shadowcasting()
    // physicsDemo(delta)
    // bodyMovement(delta)
    shootingArrows(delta)
    // platformerMovement(delta)

    stats.end()
})