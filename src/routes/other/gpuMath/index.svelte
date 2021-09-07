<script lang="ts">
	import Article from '$lib/Article.svelte';
	import { onMount } from 'svelte';
	import { GPU } from 'gpu.js';

	const generateMatrices = () => {
		const matrices = [[], []];
		for (let y = 0; y < 512; y++) {
			matrices[0].push([]);
			matrices[1].push([]);
			for (let x = 0; x < 512; x++) {
				matrices[0][y].push(Math.random());
				matrices[1][y].push(Math.random());
			}
		}
		return matrices;
	};

	onMount(async () => {
		const ethUsdRes = await fetch('/data/ETH_USD_DAILY.csv');
		const ethUsd = await ethUsdRes.text();

		console.log(ethUsd);

		const gpu = new GPU();
		const multiplyMatrix = gpu
			.createKernel(function (a, b) {
				let sum = 0;
				for (let i = 0; i < 512; i++) {
					sum += a[this.thread.y][i] * b[i][this.thread.x];
				}
				return sum;
			})
			.setOutput([512, 512]);
		const matrices = generateMatrices();
		const out = multiplyMatrix(matrices[0], matrices[1]);
		console.log(out);
	});
</script>

<Article
	category={'Other'}
	title={'Computation performance for large datasets and matrices with GPU'}
>
	<p>
		The goal of this experiment is to get familiar with gpu.js library and see if it's viable for
		boosting performance of computation heavy apps.
	</p></Article
>
