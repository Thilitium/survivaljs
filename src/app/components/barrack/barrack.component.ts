import { Component, OnInit, ViewChild, Input, ElementRef, OnDestroy } from '@angular/core';
import { Barrack } from '../../models/barrack';
import { ICreep } from '../../models/icreep';
import { EngineService } from '../../services/engine.service';
import { PlayerPipe } from 'src/app/pipes/player.pipe';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { Subscription } from 'rxjs';
import { Basher } from 'src/app/models/creeps/basher';
import { IStats } from 'src/app/models/istats';
import { Archer } from 'src/app/models/creeps/archer';
import { DrawEvent } from 'src/app/events/draw-event';
import { Players } from 'src/app/models/players';
import { Position } from 'src/app/constants/enums';
import { Constants } from 'src/app/constants/constants';
import { CreepBase } from 'src/app/models/creeps/creep-base';
import { IPlayer } from 'src/app/models/iplayer';

@Component({
	selector: 'app-barrack',
	templateUrl: './barrack.component.html',
	styleUrls: ['./barrack.component.css']
})
export class BarrackComponent implements OnInit, Barrack, OnDestroy {
	@Input() playerN: number;
	@Input() x: number;
	@Input() y: number;
	@Input() color: string;
	public get player() : IPlayer {
		return Players.id(this.playerN);
	}
	public selected: false;

	private subscriptions: Array<Subscription> = [];

	public meleeModifier: IStats;
	public rangedModifier: IStats;

	public level = 1;
	public respawnTime = 15;
	public baseCreepSpeed = 1;
	public baseCreepValue = 10;
	public upgradeCost = 20;
	public gold = 999999;

	get creeps(): Array<ICreep> {
		return this.playerPipe.transform(this.engine.creeps, this.player.id);
	}

	constructor(private engine: EngineService, private events: EventmanagerService, private playerPipe: PlayerPipe) {
		this.subscriptions.push(events.onCreepKill.subscribe(e => {
			if (e.killer.player === this.player.id) {
				this.getGoldForCreep(e.creep);
			}
		}));
		this.subscriptions.push(this.events.onDrawCreeps.subscribe(e => this.draw(e)));

		this.meleeModifier = {
			maxSpeed: 0,
			attack: 0,
			attackSpeed: 0,
			maxHealth: 0,
			range: 0,
			value: 0
		};

		this.rangedModifier = {
			maxSpeed: 0,
			attack: 0,
			attackSpeed: 0,
			maxHealth: 0,
			range: 0,
			value: 0
		};
	}

	ngOnInit() {
		// TODO: Implement ranged creeps properly.
		// this.spawnRangedCreepProcess();
		this.spawnMeleeCreepProcess();
		setTimeout(() => {
			this.spawnRangedCreepProcess();
		}, 500);
		this.player.barrack = this;
	}

	public upgradeHp() {
		if (this.gold >= this.upgradeCost) {
			this.meleeModifier.maxHealth++;
			this.gold -= 20;
		}
	}

	public upgradeAtk() {
		if (this.gold >= this.upgradeCost) {
			this.meleeModifier.attack++;
			this.gold -= 20;
		}
	}

	public upgradeSpeed() {
		if (this.gold >= this.upgradeCost) {
			this.meleeModifier.maxSpeed += .1;
			this.gold -= 20;
		}
	}

	public upgradeRange() {
		if (this.gold >= this.upgradeCost) {
			this.rangedModifier.attackSpeed += 0.1;
			this.gold -= 20;
		}
	}

	private getGoldForCreep(creepKilled: ICreep) {
		this.gold += creepKilled.value;
	}

	private draw(e: DrawEvent) {
		const oPlayer = this.player;
		e.ctx.fillStyle = this.color;
		e.ctx.fillRect(oPlayer.coords.x - 25,  oPlayer.coords.y - 25, 50, 50);
	}

	private spawnMeleeCreepProcess() {
		this.spawnCreeps(Basher, this.meleeModifier);

		setTimeout(() => {
			this.spawnMeleeCreepProcess();
		}, this.respawnTime * 1000);
	}

	private spawnRangedCreepProcess() {
		this.spawnCreeps(Archer, this.rangedModifier);

		setTimeout(() => {
			this.spawnRangedCreepProcess();
		}, this.respawnTime * 1000);
	}

	private spawnCreeps<T extends CreepBase>(creepCtor: new() => T, modifier: IStats) {
		var oPlayer = this.player;

		// We spawn creeps for all 3 lanes
		for(let i = 0; i < 3; i++) {
			const creep = new creepCtor();
			creep.player = this.player.id;

			// Creeps will spawn in the middle of the barracks which is 50 px large.
			creep.x = oPlayer.coords.x;
			creep.y = oPlayer.coords.y;

			creep.statsModifier = modifier;

			// Mid Lane
			if (i === 0) {
				creep.destinations.push(Constants.Mid);
				switch(oPlayer.position) {
					case Position.Top:
						creep.destinations.push(Players.pos(Position.Bottom).coords);
						break;
					case Position.Left:
						creep.destinations.push(Players.pos(Position.Right).coords);
						break;
					case Position.Bottom:
						creep.destinations.push(Players.pos(Position.Top).coords);
						break;
					case Position.Right:
						creep.destinations.push(Players.pos(Position.Left).coords);
						break;
				}
			}

			// Side Lane 1
			if (i === 1) {
				switch(oPlayer.position) {
					case Position.Top:
						creep.destinations.push(Constants.TopLeft);
						creep.destinations.push(Players.pos(Position.Left).coords);
						break;
					case Position.Left:
						creep.destinations.push(Constants.BottomLeft);
						creep.destinations.push(Players.pos(Position.Bottom).coords);
						break;
					case Position.Bottom:
						creep.destinations.push(Constants.BottomRight);
						creep.destinations.push(Players.pos(Position.Right).coords);
						break;
					case Position.Right:
						creep.destinations.push(Constants.TopRight);
						creep.destinations.push(Players.pos(Position.Top).coords);
						break;
				}
			}

			// Side Lane 2
			if (i === 2) {
				switch(oPlayer.position) {
					case Position.Top:
						creep.destinations.push(Constants.TopRight);
						creep.destinations.push(Players.pos(Position.Right).coords);
						break;
					case Position.Left:
						creep.destinations.push(Constants.TopLeft);
						creep.destinations.push(Players.pos(Position.Top).coords);
						break;
					case Position.Bottom:
						creep.destinations.push(Constants.BottomLeft);
						creep.destinations.push(Players.pos(Position.Left).coords);
						break;
					case Position.Right:
						creep.destinations.push(Constants.BottomRight);
						creep.destinations.push(Players.pos(Position.Bottom).coords);
						break;
				}
			}

			creep.health = creep.maxHealth;

			this.engine.creeps.push(creep);
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
