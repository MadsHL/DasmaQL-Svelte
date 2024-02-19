<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	export let suggestions: string[] = [];
	export let position = { x: 0, y: 0 };
	export let visible = false;

	export let selectedSuggestion: string | { key: string; label: string } = '';
	export let selectedIndex = -1;

	let menuElement: HTMLElement;

	export const handleMouseClick: MouseEventHandler<HTMLLIElement> = (event) => {
		if (!event.target) return;
		const selectedIndex = Array.from(menuElement.children).indexOf(<Element>event.target);
		if (selectedIndex !== -1 && selectedIndex < suggestions.length) {
			selectedSuggestion = getKey(suggestions[selectedIndex]);
		}
	};
	export const handleKeyEvent = (event: KeyboardEvent) => {
		if (!visible) return;
		if (event.key === 'ArrowUp' || (event.shiftKey && event.key === 'Tab')) {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (['ArrowDown', 'Tab'].includes(event.key)) {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
		} else if (event.key === 'Enter') {
			if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
				selectedSuggestion = getKey(suggestions[selectedIndex]);
			}
		}
	};

	const getLabel = (suggestion: { label: string } | string): string => {
		if (typeof suggestion === 'object' && suggestion.label) {
			return suggestion.label;
		} else if (typeof suggestion === 'string') {
			return suggestion;
		}
		return '';
	};

	const getKey = (suggestion: { key: string } | string): string => {
		if (typeof suggestion === 'object' && suggestion.key) {
			return suggestion.key;
		} else if (typeof suggestion === 'string') {
			return suggestion;
		}
		return '';
	};
</script>

{#if visible}
	<ul
		role="menu"
		style="left: {position.x}px; top: {position.y}px;"
		bind:this={menuElement}
		class="dasma-autocomplete"
	>
		{#each suggestions as suggestion, index}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<li
				role="menuitem"
				tabindex={index}
				class:selected={index === selectedIndex}
				on:click={handleMouseClick}
			>
				{getLabel(suggestion)}
			</li>
		{/each}
	</ul>
{/if}

<style lang="css">
	@import 'dasma-autocomplete.css';
</style>
