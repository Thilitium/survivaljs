import { Component, OnInit } from '@angular/core';
import { EngineService } from '../../services/engine.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
	constructor(private engine: EngineService) { }

	ngOnInit() {
		this.engine.start();
	}
}
