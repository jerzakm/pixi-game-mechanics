<script lang="ts">
	export let category: string = '';
	export let title: string = '';
</script>

<h2 class="category">{category}</h2>
<h1 class="title">{title}</h1>
<slot />

<style>
	.category {
		color: white;
		@apply mt-8;
		@apply font-medium;
	}
	.title {
		@apply mb-2;
	}
</style>
