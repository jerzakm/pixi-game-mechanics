<script lang="ts">
	import PixiView from '$lib/PixiView.svelte';
	import { squareGrid } from '$lib/pixiUtil/pixiBackgrounds';
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { createWorld, initializeBox2D } from './physics/box2d';

	let mainScene = new PIXI.Container();
	let renderer: PIXI.Renderer;

	let applicationOptions: PIXI.IRendererOptions = {
		antialias: true,
		backgroundColor: 0x222222
	};

	const grid = squareGrid(48, { color: 0x444444, width: 1 });
	const bodiesGraphics = new PIXI.Graphics();

	let world: Box2D.b2World;

	let physicsStep;

	async function start() {
		mainScene.addChild(grid.graphics);
		mainScene.addChild(bodiesGraphics);
		const { box2D, helpers } = await initializeBox2D('/libraries/');
		const pixelsPerMeter = 1;
		const { b2BodyDef, b2CircleShape, b2Vec2, b2_dynamicBody, getPointer } = box2D;
		world = createWorld(box2D, { gravity: new b2Vec2(0, 5.0) });
		const cshape = new b2CircleShape();
		cshape.set_m_radius(0.5);
		const ZERO = new b2Vec2(0, 0);

		for (let i = 0; i < 20; i++) {
			const temp = new b2Vec2(Math.random() * 500, Math.random() * 200);
			const bd = new b2BodyDef();
			bd.set_type(b2_dynamicBody);
			bd.set_position(temp);
			const body = world.CreateBody(bd);
			const randomValue = Math.random();
			const shape = randomValue < 0.2 ? cshape : helpers.createRandomPolygonShape(0.5);
			body.CreateFixture(shape, 1.0);
			temp.Set(16 * (Math.random() - 0.5), 4.0 + 2.5 * i);
			// body.SetTransform(temp, 0.0);
			body.SetLinearVelocity(ZERO);
			body.SetEnabled(true);
		}

		physicsStep = () => {
			world && world.Step(1, 1, 1);

			let body = world.GetBodyList();
			bodiesGraphics.clear();
			bodiesGraphics.beginFill(0xeeeeee);
			while (getPointer(body)) {
				body = body.GetNext();
				const pos = body.GetPosition();
				bodiesGraphics.drawCircle(pos.x, pos.y, 30);
			}
			bodiesGraphics.endFill();
		};
	}

	const fps = 60;
	let lastFrame = 0;
	const step = (time: number = 0) => {
		const delta = time - lastFrame;
		lastFrame = time;

		grid.draw();

		physicsStep && physicsStep(delta);

		renderer.render(mainScene);
		requestAnimationFrame(step);
	};

	onMount(async () => {
		await start();
		step();
	});
</script>

<PixiView bind:applicationOptions bind:renderer />
