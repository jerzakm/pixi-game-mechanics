import "../src/_scss/main.scss"
import * as renderer from './core/renderer'
import * as Stats from 'stats.js'
import { initShadowcasting } from "./01_fov/shadowcasting";

renderer.initRenderer()

var stats = new Stats.default()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const shadowcasting = initShadowcasting(renderer.stage)


renderer.ticker.add((delta: number) => {
    stats.begin()

    shadowcasting()

    stats.end()
})