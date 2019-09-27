import { Injectable } from '@angular/core';
import { ICreep } from '../models/icreep';
import { EventmanagerService } from './eventmanager.service';
import { CreepType } from '../constants/enums';

@Injectable({
	providedIn: 'root'
})
export class EngineService {
	public creeps: Array<ICreep>;

	constructor(private events: EventmanagerService) {
		this.creeps = [];
	}

	public start() {
		this.gameLoop();
	}

	private gameLoop() {
		setTimeout(() => {
			this.checkCollisionsAndTargets();
			this.attackProcess();
			this.checkDeadCreeps();
			this.moveCreeps();
			this.gameLoop();
		}, 16);
	}

	private checkCollisionsAndTargets() {
		const creepsOrderedLeftToRight = this.creeps.sort((a, b) => a.x - b.x);

		for (let i = 0; i < creepsOrderedLeftToRight.length; ++i) {
			const c1 = creepsOrderedLeftToRight[i];
			let target: ICreep = null;
			let frontCreepBlocking: ICreep = null;
			c1.speed = c1.maxSpeed;

			if (c1.player === 1) {
				// Check for targets.
				for (let j = i + 1; j < this.creeps.length; ++j) {
					const collisionCreep = creepsOrderedLeftToRight[j];

					if (collisionCreep.player === 2) {
						if (collisionCreep.health > 0 && collisionCreep.x <= c1.x + c1.width + c1.range) {
							if (c1.type === CreepType.Ranged ||
							   (c1.type === CreepType.Melee && collisionCreep.type !== CreepType.Ranged)) {
								target = collisionCreep;
								break;
							}
						}
					}
				}

				// Check if a creep is blocking
				if (i < this.creeps.length - 1) {
					const c2 = creepsOrderedLeftToRight[i + 1];
					if (c1.x + c1.width >= c2.x) {
						frontCreepBlocking = c1;
					}
				}
			} else {
				if (i > 0) {
					// Check for targets.
					for (let j = i - 1; j >= 0; --j) {
						const collisionCreep = creepsOrderedLeftToRight[j];

						if (collisionCreep.player === 1) {
							if (collisionCreep.health > 0 && collisionCreep.x + collisionCreep.width >= c1.x - c1.range) {
								if (c1.type === CreepType.Ranged ||
									(c1.type === CreepType.Melee && collisionCreep.type !== CreepType.Ranged)) {
									target = collisionCreep;
									break;
								}
							}
						}
					}

					// Check if a creep is blocking
					const c2 = creepsOrderedLeftToRight[i - 1];
					if (c2.x + c2.width >= c1.x) {
						frontCreepBlocking = c2;
					}
				}
			}

			if (frontCreepBlocking) {
				c1.speed = 0;
			} else if (c1.target !== null && c1.type === CreepType.Ranged) {
				// For a range creep, we stop dead if we have a target.
				c1.speed = 0;
			} else {
				c1.speed = c1.player === 1 ? c1.maxSpeed : -c1.maxSpeed;
			}
		}
	}

	private attackProcess() {
		this.creeps.forEach((creep) => {
			if (creep.target !== null) {
				const msSinceLastShot = creep.lastShotTime ?
					new Date().getTime() - creep.lastShotTime.getTime() : 999999;

				if (msSinceLastShot > creep.attackSpeed * 1000) {
					creep.target.health -= creep.attack;
					creep.shooting = true;
					creep.lastShotTime = new Date();
					this.events.onCreepShot.emit({creep});

					if (creep.target.health <= 0) {
						this.events.onCreepKill.emit({creep: creep.target, killer: creep});
					}
				}
			} else {
				creep.shooting = false;
			}
		});
	}

	private checkDeadCreeps() {
		const deadCreepsIndexes = [];
		this.creeps.forEach((creep, i) => {
			if (creep.health <= 0) {
				deadCreepsIndexes.unshift(i);
			}
		});
		deadCreepsIndexes.forEach(i => {
			this.events.onCreepDied.emit({creep : this.creeps[i] });
			this.creeps.splice(i, 1);
		});
	}

	private moveCreeps() {
		this.creeps.forEach(creep => {
			creep.x += creep.speed;
		});
	}
}
