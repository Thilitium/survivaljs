import { ICoords } from "./icoords";

export class Mouse implements ICoords {
	private static instance: Mouse = null;

	public x: number = 0;
	public y: number = 0;

	private constructor() { }

	public static get(): Mouse {
		if (this.instance === null) {
			this.instance = new Mouse();
		}

		return this.instance;
	}
}
