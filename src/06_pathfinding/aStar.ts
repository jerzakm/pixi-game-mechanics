import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { randomGrid } from "./pfMapGen";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()
const grid: boolean[][] = randomGrid(48, 0.3)
const cellSize = 16;

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })
const hover = { x: 10, y: 10 }
const from = { x: 0, y: 0 }
const to = { x: 10, y: 10 }

export const initAStarViz = (parentContainer: Container) => {
  g.x = 100
  g.y = 100
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20
  setupInteraction()

  return update
}

let setStart = false


const setupInteraction = () => {
  g.interactive = true
  g.buttonMode = true

  g.on('pointerdown', (e: interaction.InteractionEvent) => {

  })
  g.on('pointermove', (e: interaction.InteractionEvent) => {
    const loc = e.data.getLocalPosition(g)
    hover.x = Math.max(0, Math.floor(loc.x / cellSize) > grid.length - 1 ? grid.length - 1 : Math.floor(loc.x / cellSize))
    hover.y = Math.max(0, Math.floor(loc.y / cellSize) > grid.length - 1 ? grid.length - 1 : Math.floor(loc.y / cellSize))
    labelUpdate()
  })
}

const labelUpdate = () => {
  label.text = `hover:     x:${hover.x}  y:${hover.y}`
}


const update = (delta: number) => {
  g.clear()
  g.beginFill(0x888888)
  g.drawRect(0, 0, grid.length * cellSize, grid.length * cellSize)
  g.endFill()

  g.beginFill(0x121212)
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y]) {
        g.drawRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }
  g.endFill()

  g.lineStyle(2, 0x22FF44)
  g.drawRect(hover.x * cellSize, hover.y * cellSize, cellSize, cellSize)
  g.lineStyle(0)

  g.beginFill(0x333EE)
  g.drawRect(from.x * cellSize, from.y * cellSize, cellSize, cellSize)
  g.endFill()

  g.beginFill(0x33EE33)
  g.drawRect(to.x * cellSize, to.y * cellSize, cellSize, cellSize)
  g.endFill()
}