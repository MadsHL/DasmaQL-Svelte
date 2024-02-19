export class CaretHandler {
	static getCaretCharacterOffsetWithin(element: Node | null): number | undefined {
		if (!element) return undefined;
		let caretOffset = 0;
		const selection = window.getSelection();

		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}

		return caretOffset;
	}

	static setCaretPosition(element: HTMLElement, offset: number): void {
		const range = document.createRange();
		const selection = window.getSelection();
		const { currentNode, targetOffset } = this.traverse(element, offset);

		if (currentNode === null) return;

		range.setStart(currentNode, targetOffset);
		range.collapse(true);

		if (selection) {
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	private static traverse(
		element: HTMLElement,
		offset: number
	): { currentNode: Node | null; targetOffset: number } {
		let currentNode: Node | null = null;
		let previousNode: Node | null = null;
		let targetOffset = offset;

		for (const childNode of element.childNodes) {
			previousNode = currentNode;
			currentNode = childNode;
			while (currentNode && currentNode.childNodes.length > 0) {
				currentNode = currentNode.childNodes[0];
			}
			targetOffset -= previousNode?.textContent?.length || 0;

			if (targetOffset <= (currentNode.textContent?.length || 0)) {
				break;
			}
		}
		return { currentNode, targetOffset };
	}

	static getCaretCoordinates(): { x: number; y: number } {
		const range = window.getSelection()?.getRangeAt(0);
		const rect = range?.getClientRects()[0];
		const caretHeight = range?.getClientRects()[0]?.height || 0;
		const yOffset = caretHeight || 0;

		return rect ? { x: rect.left + 2, y: rect.top + yOffset } : { x: 0, y: 0 };
	}
}
