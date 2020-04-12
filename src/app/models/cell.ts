import { GameObject } from './gameobject';
import { ICoords } from './icoords';

export class Cell extends GameObject {
	public iX: number;
	public iY: number;
	public cellSize: number;
	public offset: ICoords;

	get x() {
		return this.iX * this.cellSize + this.offset.x;
	}

	get y() {
		return this.iY * this.cellSize + this.offset.y;
	}

	constructor(iX: number, iY: number, cellSize: number, offset: number) {
		this.iX = iX;
		this.iY = iY;
		super()
	}
}
