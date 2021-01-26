import { ICoords } from "src/app/models/icoords";

export module Math2 {
	export function dist(a: ICoords, b: ICoords): number {
		return Math.sqrt(
			Math.pow(a.x - b.x, 2) +
			Math.pow(a.y - b.y, 2)
		);
	}


	export function isInBoundingBox(selStart: ICoords, selEnd: ICoords, element: ICoords) {
		if (selStart.x > selEnd.x) {
			if (!(element.x <= selStart.x && element.x >= selEnd.x))
				return false;
		} else {
			if (!(element.x <= selEnd.x && element.x >= selStart.x))
				return false;
		}

		if (selStart.y > selEnd.y) {
			if (!(element.y <= selStart.y && element.y >= selEnd.y))
				return false;
		} else {
			if (!(element.y <= selEnd.y && element.y >= selStart.y))
				return false;
		}

		return true;
	}
}
