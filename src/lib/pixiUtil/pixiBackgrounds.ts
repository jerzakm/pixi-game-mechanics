import * as PIXI from 'pixi.js';

export const squareGrid  = (squareSize = 32, lineStyle: PIXI.ILineStyleOptions={width: 1, color:0xffffff}, gridWidth = 4000, gridHeight = 4000,  ) => {
    
    const graphics = new PIXI.Graphics()

    const draw = () => {
        graphics.clear()
        graphics.lineStyle(lineStyle)
        for(let x = 0; x< gridWidth;x++) {
            if(x%squareSize==0){
                graphics.moveTo(x, 0)
                graphics.lineTo(x, gridHeight)
            }        
        }
        for(let y = 0; y< gridHeight;y++) {
            if(y%squareSize==0){
                graphics.moveTo(0, y)
                graphics.lineTo(gridWidth, y)
            }        
        }
    }

    return {graphics, draw}
}