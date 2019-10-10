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
	private colMesh: ICoords[][];

	// Tick rate in ms.
	private tickRate = 16;

	constructor(private events: EventmanagerService) {
		this.creeps = [];

		// Map start from x=200.
		// Map is 600*600.
		const xOffset = 200;
		this.navMesh = new NavMesh([
			[
				// Left lane
				{ x: xOffset + 50, y: 275 },
				{ x: xOffset + 275, y: 275 },
				{ x: xOffset + 275, y: 325 },
				{ x: xOffset + 50, y: 325 }
			],
			[
				// Top lane
				{ x: xOffset + 275, y: 50 },
				{ x: xOffset + 325, y: 50 },
				{ x: xOffset + 325, y: 275 },
				{ x: xOffset + 275, y: 275 }
			],
			[
				// Right lane
				{ x: xOffset + 550, y: 275 },
				{ x: xOffset + 550, y: 325 },
				{ x: xOffset + 325, y: 325 },
				{ x: xOffset + 325, y: 275 }
			],
			[
				// Bottom lane
				{ x: xOffset + 325, y: 550 },
				{ x: xOffset + 275, y: 550 },
				{ x: xOffset + 275, y: 325 },
				{ x: xOffset + 325, y: 325 }
			],
			[
				// Mid
				{ x: xOffset + 275, y: 275 },
				{ x: xOffset + 325, y: 275 },
				{ x: xOffset + 325, y: 325 },
				{ x: xOffset + 275, y: 325 }
			]
		]);

		// Initialization of the collision mesh
		this.colMesh = [
			[
				// Top left
				{ x: xOffset, y: 0 },
				{ x: xOffset + 275, y: 0 },
				{ x: xOffset + 275, y: 275 },
				{ x: xOffset, y: 275 }
			],
			[
				// Top right
				{ x: xOffset + 325, y: 0 },
				{ x: xOffset + 600, y: 0 },
				{ x: xOffset + 600, y: 275 },
				{ x: xOffset + 325, y: 275 }
			],
			[
				// Bottom right
				{ x: xOffset + 325, y: 325 },
				{ x: xOffset + 600, y: 325 },
				{ x: xOffset + 600, y: 600 },
				{ x: xOffset + 325, y: 600 }
			],
			[
				// Bottom left
				{ x: xOffset, y: 325 },
				{ x: xOffset + 325, y: 325 },
				{ x: xOffset + 325, y: 600 },
				{ x: xOffset, y: 600 }
			]
		];
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
				c1.speed = c1.maxSpeed;
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
				let path: ICoords[];
				if (creep.currentDestination !== creep.lastDestination) {
					path = this.navMesh.findPath(creep, creep.currentDestination);
					if (path) {
						creep.lastDestination = path[1];
					}
				} else {
					path = [
						creep,
						creep.currentDestination
					];
				}

				if (path) {
					const deltaX = path[1].x - path[0].x;
					const deltaY = path[1].y - path[0].y;
					/* This below works well, but I want to do it with trigonometry
					const pctX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY));
					const pctY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY));
					creep.x += (deltaX < 0 ? -creep.speed : creep.speed) * pctX;
					creep.y += (deltaY < 0 ? -creep.speed : creep.speed) * pctY;*/
					const angle = Math.atan2(deltaY, deltaX);
					creep.x += creep.speed * Math.cos(angle);
					creep.y += creep.speed * Math.sin(angle);
				}
			}
		});
	}
}
