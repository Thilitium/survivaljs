import { Injectable } from '@angular/core';
import { ICreep } from '../models/icreep';
import { EventmanagerService } from './eventmanager.service';
import { CreepType, Position } from '../constants/enums';
import { ICoords } from '../models/icoords';
import NavMesh from '../../scripts/navmesh.js';
import { Constants } from '../constants/constants';
import { Players } from '../models/players';
import { MouseService } from './mouse.service';
import { ProcessInputsEvent } from '../events/process-inputs-events';

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

		this.navMesh = this.constructNavMech();
		this.setPlayers();
	}

	public start() {
		this.gameLoop();
	}

	private setPlayers() {
		Players.add(
			{
				name: 'one',
				alive: true,
				coords: Constants.Left,
				ia: false,
				id: 1,
				position: Position.Left
			}
		);
		Players.add(
			{
				name: 'two',
				alive: true,
				coords: Constants.Right,
				ia: false,
				id: 2,
				position: Position.Right
			}
		);
		Players.add(
			{
				name: 'three',
				alive: true,
				coords: Constants.Top,
				ia: false,
				id: 3,
				position: Position.Top
			}
		);
		Players.add(
			{
				name: 'four',
				alive: true,
				coords: Constants.Bottom,
				ia: false,
				id: 4,
				position: Position.Bottom
			}
		);
	}

	private constructNavMech(): NavMesh {
		const offsetCoords = (coords, start) => {
			coords.forEach((c) => {
				c.x += Constants.Offset.x + start.x;
				c.y += Constants.Offset.y + start.y;
			});

			return coords;
		};
		const horizontalLane = (start) => {
			let coords = [
				{ x: 0, y: 0 },
				{ x: 225, y: 0 },
				{ x: 225, y: 50 },
				{ x: 0, y: 50 }
			];

			return offsetCoords(coords, start);
		};
		const verticalLane = (start) => {
			let coords = [
				{ x: 0, y: 0 },
				{ x: 50, y: 0 },
				{ x: 50, y: 225 },
				{ x: 0, y: 225 }
			];

			return offsetCoords(coords, start);
		};
		const square = (start) => {
			let coords = [
				{ x: 0, y: 0 },
				{ x: 50, y: 0 },
				{ x: 50, y: 50 },
				{ x: 0, y: 50 }
			];

			return offsetCoords(coords, start);
		};

		return new NavMesh([
			horizontalLane({ x: 50, y: 275 }), // Mid Left lane
			verticalLane({ x: 275, y: 50 }), // Mid Top lane
			horizontalLane({ x: 325, y: 275 }), // Mid Right lane
			verticalLane({ x: 275, y: 325 }), // Mid Bottom lane
			square({ x: 275, y: 275 }), // Mid
			verticalLane({ x: 0, y: 325 }), // Left : Bottom Lane
			square({ x: 0, y: 275 }), // Left
			verticalLane({ x: 0, y: 50 }), // Left: Top Lane
			square({ x: 0, y: 0 }), // Top Left
			horizontalLane({ x: 50, y: 0}), // Top: Left Lane
			square({x : 275, y: 0}), // Top
			horizontalLane({ x: 325, y: 0}), // Top: Right Lane
			square({ x: 550, y: 0 }), // Top Right
			verticalLane({ x: 550, y: 50 }), // Right: Top Lane
			square({ x: 550, y: 275 }), // Right
			verticalLane({ x: 550, y: 325 }), // Right : Bottom Lane
			square({ x: 550, y: 550 }), // Bottom Right
			horizontalLane({ x: 325, y: 550}), // Bottom: Right Lane
			square({ x: 275, y: 550 }), // Bottom
			horizontalLane({ x: 50, y: 550}), // Bottom: Left Lane
			square({ x: 0, y: 550 }), // Bottom Left
		]);
	}



	private gameLoop() {
		setTimeout(() => {
			this.events.onProcessInputs.emit(new ProcessInputsEvent());
			this.checkTargets();
			this.updateSpeed();
			this.attackProcess();
			this.checkDeadCreeps();
			this.checkCreepsWaypoints();
			this.moveCreeps();
			this.gameLoop();
		}, 16);
	}

	private updateSpeed() {
		for (let i = 0; i < this.creeps.length; ++i) {
			const c1 = this.creeps[i];
			// We stop dead if we have a target in range.
			if (c1.targetInRange) {
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

						if (dist < (creep.range + (creep.range > 1 ? 0 : (creep.width / 2) + (other.width / 2)))) {
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

	private checkCreepsWaypoints() {
		this.creeps.forEach(creep => {
			if (creep.currentDestination && creep.destinations.length > 1) {
				if (creep.x >= creep.currentDestination.x - 25 &&
					creep.x <= creep.currentDestination.x + 25 &&
					creep.y >= creep.currentDestination.y - 25 &&
					creep.y <= creep.currentDestination.y + 25) {
						creep.destinations.splice(0, 1);
					}
			}
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
					const pctX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY));
					const pctY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY));
					creep.x += (deltaX < 0 ? -creep.speed : creep.speed) * pctX;
					creep.y += (deltaY < 0 ? -creep.speed : creep.speed) * pctY;
				}
			}
		});
	}
}
