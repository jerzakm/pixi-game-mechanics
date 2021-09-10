---
title: Pixi.js preview component
category: Game mechanics
---

<script lang="ts">
    import PhysicsGame from './_PhysicsGame.svelte'

</script>

<PhysicsGame/>
<h2 class="text-light font-medium mt-8">{category}</h2>
<h1>{title}</h1>

Implementing a simple physics system to the game can be a great idea. It can handle movement, hit detection or movement. In this example, I am going to use Box2D to create a basic skeleton of a shooter game.

### Why Box 2D? Why WASM?

TODO: Short explainer Box 2D vs other 2d js engines, what is wasm.
