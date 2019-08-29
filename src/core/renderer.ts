import * as PIXI from 'pixi.js'


export let renderer: PIXI.Renderer
export let ticker = PIXI.Ticker.shared
export let stage: PIXI.Container


export function initRenderer() {
  renderer = new PIXI.Renderer(
    {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xAAAAAA,
      forceFXAA: false,
      antialias: false,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
      preserveDrawingBuffer: false
    }
  )

  ticker = new PIXI.Ticker()
  ticker.maxFPS = 144

  stage = new PIXI.Container();

  ticker.add(() => {
    renderer.render(stage)
  }, PIXI.UPDATE_PRIORITY.HIGH)

  ticker.start()

  document.body.appendChild(renderer.view)

  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
}
