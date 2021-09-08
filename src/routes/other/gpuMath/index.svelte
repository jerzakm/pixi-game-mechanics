<script lang="ts">
	import Article from '$lib/Article.svelte';
	import { onMount } from 'svelte';
	import { GPU } from 'gpu.js';
	import { movingAverage } from '$lib/statistics/investingIndicators';
	import * as Papa from 'papaparse';

	const getData = async () => {
		const prices: number[] = [];

		const ethUsdRes = await fetch('/data/ETH_1D.csv');
		const ethUsd = await ethUsdRes.text();

		const { data } = Papa.parse(ethUsd, { header: true });
		for (const entry of data) prices.push(parseFloat(entry.Open));

		return { prices };
	};

	onMount(async () => {
		const { prices } = await getData();
		const timePeriods = 2;

		console.time('cpuSma');
		movingAverage(prices, timePeriods);
		console.timeEnd('cpuSma');
		console.time('cpuSma');
		movingAverage(prices, timePeriods);
		console.timeEnd('cpuSma');
		console.time('cpuSma');
		movingAverage(prices, timePeriods);
		console.timeEnd('cpuSma');

		const gpu = new GPU();

		const gpuSma = gpu
			.createKernel(function (prices, timePeriods, priceQty) {
				//@ts-ignore
				if (this.thread.x > priceQty - timePeriods) return 0;

				let sum = 0;
				for (let i = 0; i < timePeriods; i++) {
					sum += prices[this.thread.x + i];
				}
				//@ts-ignore
				return sum / timePeriods;
			})
			.setOutput([prices.length]);
		console.time('gpuSma');
		const gpuSmaRes = gpuSma(prices, timePeriods, prices.length);
		console.timeEnd('gpuSma');
		console.time('gpuSma');
		gpuSma(prices, timePeriods, prices.length);
		console.timeEnd('gpuSma');
		console.time('gpuSma');
		gpuSma(prices, timePeriods, prices.length);
		console.timeEnd('gpuSma');
		console.time('gpuSma');
		gpuSma(prices, timePeriods, prices.length);
		console.timeEnd('gpuSma');
		console.time('gpuSma');
		gpuSma(prices, timePeriods, prices.length);
		console.timeEnd('gpuSma');
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
