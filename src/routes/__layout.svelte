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
			<h2>Pathfinding</h2>
			<a href="pathfinding/astar">A* search visualized</a>
			<a href="pathfinding/astarcrowds">A* with crowds and traffic</a>
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
	}
</style>
