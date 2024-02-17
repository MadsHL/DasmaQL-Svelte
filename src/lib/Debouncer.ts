class Debouncer {
	private timerId: ReturnType<typeof setTimeout> | null = null;

	constructor(private delay: number) {}

	debounce(callback: () => void) {
		if (this.timerId) {
			clearTimeout(this.timerId);
		}

		this.timerId = setTimeout(() => {
			callback();
			this.timerId = null;
		}, this.delay);
	}
}

function debouncer(delay: number): Debouncer {
	return new Debouncer(delay);
}
export { debouncer };
