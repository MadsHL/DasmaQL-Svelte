<script lang="ts">
	import { debouncer } from '$lib/Debouncer';
	import { CaretHandler } from '$lib/CaretHandler';
	import { onMount } from 'svelte';
	import DasmaAutocomplete from '$lib/DasmaAutocomplete.svelte';
	import type { FormEventHandler, KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';
	import {
		dasmaQlAutocomplete,
		type QlAutocomplete
	} from 'dasmaql/src/modules/dasmaQlAutocomplete';
	import { dasmaQlHighlighter, type QlHighlighter } from 'dasmaql/src/modules/dasmaQlHighlighter';
	import { dasmaQlSyntax, type QlSyntax, type QlModel } from 'dasmaql/src/modules/dasmaQlSyntax';

	export let fields: string[] = [];
	export let callbackSearch: (
		field: string,
		search: string
	) => (string | { label: string })[] = () => {
		return [];
	};

	let autocomplete: QlAutocomplete;
	let highlighter: QlHighlighter;
	let syntaxModel: QlSyntax;

	const debounceHighlighter = debouncer(200);
	const debounceAutocomplete = debouncer(350);

	let lastQl: string = '';
	let selectedSuggestion: string | { key: string; label: string } = '';
	let outputContainer: HTMLElement;

	let autocompleteKeyEvent: (event: KeyboardEvent) => void = () => {};
	let autocompletePotion = { x: 0, y: 0 };

	let showSuggestions = false;
	let suggestions: string[] = [];

	let currentPosition = 0;
	let selectedIndex = -1;

	export const generateModel: () => QlModel = () => {
		const input = outputContainer.innerText.trim();
		const model: QlModel = syntaxModel.parse(input);

		if (model.validation?.error?.location.start) {
			CaretHandler.setCaretPosition(outputContainer, model.validation.error.location.start.offset);
		}
		return model;
	};

	const handleInputChange: FormEventHandler<HTMLDivElement> = (event) => {
		const input = getInputTextContent();
		if (input !== lastQl) {
			const outputContainer = event.target as HTMLElement;
			const position = CaretHandler.getCaretCharacterOffsetWithin(outputContainer);
			debounceHighlighter.debounce(() => {
				updateOutputContainer(input, position);
			});
		}

		lastQl = input;
	};
	const getSelectedSuggestionKey = () => {
		if (typeof selectedSuggestion === 'object' && selectedSuggestion.key) {
			return selectedSuggestion.key;
		} else if (typeof selectedSuggestion === 'string') {
			return selectedSuggestion;
		}
		return '';
	};

	const handleSelectionChangeFromClick: MouseEventHandler<HTMLDivElement> = () => {
		if (showSuggestions && selectedSuggestion) {
			handleSelected();
		} else if (!showSuggestions) {
			updateSuggestions();
		}
	};

	const handleSelectionChange: KeyboardEventHandler<HTMLDivElement> = (event) => {
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
				handleSelected();
				break;
			default:
				updateSuggestions();
		}
	};

	const updateSuggestions = () => {
		currentPosition = getCaretPosition() || 0;
		autocompletePotion = CaretHandler.getCaretCoordinates();
		showSuggestions = false;
		debounceAutocomplete.debounce(() => {
			const input = getInputTextContent();
			if (input.length > 0) {
				suggestions = autocomplete.getSuggestions(currentPosition, input) || [];
				updateSuggestionsVisibility();
			}
		});
	};

	const handleSelected = () => {
		const selectedSuggestion = getSelectedSuggestionKey();
		showSuggestions = false;
		autocomplete.refresh(getInputTextContent());
		const newPosition =
			currentPosition + selectedSuggestion.length - autocomplete.getInput(currentPosition).length;
		const newQlString = autocomplete.insertSuggestion(currentPosition, selectedSuggestion);

		updateOutputContainer(newQlString, newPosition);
	};

	const getInputTextContent = (): string => {
		return `${outputContainer.textContent || ''}`;
	};

	function getCaretPosition() {
		return CaretHandler.getCaretCharacterOffsetWithin(outputContainer as Node);
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
			handleSelectionChange(
				event as KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }
			)
		);

		highlighter = dasmaQlHighlighter({
			fields: fields
		});
		autocomplete = dasmaQlAutocomplete({
			fields: fields,
			callbackSearchParameter: callbackSearch as (field: string, search: string) => object[]
		});
		syntaxModel = dasmaQlSyntax({
			fields: fields
		});
	});
</script>

<div on:click={handleSelectionChangeFromClick} on:keypress={() => {}} role="button" tabindex={0}>
	<div
		autocomplete="off"
		bind:this={outputContainer}
		class="dasma-input"
		contenteditable="true"
		id="output-container"
		on:input={handleInputChange}
		on:keydown={autocompleteKeyEvent}
		on:keyup={handleSelectionChange}
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
