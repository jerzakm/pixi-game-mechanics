import "../src/_scss/main.scss"
import * as renderer from './core/renderer'
import * as Stats from 'stats.js'
import { initShadowcasting } from "./01_fov/shadowcasting";
import { initPhysicsDemo } from "./02_physics_with_matter/physicsSquares";
import { initPhysicsBattleFormation as initBodyMovement } from "./02_physics_with_matter/bodyMovement";
import { initShootingArrows } from "./02_physics_with_matter/shootingArrows";
import { initPlatformerMovement } from "./02_physics_with_matter/platformerMovement";
import { initShatterDemo } from "./02_physics_with_matter/shatter";
import { initCellularAutomata } from "./03_procedural_dungeon/cellular_automata";
import { initRenderDungeonGrid } from "./03_procedural_dungeon/render_dungeon";
import { initAudioPlayLocation } from "./04_audio/audioLoc";
import { initDirectionalSpritesheet } from "./02_physics_with_matter/directionalSpritesheet";
import { initFootstepsAudio } from "./04_audio/footeps";
import { initFpsJuice } from "./05_juice/fpsJuice";

window.decomp = require('poly-decomp')

renderer.initRenderer()

var stats = new Stats.default()
stats.showPanel(0)
document.body.appendChild(stats.dom)

// const shadowcasting = initShadowcasting(renderer.stage)

// const physicsDemo = initPhysicsDemo(renderer.stage)
// const bodyMovement = initBodyMovement(renderer.stage)
// const shootingArrows = initShootingArrows(renderer.stage)
// const platformerMovement = initPlatformerMovement(renderer.stage)
// const shatterDemo = initShatterDemo(renderer.stage)
// const cellularAutomata = initCellularAutomata(renderer.stage)
// const audioPositionDemo = initAudioPlayLocation(renderer.stage)
// const directionalSpritesheet = initDirectionalSpritesheet(renderer.stage)
// const audioFootsteps = initFootstepsAudio(renderer.stage)
const fpsJuice = initFpsJuice(renderer.stage)


renderer.ticker.add((delta: number) => {
    stats.begin()
    fpsJuice(delta)
    // shadowcasting()
    // physicsDemo(delta)
    // bodyMovement(delta)
    // shootingArrows(delta)
    // platformerMovement(delta)
    // shatterDemo(delta)
    // cellularAutomata(delta)
    // audioPositionDemo(delta)
    // directionalSpritesheet(delta)
    // audioFootsteps(delta)

    stats.end()
})