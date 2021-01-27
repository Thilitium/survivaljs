import { Component, OnInit } from '@angular/core';
import { IPlayer } from 'src/app/models/iplayer';
import { Players } from 'src/app/services/players';
import { EngineService } from '../../services/engine.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
	constructor(private engine: EngineService) { }

	public player: IPlayer = null;

	ngOnInit() {
		this.engine.start();
		this.player = Players.getActive();
	}
}
