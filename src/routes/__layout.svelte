<script lang="ts">
	import { page } from '$app/stores';
	import '../styles/tailwind-output.css';
	import '../styles.scss';
	$: active = $page.path;
</script>

<main>
	<menu>
		<h1 class="title"><a href="/">Math, graphics & game stuff </a></h1>
		<a href="/">Home</a>
		<nav aria-label="Pathfinding">
			<h2>Game Mechanics</h2>
			<a href="/gameMechanics/simpleBox2dPhysics">Simple shooter with Box2D physics</a>
		</nav>
		<nav aria-label="Other">
			<h2>Other</h2>
			<a href="/other/pixiPreviewComponent">Pixi.js preview component</a>
		</nav>
	</menu>

	<content>
		<slot />
	</content>
</main>

<style lang="postcss">
	.title {
		@apply mb-8;
	}
	main {
		@apply flex m-4 flex-wrap;
	}

	nav {
		@apply flex flex-col;
	}
	nav a {
		@apply ml-4;
	}

	menu {
		flex-basis: 20rem;
		@apply flex-grow;
	}

	content {
		flex-grow: 999;
		flex-basis: 0;
		@apply px-8;
	}
</style>
