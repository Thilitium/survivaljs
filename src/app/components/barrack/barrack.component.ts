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

@Component({
	selector: 'app-barrack',
	templateUrl: './barrack.component.html',
	styleUrls: ['./barrack.component.css']
})
export class BarrackComponent implements OnInit, Barrack, OnDestroy {
	@Input() player: number;
	@Input() x: number;
	@Input() y: number;
	@Input() color: string;

	private subscriptions: Array<Subscription> = [];

	public meleeModifier: IStats;
	public rangedModifier: IStats;

	public level = 1;
	public respawnTime = 10;
	public baseCreepSpeed = 1;
	public baseCreepValue = 10;
	public upgradeCost = 20;
	public gold = 999999;

	get creeps(): Array<ICreep> {
		return this.playerPipe.transform(this.engine.creeps, this.player);
	}

	constructor(private engine: EngineService, private events: EventmanagerService, private playerPipe: PlayerPipe) {
		this.subscriptions.push(events.onCreepKill.subscribe(e => {
			if (e.killer.player === this.player) {
				this.getGoldForCreep(e.creep);
			}
		}));
		this.subscriptions.push(this.events.onDraw1.subscribe(e => this.draw(e)));

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
			this.meleeModifier.maxSpeed += .5;
			this.gold -= 20;
		}
	}

	public upgradeRange() {
		if (this.gold >= this.upgradeCost) {
			this.meleeModifier.range++;
			this.gold -= 20;
		}
	}

	private getGoldForCreep(creepKilled: ICreep) {
		this.gold += creepKilled.value;
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = this.color;
		e.ctx.fillRect(this.x, this.y, 50, 50);
	}

	private spawnMeleeCreepProcess() {
		const creep = new Basher();
		creep.player = this.player;

		// Creeps will spawn in the middle of the barracks which is 50 px large.
		creep.x = this.x + 25;
		creep.y = this.y + 25;

		creep.statsModifier = this.meleeModifier;

		// Let's just send everyone to the slaughter mid for now.
		creep.destination = { x: 500, y: 300 };
		creep.health = creep.maxHealth;

		this.engine.creeps.push(creep);

		setTimeout(() => {
			this.spawnMeleeCreepProcess();
		}, this.respawnTime * 1000);
	}

	private spawnRangedCreepProcess() {
		const creep = new Archer();
		creep.player = this.player;

		// Creeps will spawn in the middle of the barracks which is 50 px large.
		creep.x = this.x + 25;
		creep.y = this.y + 25;

		// Let's just send everyone to the slaughter mid for now.
		creep.destination = { x: 500, y: 300 };
		creep.health = creep.maxHealth;

		creep.statsModifier = this.rangedModifier;
		this.engine.creeps.push(creep);

		setTimeout(() => {
			this.spawnRangedCreepProcess();
		}, this.respawnTime * 1000);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
