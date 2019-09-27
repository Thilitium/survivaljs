import { Component, OnInit, ViewChild, Input, ElementRef, OnDestroy } from '@angular/core';
import { Barrack } from '../../models/barrack';
import { ICreep } from '../../models/icreep';
import { EngineService } from '../../services/engine.service';
import { PlayerPipe } from 'src/app/pipes/player.pipe';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { Subscription } from 'rxjs';
import { Basher } from 'src/app/models/creeps/basher';
import { IStats } from 'src/app/models/istats';

@Component({
	selector: 'app-barrack',
	templateUrl: './barrack.component.html',
	styleUrls: ['./barrack.component.css']
})
export class BarrackComponent implements OnInit, Barrack, OnDestroy {
	@Input() player: number;

	private subscriptions: Array<Subscription> = [];

	public meleeModifier: IStats;

	public level = 1;
	public respawnTime = 3;
	public baseCreepSpeed = 1;
	public baseCreepValue = 10;
	public upgradeCost = 20;
	public gold = 0;

	get creeps(): Array<ICreep> {
		return this.playerPipe.transform(this.engine.creeps, this.player);
	}

	constructor(private engine: EngineService, private events: EventmanagerService, private playerPipe: PlayerPipe) {
		this.subscriptions.push(events.onCreepKill.subscribe(e => {
			if (e.killer.player === this.player) {
				this.getGoldForCreep(e.creep);
			}
		}));

		this.meleeModifier = {
			maxSpeed: 0,
			attack: 0,
			attackSpeed: 0,
			maxHealth: 0,
			range: 0,
			value: 0
		};
	 }

	ngOnInit() {
		this.spawnCreep();
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

	private spawnCreep() {
		const creep = new Basher();
		creep.player = this.player;
		creep.x = this.player === 1 ? 50 : 480,
		creep.y = 10;
		creep.statsModifier = this.meleeModifier;

		// La direction ne devrait pas être définie ici.
		creep.baseStats.maxSpeed = this.player === 1 ? this.baseCreepSpeed : -this.baseCreepSpeed;
		this.engine.creeps.push(creep);

		setTimeout(() => {
			this.spawnCreep();
		}, this.respawnTime * 1000);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
