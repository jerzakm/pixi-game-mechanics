import { Graphics, Container, Loader, interaction, Text } from "pixi.js";
import { randomGrid } from "./pfMapGen";
import { Vector } from "matter-js";
import { distanceBetweenPoints } from "../math/coordMath";

const loader = Loader.shared;

const g = new Graphics()
const container = new Container()
const grid: boolean[][] = randomGrid(64, 0.5)
const cellSize = 10;

const label = new Text(`label`, { fill: '#ffffff', wordWrap: true, wordWrapWidth: 300, fontSize: 12 })
const hover = { x: 10, y: 10 }
const start = { x: 0, y: 0 }
const end = { x: grid.length - 1, y: grid.length - 1 }

export const initAStarViz = (parentContainer: Container) => {
  g.x = 100
  g.y = 50
  parentContainer.addChild(container)
  container.addChild(g)
  container.addChild(label)
  label.position.x = 300
  label.position.y = 20
  setupInteraction()
  startPathfinding()
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
    // labelUpdate()
  })
}

const labelUpdate = () => {
  label.text = `hover:     x:${hover.x}  y:${hover.y}`
}

const openSet: AStarCell[] = []
const closedSet: AStarCell[] = []
const aStarCellGrid: AStarCell[][] = []

const clearStartEnd = (r: number = 5) => {
  let s = 0
  clear(r, [start])
  clear(r, [end])

  function clear(i: number, points: Vector[]) {
    i -= 1
    if (i > 0) {
      for (const p of points) {
        grid[p.x][p.y] = false
        const n = calcNeighbours(p)
        clear(i, n)
      }
    }
  }
}

const startPathfinding = () => {
  clearStartEnd()
  while (openSet.length > 0) {
    openSet.shift()
  }
  while (closedSet.length > 0) {
    closedSet.shift()
  }

  openSet.push({ position: start, neigbours: calcNeighbours(start), f: 0, g: 0, h: 0 })

  for (let x = 0; x < grid.length; x++) {
    aStarCellGrid.push([])
    for (let y = 0; y < grid.length; y++) {
      aStarCellGrid[x][y] = { position: { x, y }, neigbours: calcNeighbours({ x, y }), f: 0, g: 0, h: 0 }
    }
  }
}

const calcNeighbours = ({ x, y }: Vector) => {
  const neighbours: Vector[] = []

  x - 1 >= 0 ? neighbours.push({ x: x - 1, y: y }) : null
  x - 1 >= 0 && y - 1 >= 0 ? neighbours.push({ x: x - 1, y: y - 1 }) : null
  x - 1 >= 0 && y + 1 < grid.length ? neighbours.push({ x: x - 1, y: y + 1 }) : null
  y - 1 >= 0 ? neighbours.push({ x: x, y: y - 1 }) : null
  x + 1 < grid.length && y - 1 >= 0 ? neighbours.push({ x: x + 1, y: y - 1 }) : null
  x + 1 < grid.length ? neighbours.push({ x: x + 1, y: y }) : null
  x + 1 < grid.length && y + 1 < grid.length ? neighbours.push({ x: x + 1, y: y + 1 }) : null
  y + 1 < grid.length ? neighbours.push({ x: x, y: y + 1 }) : null

  return neighbours
}

const path: AStarCell[] = []

let finished = false

let ticks = 0
let evals = 0


const pathfindingTick = () => {
  ticks++
  if (openSet.length > 0 && !finished) {
    let winner = 0
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i
      }
    }


    let current = openSet[winner]

    if (current.position.x == end.x && current.position.y == end.y) {
      finished = true
      console.log('done')
    }

    //evaluating path
    let temp = current
    path.splice(0, path.length)
    path.push(temp)
    while (temp.previous) {
      path.push(temp.previous)
      temp = temp.previous
    }


    removeFromArray(openSet, current)
    closedSet.push(current)

    for (const neighbour of current.neigbours) {
      const n = aStarCellGrid[neighbour.x][neighbour.y]
      if (!closedSet.includes(n) && !grid[n.position.x][n.position.y]) {
        let tempG = current.g + 1

        if (openSet.includes(n)) {
          if (tempG < n.g) {
            n.g = tempG
          }
        } else {
          n.g = tempG
          openSet.push(n)
        }

        n.h = distanceBetweenPoints(n.position, end)
        evals++
        n.f = n.g + n.h
        n.previous = current
      }
    }

  } else {
    finished = true
    console.log('no solution')
  }

  label.text = `
    ticks: ${ticks}
    evals: ${evals}
  `
}

const removeFromArray = (array: any[], element: any) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] == element) {
      array.splice(i, 1)
    }
  }
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
  g.drawRect(start.x * cellSize, start.y * cellSize, cellSize, cellSize)
  g.endFill()

  g.beginFill(0x33EE33)
  g.drawRect(end.x * cellSize, end.y * cellSize, cellSize, cellSize)
  g.endFill()

  g.beginFill(0x007700, 0.3)
  for (let i = 0; i < openSet.length; i++) {
    g.drawRect(openSet[i].position.x * cellSize, openSet[i].position.y * cellSize, cellSize, cellSize)
  }
  g.endFill()

  g.beginFill(0x880000, 0.3)
  for (let i = 0; i < closedSet.length; i++) {
    g.drawRect(closedSet[i].position.x * cellSize, closedSet[i].position.y * cellSize, cellSize, cellSize)
  }
  g.endFill()


  g.beginFill(0xFFEE22)
  for (const p of path) {
    g.drawCircle(p.position.x * cellSize + cellSize / 2, p.position.y * cellSize + cellSize / 2, cellSize / 4)
  }
  g.endFill()

  if (!finished) {
    pathfindingTick()
  }
}

interface AStarCell {
  position: Vector
  f: number
  g: number
  h: number
  neigbours: Vector[]
  previous?: AStarCell
}