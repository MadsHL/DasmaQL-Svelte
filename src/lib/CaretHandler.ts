export class CaretHandler {
	static getCaretCharacterOffsetWithin(element: HTMLElement): number {
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
		let currentNode: Node | null = null;
		let previousNode: Node | null = null;

		for (let i = 0; i < element.childNodes.length; i++) {
			previousNode = currentNode;
			currentNode = element.childNodes[i];

			while (currentNode && currentNode.childNodes.length > 0) {
				currentNode = currentNode.childNodes[0];
			}

			if (previousNode != null) {
				offset -= previousNode.textContent?.length || 0;
			}

			if (currentNode && offset <= (currentNode.textContent?.length || 0)) {
				break;
			}
		}

		if (currentNode != null) {
			range.setStart(currentNode, offset);
			range.collapse(true);

			if (selection) {
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	}

	static getCaretCoordinates(): { x: number; y: number } {
		const range = window.getSelection()?.getRangeAt(0);
		const rect = range?.getClientRects()[0];
		const caretHeight = range?.getClientRects()[0]?.height || 0;
		const yOffset = caretHeight ? caretHeight : 0;

		return rect ? { x: rect.left + 2, y: rect.top + yOffset } : { x: 0, y: 0 };
	}
}
