import { Body, Bodies, IChamferableBodyDefinition } from "matter-js";
import { Graphics, Sprite } from "pixi.js";

export class PhysicsBody {
    physicsBody: Body
    options: IPhysicsBodyOptions
    offsetX: number
    offsetY: number
    sprite?: Sprite


    constructor(options: IPhysicsBodyOptions) {
        this.options = options
        this.physicsBody = Bodies.rectangle(this.options.x, this.options.y, this.options.width, this.options.height)
        this.physicsBody.restitution = 1
        this.offsetX = this.options.width / 2
        this.offsetY = this.options.height / 2
    }

    public setSprite(sprite: Sprite) {
        const scale = this.options.width / sprite.width
        sprite.scale.x = scale * 1.3
        sprite.scale.y = scale * 1.3
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5
        this.sprite = sprite
    }

    public draw(g: Graphics) {
        const polygon: number[] = []
        for (const v of this.physicsBody.vertices) {
            polygon.push(v.x, v.y)
        }
        g.drawPolygon(polygon)
        if (this.sprite) {
            this.sprite.position.x = Math.floor(this.physicsBody.position.x)
            this.sprite.position.y = Math.floor(this.physicsBody.position.y)
            this.sprite.zIndex = this.sprite.position.y
            g.drawCircle(this.sprite.position.x, this.sprite.position.y, 3)
            g.drawCircle(this.physicsBody.position.x, this.physicsBody.position.y, 3)
        }

    }
}

export interface IPhysicsBodyOptions {
    width: number,
    height: number,
    x: number,
    y: number,
    matterOptions?: IChamferableBodyDefinition
}