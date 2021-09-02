<script lang="ts">
	import { page } from '$app/stores';
	// import '../styles/tailwind-output.css';
	import '../styles.scss';
	$: active = $page.path;
</script>

{active}
<main>
	<slot />
</main>
