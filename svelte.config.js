import preprocess from 'svelte-preprocess';

import {mdsvex} from 'mdsvex'



/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	extensions: ['.svelte', '.md'],
	preprocess: [
		preprocess(),
		mdsvex({
			extensions: ['.md']
		})
	],

	kit: {		
		target: '#svelte',
		ssr: false
	}
};

export default config;
