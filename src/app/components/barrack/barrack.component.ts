import { Barrack } from '../../models/barrack';
import { ICreep } from '../../models/icreep';
import { Subscription } from 'rxjs';
import { IStats } from 'src/app/models/istats';
import { DrawEvent } from 'src/app/events/draw-event';
import { Players } from 'src/app/services/players';
import { Position } from 'src/app/constants/enums';
import { Constants } from 'src/app/constants/constants';
import { IPlayer } from 'src/app/models/iplayer';
import { EngineService } from 'src/app/services/engine.service';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { Basher } from 'src/app/models/creeps/basher';
import { Archer } from 'src/app/models/creeps/archer';
import { CreepBase } from 'src/app/models/creeps/creep-base';

export class BarrackComponent extends Barrack {

	private subscriptions: Array<Subscription> = [];


	public level = 1;
	public respawnTime = 7;
	public baseCreepSpeed = 1;
	public baseCreepValue = 10;
	public upgradeCost = 20;

	constructor(private engine: EngineService, private events: EventmanagerService, public player: IPlayer) {
		super();
		this.subscriptions.push(events.onCreepKill.subscribe(e => {
			if (e.killer.player === this.player) {
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

		this.x = player.coords.x;
		this.y = player.coords.y;

		this.player.barrack = this;
	}

	public upgradeHp() {
		if (this.player.gold >= this.upgradeCost) {
			this.meleeModifier.maxHealth++;
			this.player.gold -= 20;
		}
	}

	public upgradeAtk() {
		if (this.player.gold >= this.upgradeCost) {
			this.meleeModifier.attack++;
			this.player.gold -= 20;
		}
	}

	public upgradeSpeed() {
		if (this.player.gold >= this.upgradeCost) {
			this.meleeModifier.maxSpeed += .1;
			this.player.gold -= 20;
		}
	}

	public upgradeRange() {
		if (this.player.gold >= this.upgradeCost) {
			this.rangedModifier.attackSpeed += 0.1;
			this.player.gold -= 20;
		}
	}

	private getGoldForCreep(creepKilled: ICreep) {
		this.player.gold += creepKilled.value;
	}

	protected draw(e: DrawEvent) {
		e.ctx.fillStyle = this.player.color;
		e.ctx.fillRect(this.player.coords.x - 25,  this.player.coords.y - 25, 50, 50);
		e.ctx.restore();
	}

	dispose(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
