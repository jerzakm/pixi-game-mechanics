<script lang="ts">
	import PixiView from '$lib/PixiView.svelte';
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let app;
	let mainScene;
	let step;

	let applicationOptions: PIXI.IApplicationOptions = {
		backgroundColor: 0xffffff
	};

	const texture = PIXI.Texture.from('/assets/meeple.png');

	const meeple = new PIXI.Sprite(texture);
	meeple.anchor.set(0.5);

	function start() {
		console.log(app.renderer.options);
		mainScene.addChild(meeple);

		meeple.x = app.renderer.options.width / 2;
		meeple.y = app.renderer.options.height / 2;

		step = (delta: number) => {
			meeple.rotation -= 0.01 * delta;
		};
	}

	onMount(async () => {
		await start();
	});
</script>

<PixiView bind:app bind:mainScene bind:step bind:applicationOptions />
