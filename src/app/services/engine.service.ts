import { EventmanagerService } from './eventmanager.service';
import { Position } from '../constants/enums';
import { ICoords } from '../models/icoords';
import NavMesh from '../../scripts/navmesh.js';
import { Constants } from '../constants/constants';
import { Players } from './players';
import { ProcessInputsEvent } from '../events/process-inputs-events';
import { CreepBase } from '../models/creeps/creep-base';
import { Math2 } from 'src/helpers/Math2';
import { BarrackComponent } from '../components/barrack/barrack.component';
import { IStats } from '../models/istats';
import { Basher } from '../models/creeps/basher';
import { Barrack } from '../models/barrack';
import { Archer } from '../models/creeps/archer';

export class EngineService {
	public creeps: Array<CreepBase>;
	private navMesh: NavMesh;
	private events: EventmanagerService = null;
	private frameCount: number = 0;

	// Tick rate in ms.
	private tickRate = 16;

	private static _instance: EngineService = null;

	public static get() {
		if(this._instance === null){
			this._instance = new this();
		}

		return this._instance;
	}

	private constructor() {
		this.creeps = [];
		this.events = EventmanagerService.get();
		this.navMesh = this.constructNavMech();
		this.setPlayers();
	}

	public start() {
		this.gameLoop();
	}

	private setPlayers() {
		const p1 = Players.add(
			{
				name: 'one',
				alive: true,
				coords: Constants.Left,
				ia: false,
				id: 1,
				position: Position.Left,
				barrack: null,
				gold: 100,
				color: 'rgb(0, 0, 255)'
			}
		);
		const p2 = Players.add(
			{
				name: 'two',
				alive: true,
				coords: Constants.Right,
				ia: false,
				id: 2,
				position: Position.Right,
				barrack: null,
				gold: 100,
				color: 'rgb(255, 0, 0)'
			}
		);
		const p3 = Players.add(
			{
				name: 'three',
				alive: true,
				coords: Constants.Top,
				ia: false,
				id: 3,
				position: Position.Top,
				barrack: null,
				gold: 100,
				color: 'rgb(0, 255, 0)'
			}
		);
		const p4 = Players.add(
			{
				name: 'four',
				alive: true,
				coords: Constants.Bottom,
				ia: false,
				id: 4,
				position: Position.Bottom,
				barrack: null,
				gold: 100,
				color: 'rgb(240, 240, 240)'
			}
		);

		new BarrackComponent(this, this.events, p1);
		new BarrackComponent(this, this.events, p2);
		new BarrackComponent(this, this.events, p3);
		new BarrackComponent(this, this.events, p4);
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
			this.frameCount++;
			this.events.onProcessInputs.emit(new ProcessInputsEvent());
			this.spawnCreepsProcess();
			this.updateSpeed();
			this.attackProcess();
			this.checkDeadCreeps();
			this.checkTargets();
			this.checkCreepsWaypoints();
			this.moveCreeps();
			this.gameLoop();
		}, this.tickRate);
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
					const dist = Math2.dist(other, creep);

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
		this.creeps.filter(c => c.health <= 0).forEach(c => {
			this.creeps.splice(this.creeps.indexOf(c), 1)
			c.dispose();
		});
	}

	private checkCreepsWaypoints() {
		this.creeps.forEach(creep => {
			if (creep.currentDestination && creep.destinations.length > 1) {
				if (Math2.isInBoundingBox(
					{ x: creep.currentDestination.x - 25, y: creep.currentDestination.y - 25 },
					{ x: creep.currentDestination.x + 25, y: creep.currentDestination.y + 25 },
					creep))
				{
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

	private spawnCreepsProcess() {
		// Melee creeps
		Players.getAll().forEach(player => {
			if (player.barrack.lastSpawnTime === 0 || player.barrack.lastSpawnTime < (this.frameCount * this.tickRate) - (player.barrack.respawnTime * 1000)){
				this.spawnCreeps<Basher>(player.barrack, Basher, player.barrack.meleeModifier);
				setTimeout(() => {
					this.spawnCreeps<Archer>(player.barrack, Archer, player.barrack.meleeModifier);
				}, (500));
				player.barrack.lastSpawnTime = this.tickRate * this.frameCount;
			}
		});
	}

	private spawnCreeps<T extends CreepBase>(barrack: Barrack, creepCtor: new() => T, modifier: IStats) {
		// We spawn creeps for all 3 lanes
		for(let i = 0; i < 3; i++) {
			const creep = new creepCtor();
			creep.player = barrack.player;

			// Creeps will spawn in the middle of the barracks which is 50 px large.
			creep.x = barrack.player.coords.x;
			creep.y = barrack.player.coords.y;

			creep.statsModifier = modifier;

			// Mid Lane
			if (i === 0) {
				creep.destinations.push(Constants.Mid);
				switch(barrack.player.position) {
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
				switch(barrack.player.position) {
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
				switch(barrack.player.position) {
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

			this.creeps.push(creep);
		}
	}
}
