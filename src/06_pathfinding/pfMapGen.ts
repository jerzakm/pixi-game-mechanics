export const randomGrid = (size: number, density: number) => {
  const grid: boolean[][] = []

  for (let x = 0; x < size; x++) {
    grid.push([])
    for (let y = 0; y < size; y++) {
      grid[x][y] = Math.random() < density ? true : false
    }
  }

  return grid
}