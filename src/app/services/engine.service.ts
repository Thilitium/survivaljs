import { Injectable } from '@angular/core';
import { ICreep } from '../models/icreep';
import { EventmanagerService } from './eventmanager.service';
import { CreepType } from '../constants/enums';
import { ICoords } from '../models/icoords';
import NavMesh from '../../scripts/navmesh.js';

@Injectable({
	providedIn: 'root'
})
export class EngineService {
	public creeps: Array<ICreep>;
	private navMesh: NavMesh;

	// Tick rate in ms.
	private tickRate = 16;

	constructor(private events: EventmanagerService) {
		this.creeps = [];

		// Map start from x=200.
		// Map is 600*600.
		const xOffset = 200;
		this.navMesh = new NavMesh([
			[
				{ x: xOffset + 50, y: 275 },
				{ x: xOffset + 275, y: 275 },
				{ x: xOffset + 275, y: 50 },
				{ x: xOffset + 325, y: 50 },
				{ x: xOffset + 325, y: 275 },
				{ x: xOffset + 550, y: 275 },
				{ x: xOffset + 550, y: 325 },
				{ x: xOffset + 325, y: 325 },
				{ x: xOffset + 325, y: 550 },
				{ x: xOffset + 275, y: 550 },
				{ x: xOffset + 275, y: 325 },
				{ x: xOffset + 50, y: 325 }
			]
		]);
	}

	public start() {
		this.gameLoop();
	}

	private gameLoop() {
		setTimeout(() => {
			this.checkTargets();
			this.checkCollisions();
			this.attackProcess();
			this.checkDeadCreeps();
			this.moveCreeps();
			this.gameLoop();
		}, 16);
	}

	private checkCollisions() {
		const creepsOrderedLeftToRight = this.creeps.sort((a, b) => a.x - b.x);

		for (let i = 0; i < creepsOrderedLeftToRight.length; ++i) {
			const c1 = creepsOrderedLeftToRight[i];
			let frontCreepBlocking: ICreep = null;
			c1.speed = c1.maxSpeed;

			if (c1.player === 1) {
				// Check if a creep is blocking
				if (i < this.creeps.length - 1) {
					const c2 = creepsOrderedLeftToRight[i + 1];
					if (c1.x + c1.width >= c2.x) {
						frontCreepBlocking = c1;
					}
				}
			} else {
				if (i > 0) {
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

	private checkTargets() {
		this.creeps.forEach(creep => {
			let minDist = 99999;
			let target = null;
			let targetInRange = false;

			this.creeps.forEach(other => {
				if (creep !== other && creep.player !== other.player) {
					const dist = Math.sqrt(
						Math.pow((other.x + other.width / 2) - (creep.x + creep.width / 2), 2) +
						Math.pow((other.y + other.height / 2) - (creep.y + creep.height / 2), 2)
					);

					// We assume that the creep is a circle and we add radius to account
					// for the size of the creep when taking range into account.
					if (dist < minDist && dist < (creep.aggroRange + (creep.width / 2) + (other.width / 2))) {
						minDist = dist;
						target = other;

						if (dist < (creep.range + (creep.width / 2) + (other.width / 2))) {
							targetInRange = true;
						}
					}
				}
			});

			creep.targetInRange = targetInRange;
			creep.target = target;
		});
	}

	private attackProcess() {
		this.creeps.forEach((creep) => {
			if (creep.target !== null && creep.targetInRange) {
				const msSinceLastShot = creep.lastShotTime ?
					new Date().getTime() - creep.lastShotTime.getTime() : 999999;

				if (msSinceLastShot > creep.attackSpeed * 1000) {
					creep.target.health -= creep.attack;
					creep.shooting = true;
					creep.lastShotTime = new Date();
					this.events.onCreepShot.emit({ creep });

					if (creep.target.health <= 0) {
						this.events.onCreepKill.emit({ creep: creep.target, killer: creep });
						creep.target = null;
						creep.targetInRange = false;
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
			this.events.onCreepDied.emit({ creep: this.creeps[i] });
			this.creeps.splice(i, 1);
		});
	}

	private moveCreeps() {
		this.creeps.forEach(creep => {
			if (!creep.targetInRange && creep.currentDestination) {
				const path: ICoords[] = this.navMesh.findPath(creep, creep.currentDestination);
				if (path) {
					const deltaX = path[1].x - path[0].x;
					const deltaY = path[1].y - path[0].y;
					const newCoords: ICoords = {
						x: deltaX !== 0 ? this.lerp(path[0].x, path[1].x, creep.speed / deltaX) : creep.x,
						y: deltaY !== 0 ? this.lerp(path[0].y, path[1].y, creep.speed / deltaY) : creep.y
					};
					creep.x = newCoords.x;
					creep.y = newCoords.y;
				}
			}
		});
	}

	private lerp(start: number, end: number, amt: number) {
		return (1 - amt) * start + amt * end;
	}
}
