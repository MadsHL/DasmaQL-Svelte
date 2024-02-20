<script lang="ts">
	import { DasmaQl } from '$lib';
	import { levenshteinSearchSort } from 'dasmaql/src/modules/levenshteinDistance';
	import { type QlModel } from 'dasmaql/src/modules/dasmaQlSyntax';

	interface DummyData {
		[key: string]: { key: string; label: string }[];
	}

	const dummyData: DummyData = {
		current_task: [
			{
				key: 'currentTask()',
				label: 'currentTask()'
			},
			{ key: '"Debugging"', label: 'Debugging' },
			{ key: '"Refactoring"', label: 'Refactoring' },
			{ key: '"Writing Unit Tests"', label: 'Writing Unit Tests' },
			{ key: '"Browsing Stack Overflow"', label: 'Browsing Stack Overflow' },
			{ key: '"Coffee Break"', label: 'Coffee Break' },
			{ key: '"Fixing Merge Conflicts"', label: 'Fixing Merge Conflicts' },
			{ key: '"Learning New Framework"', label: 'Learning New Framework' },
			{ key: '"Updating Dependencies"', label: 'Updating Dependencies' },
			{ key: '"Code Reviewing"', label: 'Code Reviewing' },
			{ key: '"Deploying to Production"', label: 'Deploying to Production' },
			{ key: '"Writing Documentation"', label: 'Writing Documentation' },
			{ key: '"Fixing Production Bugs"', label: 'Fixing Production Bugs' },
			{ key: '"Participating in Scrum Meeting"', label: 'Participating in Scrum Meeting' },
			{ key: '"Crying Over Deprecated APIs"', label: 'Crying Over Deprecated APIs' }
		],
		today_mood: [
			{
				key: 'todayMood()',
				label: 'todayMood()'
			},
			{ key: '"Motivated"', label: 'Motivated' },
			{ key: '"NeedCoffee"', label: 'NeedCoffee' },
			{ key: '"Overwhelmed"', label: 'Overwhelmed' },
			{ key: '"Energized"', label: 'Energized' },
			{ key: '"Frustrated"', label: 'Frustrated' },
			{ key: '"Procrastinating"', label: 'Procrastinating' },
			{ key: '"Curious"', label: 'Curious' },
			{ key: '"In the Zone"', label: 'In the Zone' },
			{ key: '"Confused by Compiler Errors"', label: 'Confused by Compiler Errors' },
			{ key: '"Proud of My Code"', label: 'Proud of My Code' },
			{ key: '"Scared of Breaking Something"', label: 'Scared of Breaking Something' },
			{ key: '"Wondering Why I Chose Programming"', label: 'Wondering Why I Chose Programming' },
			{ key: '"Looking Forward to the Weekend"', label: 'Looking Forward to the Weekend' },
			{ key: '"Missing Semicolon"', label: 'Missing Semicolon' }
		],
		current_error: [
			{
				key: 'currentError()',
				label: 'currentError()'
			},
			{ key: '"SyntaxError"', label: 'SyntaxError' },
			{ key: '"NullReferenceException"', label: 'NullReferenceException' },
			{ key: '"Memory Leak"', label: 'Memory Leak' },
			{ key: '"Infinite Loop"', label: 'Infinite Loop' },
			{ key: '"Segmentation Fault"', label: 'Segmentation Fault' },
			{ key: '"Unhandled Exception"', label: 'Unhandled Exception' },
			{ key: '"Compilation Error"', label: 'Compilation Error' },
			{ key: '"Deprecated API Usage"', label: 'Deprecated API Usage' },
			{ key: '"Version Control Conflict"', label: 'Version Control Conflict' },
			{ key: '"Missing Dependency"', label: 'Missing Dependency' },
			{ key: '"Environment Mismatch"', label: 'Environment Mismatch' },
			{ key: '"Failed Deployment"', label: 'Failed Deployment' },
			{ key: '"Broken Build"', label: 'Broken Build' },
			{ key: '"Security Vulnerability"', label: 'Security Vulnerability' }
		],
		commit_message: [
			{
				key: 'latestCommitMessage()',
				label: 'latestCommitMessage()'
			},
			{ key: '"Fixed it, I guess?"', label: 'Fixed it, I guess?' },
			{ key: '"Oops, broke everything"', label: 'Oops, broke everything' },
			{ key: '"TODO: Implement this"', label: 'TODO: Implement this' },
			{ key: '"Finally fixed that bug"', label: 'Finally fixed that bug' },
			{ key: '"This should work now"', label: 'This should work now' },
			{ key: '"Hacky fix, but it works"', label: 'Hacky fix, but it works' },
			{ key: '"Revert this commit ASAP"', label: 'Revert this commit ASAP' },
			{ key: '"Added missing semicolon"', label: 'Added missing semicolon' },
			{ key: '"Why is this even working?"', label: 'Why is this even working?' },
			{ key: '"Temporary fix"', label: 'Temporary fix' },
			{ key: '"Refactored the entire module"', label: 'Refactored the entire module' },
			{ key: '"Removed unused code"', label: 'Removed unused code' },
			{ key: '"Fixed memory leak"', label: 'Fixed memory leak' },
			{ key: '"Updated deprecated API"', label: 'Updated deprecated API' },
			{ key: "\"Merge branch 'fix' into 'master'\"", label: "Merge branch 'fix' into 'master'" }
		],
		drink_of_choice: [
			{
				key: 'currentBeverage()',
				label: 'currentBeverage()'
			},
			{ key: '"Espresso"', label: 'Espresso' },
			{ key: '"Mountain Dew"', label: 'Mountain Dew' },
			{ key: '"Water - Stay hydrated!"', label: 'Water - Stay hydrated!' },
			{ key: '"Green Tea"', label: 'Green Tea' },
			{ key: '"Craft Beer"', label: 'Craft Beer' },
			{ key: '"Soy Latte"', label: 'Soy Latte' },
			{ key: '"Black Coffee"', label: 'Black Coffee' },
			{ key: '"Energy Drink"', label: 'Energy Drink' },
			{ key: '"Kombucha"', label: 'Kombucha' },
			{ key: '"Herbal Tea"', label: 'Herbal Tea' },
			{ key: '"Chai Latte"', label: 'Chai Latte' },
			{ key: '"Cold Brew"', label: 'Cold Brew' },
			{ key: '"Protein Shake"', label: 'Protein Shake' },
			{ key: '"Just a simple cup of water"', label: 'Just a simple cup of water' }
		],
		keyboard_shortcut: [
			{
				key: 'favouriteShortcut()',
				label: 'favouriteShortcut()'
			},
			{
				key: '"Cmd + Space"',
				label: 'Cmd + Space - Spotlight search, because why navigate when you can search?'
			},
			{ key: '"Cmd + Tab"', label: "Cmd + Tab - The developer's merry-go-round." },
			{ key: '"Cmd + Z"', label: 'Cmd + Z - Time travel (Undo).' },
			{ key: '"Cmd + Shift + Z"', label: 'Cmd + Shift + Z - Time travel with a twist (Redo).' },
			{ key: '"Cmd + `"', label: 'Cmd + ` - Window hopping, because why stick to one?' },
			{ key: '"Cmd + W"', label: 'Cmd + W - The panic button (Close Window).' },
			{ key: '"Cmd + Q"', label: 'Cmd + Q - Quit. Because sometimes, enough is enough.' },
			{ key: '"Cmd + N"', label: 'Cmd + N - Begin anew (New Window).' },
			{ key: '"Cmd + T"', label: 'Cmd + T - New tab, new possibilities.' },
			{
				key: '"Cmd + Shift + T"',
				label: 'Cmd + Shift + T - Regret minimizer (Reopen closed tab).'
			},
			{ key: '"Cmd + F"', label: 'Cmd + F - Find. Because who reads code these days?' },
			{ key: '"Cmd + G"', label: 'Cmd + G - Find again, because once is never enough.' },
			{
				key: '"Cmd + Option + I"',
				label: "Cmd + Option + I - Developer Tools, the developer's playground."
			},
			{ key: '"Cmd + B"', label: 'Cmd + B - Build, the moment of truth.' },
			{ key: '"Cmd + R"', label: 'Cmd + R - Run, and hold your breath.' }
		]
	};

	function syntaxHighlight(jsonObject: QlModel) {
		try {
			return JSON.stringify(jsonObject, null, 2)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(
					/("(\\u[a-zA-Z0-9]{4}|\\[^\\]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
					(match) => {
						let cls = 'json-number';
						if (/^"/.test(match)) {
							if (/:$/.test(match)) {
								cls = 'json-key';
							} else {
								cls = 'json-string';
							}
						} else if (/true|false/.test(match)) {
							cls = 'json-boolean';
						} else if (/null/.test(match)) {
							cls = 'json-null';
						}
						return '<span class="' + cls + '">' + match + '</span>';
					}
				);
		} catch (error) {
			console.error('Invalid JSON:', error);
			return '';
		}
	}

	const fields = Object.keys(dummyData);

	let qlModel: QlModel;
	let generateModel: () => QlModel;

	const callbackSearch = (field: string, search: string): (string | { label: string })[] => {
		const values = dummyData[field.toLowerCase()];

		return levenshteinSearchSort(values, search).slice(0, 10);
	};

	let outputModel = () => {
		qlModel = generateModel();
	};
</script>

<DasmaQl {fields} {callbackSearch} bind:generateModel />
<button on:click={outputModel}>Try me out!</button>
<br />
<div class="json-output">
	<pre>{@html qlModel ? syntaxHighlight(qlModel) : ''}</pre>
</div>

<style>
	button {
		background-color: #4caf50;
		color: white;

		padding: 20px 40px;
		border: none;
		cursor: pointer;
		border-radius: 10px;
		font-size: 20px;
		display: block;
		margin: 20px auto;
	}

	button:hover {
		background-color: #45a049;
	}

	.json-output {
		overflow: auto;
		font-family: monospace;

		width: calc(100% - 40px);
		padding: 12px;
		margin: 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		resize: vertical;
		font-size: 14px;
		height: calc(100vh - 250px);
		background-color: #f8f8f8;
	}

	:global(.json-string) {
		color: green;
	}

	:global(.json-number) {
		color: blue;
	}

	:global(.json-boolean) {
		color: orange;
	}

	:global(.json-null) {
		color: grey;
	}

	:global(.json-key) {
		color: brown;
	}
</style>
