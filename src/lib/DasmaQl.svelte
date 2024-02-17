<script lang="ts">
	import { debouncer } from '$lib/Debouncer.ts';
	import { dasmaQlHighlighter, dasmaQlAutocomplete } from 'dasmaql';
	import { CaretHandler } from '$lib/CaretHandler';
	import { onMount } from 'svelte';
	import DasmaAutocomplete from '$lib/DasmaAutocomplete.svelte';

	export let fields = [];
	export let callbackSearch = () => {};

	let autocomplete;
	let highlighter;

	const debounceHighlighter = debouncer(200);
	const debounceAutocomplete = debouncer(400);

	let lastQl: string = '';
	let selectedSuggestion: string | { key: string; label: string } = '';
	let outputContainer;

	let autocompleteKeyEvent = {};
	let autocompletePotion = { x: 0, y: 0 };

	let showSuggestions = false;
	let suggestions: string[] = [];

	let currentPosition = 0;
	let selectedIndex = -1;

	function handleInputChange(event: InputEvent): void {
		const input = getInputTextContent(event);
		if (input !== lastQl) {
			const outputContainer = event.target as HTMLElement;
			const position = CaretHandler.getCaretCharacterOffsetWithin(outputContainer);
			debounceHighlighter.debounce(() => {
				updateOutputContainer(input, position);
			});
		}

		lastQl = input;
	}

	function getSelectedSuggestionLabel() {
		if (typeof selectedSuggestion === 'object' && selectedSuggestion.label) {
			return selectedSuggestion.label;
		} else if (typeof selectedSuggestion === 'string') {
			return selectedSuggestion;
		}
		return '';
	}
	function getSelectedSuggestionKey() {
		if (typeof selectedSuggestion === 'object' && selectedSuggestion.key) {
			return selectedSuggestion.key;
		} else if (typeof selectedSuggestion === 'string') {
			return selectedSuggestion;
		}
		return '';
	}

	function handleSelectionChange(event) {
		if (event.type === 'click') {
			if (showSuggestions && selectedSuggestion) {
				showSuggestions = false;
				const selectedSuggestion = getSelectedSuggestionLabel();
				const newPosition =
					currentPosition +
					selectedSuggestion.length -
					autocomplete.getInput(currentPosition).length;

				const newQlString = autocomplete.insertSuggestion(currentPosition, selectedSuggestion);
				updateOutputContainer(newQlString, newPosition);
			}
			return;
		}
		switch (event?.key) {
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				break;
			case 'Enter':
				event.preventDefault();
				handleEnterKey(event);
				break;
			default:
				currentPosition = getCaretPosition(event.target);
				autocompletePotion = CaretHandler.getCaretCoordinates();
				showSuggestions = false;
				debounceAutocomplete.debounce(() => {
					const input = getInputTextContent(event);
					if (input.length > 0) {
						suggestions = autocomplete.getSuggestions(currentPosition, input) || [];
						updateSuggestionsVisibility();
					}
				});
		}
	}

	function handleEnterKey(event) {
		const selectedSuggestion = getSelectedSuggestionKey();
		showSuggestions = false;
		autocomplete.refresh(getInputTextContent(event));

		console.log(getInputTextContent(event), autocomplete.getInput(currentPosition));

		console.log(currentPosition, autocomplete.getInput(currentPosition));
		const newPosition =
			currentPosition + selectedSuggestion.length - autocomplete.getInput(currentPosition).length;
		const newQlString = autocomplete.insertSuggestion(currentPosition, selectedSuggestion);

		updateOutputContainer(newQlString, newPosition);
	}

	function getInputTextContent(event) {
		return `${(event?.target as HTMLElement)?.textContent || ''}`;
	}

	function getCaretPosition(target) {
		return CaretHandler.getCaretCharacterOffsetWithin(target);
	}

	function updateSuggestionsVisibility() {
		if (suggestions?.length > 0) {
			showSuggestions = true;
			selectedIndex = -1;
		}
	}

	function updateOutputContainer(newQlString, position) {
		outputContainer.innerHTML = highlighter.highlight(newQlString);
		CaretHandler.setCaretPosition(outputContainer, position);
	}

	onMount(() => {
		outputContainer.addEventListener('selectionchange', (event) => handleSelectionChange(event));

		highlighter = dasmaQlHighlighter({
			fields: fields
		});
		autocomplete = dasmaQlAutocomplete({
			fields: fields,
			callbackSearchParameter: callbackSearch
		});
	});
</script>

<div on:click={handleSelectionChange}>
	<div
		role="textbox"
		tabindex="0"
		contenteditable="true"
		id="output-container"
		class="dasma-input"
		bind:this={outputContainer}
		on:input={handleInputChange}
		on:keydown={autocompleteKeyEvent}
		on:keyup={handleSelectionChange}
		autocomplete="off"
		spellcheck="false"
	></div>
	<DasmaAutocomplete
		{suggestions}
		visible={showSuggestions}
		bind:handleKeyEvent={autocompleteKeyEvent}
		bind:selectedSuggestion
		position={autocompletePotion}
		bind:selectedIndex
	/>
</div>

<style lang="css">
	@import 'static/dasma-highlighter.css';
</style>
