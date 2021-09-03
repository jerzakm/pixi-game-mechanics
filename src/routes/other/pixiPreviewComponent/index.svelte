<script lang="ts">
	import PixiView from '$lib/PixiView.svelte';
	import Article from '$lib/Article.svelte';
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let mainScene = new PIXI.Container();
	let renderer: PIXI.Renderer;

	let applicationOptions: PIXI.IRendererOptions = {
		backgroundColor: 0x666666
	};

	const texture = PIXI.Texture.from('/assets/meeple.png');

	const meeple = new PIXI.Sprite(texture);
	meeple.anchor.set(0.5);

	function start() {
		mainScene.addChild(meeple);
	}

	const fps = 60;
	let lastFrame = 0;
	const step = (time: number = 0) => {
		const delta = time - lastFrame;
		lastFrame = time;
		meeple.x = renderer.options.width / 2;
		meeple.y = renderer.options.height / 2;
		meeple.rotation += 0.001 * delta;

		renderer.render(mainScene);
		requestAnimationFrame(step);
	};

	onMount(async () => {
		await start();
		step();
	});
</script>

<PixiView bind:applicationOptions bind:renderer />

<Article category={'Other'} title={'Pixi.js preview component'}>
	<p>Simple Svelte component consisting of Pixi.JS powered canvas.</p></Article
>
