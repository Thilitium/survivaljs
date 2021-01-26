import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { DrawEvent } from "../events/draw-event";
import { ICoords } from "./icoords";

export abstract class GameObject implements ICoords {
	public x: number;
	public y: number;
	public width: number;
	public height: number;

	public boundingBox(): { start: ICoords, end: ICoords } {
		return {
			start: this,
			end: {
				x: this.x + this.width,
				y: this.y + this.height
			}
		};
	}

	public center(): ICoords {
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2
		};
	}

	private draw(e: DrawEvent): void {
		console.warn('unable to draw GameObject ', this);
		return;
	}
}
