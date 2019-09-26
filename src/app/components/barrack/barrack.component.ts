import { Component, OnInit, ViewChild, Input, ElementRef, OnDestroy } from '@angular/core';
import { Barrack } from '../../models/barrack';
import { Creep } from '../../models/creep';
import { EngineService } from '../../services/engine.service';
import { PlayerPipe } from 'src/app/pipes/player.pipe';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-barrack',
	templateUrl: './barrack.component.html',
	styleUrls: ['./barrack.component.css']
})
export class BarrackComponent implements OnInit, Barrack, OnDestroy {
	@Input() player: number;

	private subscriptions: Array<Subscription> = [];

	public level = 1;
	public respawnTime = 3;
	public baseCreepHp = 10;
	public baseCreepAtk = 3;
	public baseCreepSpeed = 1;
	public baseCreepRange = 35;
	public baseCreepValue = 10;
	public upgradeCost = 20;
	public gold = 0;

	get creeps(): Array<Creep> {
		return this.playerPipe.transform(this.engine.creeps, this.player);
	}

	constructor(private engine: EngineService, private events: EventmanagerService, private playerPipe: PlayerPipe) {
		this.subscriptions.push(events.onCreepKill.subscribe(e => {
			if (e.killer.player === this.player) {
				this.getGoldForCreep(e.creep);
			}
		}));
	 }

	ngOnInit() {
		this.spawnCreep();
	}

	public upgradeHp() {
		if (this.gold >= this.upgradeCost) {
			this.baseCreepHp++;
			this.gold -= 20;
		}
	}

	public upgradeAtk() {
		if (this.gold >= this.upgradeCost) {
			this.baseCreepAtk++;
			this.gold -= 20;
		}
	}

	public upgradeSpeed() {
		if (this.gold >= this.upgradeCost) {
			this.baseCreepSpeed++;
			this.gold -= 20;
		}
	}

	public upgradeRange() {
		if (this.gold >= this.upgradeCost) {
			this.baseCreepRange++;
			this.gold -= 20;
		}
	}

	private getGoldForCreep(creepKilled: Creep) {
		this.gold += creepKilled.value;
	}

	private spawnCreep() {
		const creep = {
			speed: this.player === 1 ? this.baseCreepSpeed : -this.baseCreepSpeed,
			maxSpeed : this.player === 1 ? this.baseCreepSpeed : -this.baseCreepSpeed,
			range: this.baseCreepRange,
			x: this.player === 1 ? 50 : 500,
			y: 20,
			player : this.player,
			target : null,
			width: 10,
			height: 10,
			attack: this.baseCreepAtk,
			health: this.baseCreepHp,
			maxHealth: this.baseCreepHp,
			attackSpeed: 1,
			value: this.baseCreepValue,
			shooting: false,
			lastShotTime: null
		};
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
