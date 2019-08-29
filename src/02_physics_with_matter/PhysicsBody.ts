import { Body, Bodies, IChamferableBodyDefinition } from "matter-js";
import { Graphics } from "pixi.js";

export class PhysicsBody {
    physicsBody: Body
    options: IPhysicsBodyOptions
    offsetX: number
    offsetY: number


    constructor(options: IPhysicsBodyOptions) {                
        this.options = options
        this.physicsBody = Bodies.rectangle(this.options.x, this.options.y, this.options.width, this.options.height)
        this.offsetX = this.options.width/2
        this.offsetY = this.options.height/2                
    }

    public draw(g: Graphics) {
        // g.drawRect(this.physicsBody.position.x-this.offsetX, this.physicsBody.position.y-this.offsetY, this.options.width, this.options.height)        
        const polygon: number[] = []
        for(const v of this.physicsBody.vertices){
            polygon.push(v.x, v.y)
        }
        g.drawPolygon(polygon)
    }    
}

export interface IPhysicsBodyOptions {
    width: number,
    height: number,
    x: number,
    y: number,
    matterOptions?: IChamferableBodyDefinition
}