<script lang="ts">
	import { debouncer } from '$lib/Debouncer';
	import { CaretHandler } from '$lib/CaretHandler';
	import { onMount } from 'svelte';
	import DasmaAutocomplete from '$lib/DasmaAutocomplete.svelte';
	import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	import { dasmaQlAutocomplete, dasmaQlHighlighter } from 'dasmaql';

	export let fields: string[] = [];
	export let callbackSearch: (
		field: string,
		search: string
	) => (string | { label: string })[] = () => {
		return [];
	};

	let autocomplete: dasmaQlAutocomplete;
	let highlighter: dasmaQlHighlighter;

	const debounceHighlighter = debouncer(200);
	const debounceAutocomplete = debouncer(400);

	let lastQl: string = '';
	let selectedSuggestion: string | { key: string; label: string } = '';
	let outputContainer: HTMLElement;

	let autocompleteKeyEvent: (event: KeyboardEvent) => void = () => {};
	let autocompletePotion = { x: 0, y: 0 };

	let showSuggestions = false;
	let suggestions: string[] = [];

	let currentPosition = 0;
	let selectedIndex = -1;

	const handleInputChange: FormEventHandler<HTMLDivElement> = (event) => {
		const input = getInputTextContent(event);
		if (input !== lastQl) {
			const outputContainer = event.target as HTMLElement;
			const position = CaretHandler.getCaretCharacterOffsetWithin(outputContainer);
			debounceHighlighter.debounce(() => {
				updateOutputContainer(input, position);
			});
		}

		lastQl = input;
	};

	const getSelectedSuggestionLabel = () => {
		if (typeof selectedSuggestion === 'object' && selectedSuggestion.label) {
			return selectedSuggestion.label;
		} else if (typeof selectedSuggestion === 'string') {
			return selectedSuggestion;
		}
		return '';
	};
	const getSelectedSuggestionKey = () => {
		if (typeof selectedSuggestion === 'object' && selectedSuggestion.key) {
			return selectedSuggestion.key;
		} else if (typeof selectedSuggestion === 'string') {
			return selectedSuggestion;
		}
		return '';
	};

	const handleSelectionChangeFromMouse: MouseEventHandler<HTMLDivElement> = () => {
		if (showSuggestions && selectedSuggestion) {
			showSuggestions = false;
			const selectedSuggestion = getSelectedSuggestionLabel();
			const newPosition =
				currentPosition + selectedSuggestion.length - autocomplete.getInput(currentPosition).length;

			const newQlString = autocomplete.insertSuggestion(currentPosition, selectedSuggestion);
			updateOutputContainer(newQlString, newPosition);
		}
	};

	const handleSelectionChangeFromKey: KeyboardEventHandler<HTMLDivElement> = (event) => {
		switch (event?.key) {
			case 'Shift':
			case 'Tab':
			case 'ArrowUp':
			case 'ArrowDown':
				if (showSuggestions) {
					event.preventDefault();
				}
				break;
			case 'Enter':
				event.preventDefault();
				handleEnterKey(event);
				break;
			default:
				currentPosition = getCaretPosition(event.target as Node) || 0;
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
	};

	const handleEnterKey: KeyboardEventHandler<HTMLDivElement> = (event) => {
		const selectedSuggestion = getSelectedSuggestionKey();
		showSuggestions = false;
		autocomplete.refresh(getInputTextContent(event));
		const newPosition =
			currentPosition + selectedSuggestion.length - autocomplete.getInput(currentPosition).length;
		const newQlString = autocomplete.insertSuggestion(currentPosition, selectedSuggestion);

		updateOutputContainer(newQlString, newPosition);
	};

	const getInputTextContent: FormEventHandler<HTMLDivElement> = (event) => {
		return `${(event?.target as HTMLElement)?.textContent || ''}`;
	};

	function getCaretPosition(target: Node | null) {
		return CaretHandler.getCaretCharacterOffsetWithin(target);
	}

	const updateSuggestionsVisibility = () => {
		if (suggestions?.length > 0) {
			showSuggestions = true;
			selectedIndex = -1;
		}
	};

	const updateOutputContainer = (newQlString: string, position: number | undefined) => {
		if (position === undefined) return;
		outputContainer.innerHTML = highlighter.highlight(newQlString);
		CaretHandler.setCaretPosition(outputContainer, position);
	};

	onMount(() => {
		outputContainer.addEventListener('selectionchange', (event) =>
			handleSelectionChangeFromKey(
				event as KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }
			)
		);

		highlighter = dasmaQlHighlighter({
			fields: fields
		});
		autocomplete = dasmaQlAutocomplete({
			fields: fields,
			callbackSearchParameter: callbackSearch
		});
	});
</script>

<div on:click={handleSelectionChangeFromMouse} on:keypress={() => {}} role="button" tabindex={0}>
	<div
		autocomplete="off"
		bind:this={outputContainer}
		class="dasma-input"
		contenteditable="true"
		id="output-container"
		on:input={handleInputChange}
		on:keydown={autocompleteKeyEvent}
		on:keyup={handleSelectionChangeFromKey}
		role="textbox"
		spellcheck="false"
		tabindex="0"
	/>
	<DasmaAutocomplete
		bind:handleKeyEvent={autocompleteKeyEvent}
		bind:selectedIndex
		bind:selectedSuggestion
		position={autocompletePotion}
		{suggestions}
		visible={showSuggestions}
	/>
</div>

<style lang="css">
	@import 'dasma-highlighter.css';
</style>
