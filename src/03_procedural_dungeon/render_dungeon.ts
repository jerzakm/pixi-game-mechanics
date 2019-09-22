import { Graphics, Container, Loader, Sprite } from "pixi.js"
import { Viewport } from 'pixi-viewport'
import { generateCellularAutomataGrid } from "./cellular_automata"
import { renderer } from "../core/renderer";

const loader = Loader.shared;

const g = new Graphics()
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: 1000,
  worldHeight: 1000,
})

const spriteSize = 140

const grid = generateCellularAutomataGrid()




export const initRenderDungeonGrid = (parentContainer: Container) => {
  parentContainer.addChild(g)
  parentContainer.addChild(viewport)



  viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()

  loadAssets()
  loader.load(() => {
    parseGrid()
  })

  return update
}

const parseGrid = () => {
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid.length; y++) {
      const floor = grid[x][y]
      const sprite = Sprite.from(loader.resources[`gravel${Math.floor(Math.random() * 5)}`].texture)
      sprite.position.x = x * 140
      sprite.position.y = y * 140
      viewport.addChild(sprite)

      if (!floor) {
        const sprite = Sprite.from(loader.resources[`wallFull`].texture)
        sprite.position.x = x * 140
        sprite.position.y = y * 140
        viewport.addChild(sprite)
        // grid[x - 1][y - 1]
        // grid[x - 1][y]
        // grid[x - 1][y + 1]
        // grid[x][y - 1]
        // grid[x][y + 1]
        // grid[x + 1][y - 1]
        // grid[x + 1][y]
        // grid[x + 1][y + 1]
      }
    }
  }
}

const loadAssets = () => {
  loader
    .add('gravel0', 'cave/FloorGravel.png')
    .add('gravel1', 'cave/FloorGravel1.png')
    .add('gravel2', 'cave/FloorGravel2.png')
    .add('gravel3', 'cave/FloorGravel3.png')
    .add('gravel4', 'cave/FloorGravel4.png')
    .add('wallFull', 'cave/WallFull.png')
}

const update = (delta: number) => {
  g.clear()
  g.lineStyle(2, 0x000000)
}