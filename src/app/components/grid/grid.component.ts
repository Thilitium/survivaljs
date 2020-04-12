import { Component, OnInit } from '@angular/core';
import { GameObject } from 'src/app/models/gameobject';

@Component({
	selector: 'app-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

	private cells: Array<Array<GameObject>>;
	private nbX: number;
	private nbY: number;

	constructor() {
		this.nbX = 60;
		this.nbY = 60;
		this.cells = [];

		// Creating an empty grid.
		for (let i = 0; i < this.nbX; ++i) {
			const row = [];
			this.cells.push(row);
			for (let j = 0; j < this.nbY; ++j) {
				row.push(null);
			}
		}
	}

	private createGrid(): void {

	}

	ngOnInit() {
	}

}
