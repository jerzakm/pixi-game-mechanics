---
title: Simple shooter with Box2D physics
category: Game mechanics
---

<script lang="ts">
    import PhysicsGame from './_PhysicsGame.svelte'
</script>

<PhysicsGame />
<h2 class="text-light font-medium mt-8">{category}</h2>
<h1>{title}</h1>

Implementing a simple physics system to the game can be a great idea. It can handle movement, hit detection or movement.
In this example, I am going to use Box2D to create a basic skeleton of a shooter game.

### Why Box 2D? Why WASM?

TODO: Short explainer Box 2D vs other 2d js engines, what is wasm.

## Step 0 - Setting up Pixi viewer and gameloop ticker

Utilizing [previously prepared Pixi renderer](/other/pixiPreviewComponent)

```ts
<script lang="ts">
    import PixiView from '$lib/PixiView.svelte';
    import {
        squareGrid
    } from '$lib/pixiUtil/pixiBackgrounds';
    import {
        onMount
    } from 'svelte';
    import * as PIXI from 'pixi.js';

    let mainScene = new PIXI.Container();
    let renderer: PIXI.Renderer;

    let applicationOptions: PIXI.IRendererOptions = {
        antialias: true,
        backgroundColor: 0x222222
    };

    const grid = squareGrid(48, {
        color: 0x444444,
        width: 1
    });

    function start() {
        mainScene.addChild(grid.graphics);
    }

    const fps = 60;
    let lastFrame = 0;
    const step = (time: number = 0) => {
        const delta = time - lastFrame;
        lastFrame = time;

        grid.draw();
        // world.step(delta);

        renderer.render(mainScene);
        requestAnimationFrame(step);
    };

    onMount(async () => {
        await start();
        step();
    });
</script>

<PixiView bind:applicationOptions bind:renderer />

```

## Step 1 - Initializing Box2D

We are using [box2d-wasm](https://github.com/Birch-san/box2d-wasm) so I first have to initialize the web assembly
library with utility Factory class. I've had issues when my .wasm files were in `node_modules` so I've decided to copy
them to the static folder. As such, I had to adjust the `locateFile` parameter like this:

```ts
import Box2DFactory from 'box2d-wasm';

export const initializeBox2D = async (
	box2dPath = ''
): Promise<{ box2D: typeof Box2D & EmscriptenModule }> => {
	const box2D: typeof Box2D & EmscriptenModule = await Box2DFactory({
		locateFile: (url) => box2dPath + url
	});

	return { box2D };
};
```

Approach it like that allows me to specify the directory (in my case `/libraries/`), then initialize Box2D:

```ts
initializeBox2D('/libraries/');
```

## Step 2 - Physics helper functions

Next, I will use physics helper functions provided in the [box2d-wasm examples](https://github.com/Birch-san/box2d-wasm/blob/master/demo/svelte-rollup-ts/src/helpers.ts). One thing I don't like about it, is that everything is a class. I prefer to use more functional approach. Let's create an `initializeHelpers` function and attach it to `initalizeBox2D` from the previous step.

**Initialize helpers:**

```ts
const initializeHelpers = (box2D: typeof Box2D & EmscriptenModule) => {
	const copyVec2 = (vec: Box2D.b2Vec2): Box2D.b2Vec2 => {
		const { b2Vec2 } = box2D;
		return new b2Vec2(vec.get_x(), vec.get_y());
	};

	/** to replace original C++ operator * (float) */
	const scaleVec2 = (vec: Box2D.b2Vec2, scale: number): void => {
		vec.set_x(scale * vec.get_x());
		vec.set_y(scale * vec.get_y());
	};

	/** to replace original C++ operator *= (float) */
	const scaledVec2 = (vec: Box2D.b2Vec2, scale: number): Box2D.b2Vec2 => {
		const { b2Vec2 } = box2D;
		return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
	};

	// http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
	const createChainShape = (vertices: Box2D.b2Vec2[], closedLoop: boolean): Box2D.b2ChainShape => {
		const { _malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer } = box2D;
		const shape = new b2ChainShape();
		const buffer = _malloc(vertices.length * 8);
		let offset = 0;
		for (let i = 0; i < vertices.length; i++) {
			HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
			HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
			offset += 8;
		}
		const ptr_wrapped = wrapPointer(buffer, b2Vec2);
		if (closedLoop) {
			shape.CreateLoop(ptr_wrapped, vertices.length);
		} else {
			throw new Error('CreateChain API has changed in Box2D 2.4, need to update this');
			// shape.CreateChain(ptr_wrapped, vertices.length);
		}
		return shape;
	};

	const createPolygonShape = (vertices: Box2D.b2Vec2[]): Box2D.b2PolygonShape => {
		const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } = box2D;
		const shape = new b2PolygonShape();
		const buffer = _malloc(vertices.length * 8);
		let offset = 0;
		for (let i = 0; i < vertices.length; i++) {
			HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
			HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
			offset += 8;
		}
		const ptr_wrapped = wrapPointer(buffer, b2Vec2);
		shape.Set(ptr_wrapped, vertices.length);
		return shape;
	};

	const createRandomPolygonShape = (radius: number): Box2D.b2PolygonShape => {
		const { b2Vec2 } = box2D;
		let numVerts = 3.5 + Math.random() * 5;
		numVerts = numVerts | 0;
		const verts = [];
		for (let i = 0; i < numVerts; i++) {
			const angle = (i / numVerts) * 360.0 * 0.0174532925199432957;
			verts.push(new b2Vec2(radius * Math.sin(angle), radius * -Math.cos(angle)));
		}
		return createPolygonShape(verts);
	};

	return {
		copyVec2,
		scaleVec2,
		scaledVec2,
		createChainShape,
		createPolygonShape,
		createRandomPolygonShape
	};
};
```

Just like that the `initializeBox2D` function will also return helpers.

```ts
export const initializeBox2D = async (box2dPath = '') => {
	///....
	const helpers = initializeHelpers(box2D);
	return { box2D, helpers };
};
```
