import { Component, OnInit } from '@angular/core';
import { IPlayer } from 'src/app/models/iplayer';
import { EngineService } from 'src/app/services/engine.service';
import { Players } from 'src/app/services/players';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
	private engine: EngineService;
	constructor() {
		this.engine = EngineService.get();
	}

	public player: IPlayer = null;

	ngOnInit() {
		this.engine.start();
		this.player = Players.getActive();
	}
}
