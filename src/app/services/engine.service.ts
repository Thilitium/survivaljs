import { Injectable } from '@angular/core';
import { ICreep } from '../models/icreep';
import { EventmanagerService } from './eventmanager.service';
import { CreepType } from '../constants/enums';
import { ICoords } from '../models/icoords';
import NavMesh from '../../scripts/navmesh.js';
import { Vector } from '../models/vector';

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
			let minDist = Number.MAX_VALUE;
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
					new Date().getTime() - creep.lastShotTime.getTime() : Number.MAX_VALUE;

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
					/*
					//This below works well, but I want to do it with vectors
					const deltaX = path[1].x - path[0].x;
					const deltaY = path[1].y - path[0].y;
					const pctX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY));
					const pctY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY));
					creep.x += (deltaX < 0 ? -creep.speed : creep.speed) * pctX;
					creep.y += (deltaY < 0 ? -creep.speed : creep.speed) * pctY;
					const angle = Math.atan2(deltaY, deltaX);
					creep.x += creep.speed * Math.cos(angle);
					creep.y += creep.speed * Math.sin(angle);
					*/

					creep.velocity = Vector.between(path[1], path[0]).normalize().multiply(creep.speed);
					creep.x += creep.velocity.x;
					creep.y += creep.velocity.y;
				}
			}
		});
	}

	private steerTowards(creep: ICreep, desiredDirection: Vector) {
		// Multiply our direction by speed for our desired speed
		const desiredVelocity = desiredDirection.multiply(creep.maxSpeed);

		// The velocity change we want
		const velocityChange = desiredVelocity.subtract(creep.velocity);
		// Convert to a force
		return velocityChange.multiply(creep.acceleration / creep.speed);
	}

	private steeringBehaviorSeek(creep: ICreep, destination: Vector) {
		if (destination.x === creep.x && destination.y === creep.y) {
			return new Vector();
		}

		// Desired change of location
		const desired = destination.subtract(creep.velocity);

		// Desired velocity (move there at maximum speed)
		const desiredVel = desired.multiply(creep.maxSpeed / desired.length());

		// The velocity change we want
		const velocityChange = desiredVel.subtract(creep.velocity);

		// Convert to a force
		return velocityChange.multiply(creep.acceleration / creep.maxSpeed);
	}

	private steeringBehaviourAvoid(creep: ICreep) {
		// If we aren't moving much, we don't need to try avoid (we assume circle)
		if (Math.sqrt(creep.velocity.length()) <= creep.width) {
			return new Vector();
		}

		// Do some ray casts to work out what is in front of us
		let minFraction = 2;
		let closestFixture = null;

		const callback = function (fixture, point, normal, fraction) {
			//Ignore ourself
			if (fixture == agent.fixture) {
				return fraction;
			}
			//Only care about dynamic (moving) things
			if (fraction < minFraction && fixture.GetBody().GetType() == B2Body.b2_dynamicBody) {
				minFraction = fraction;
				closestFixture = fixture;
			}
			return 0;
		};

		//Do a straight forward cast from our center
		world.RayCast(callback, agent.position(), agent.position().Copy().Add(agent.velocity()));

		//Calculate an offset so we can do casts from our edge
		var velCopy = agent.velocity().Copy();
		velCopy.Normalize();
		var temp = velCopy.x;
		velCopy.x = velCopy.y;
		velCopy.y = -temp;
		velCopy.Multiply(agent.radius);

		//Do a raycast forwards from our right and left edge
		world.RayCast(callback, agent.position().Copy().Add(velCopy), agent.position().Copy().Add(agent.velocity()).Add(velCopy));
		world.RayCast(callback, agent.position().Copy().Subtract(velCopy), agent.position().Copy().Add(agent.velocity()).Subtract(velCopy));

		//If we aren't going to collide, we don't need to avoid
		if (closestFixture == null) {
			return B2Vec2.Zero;
		}

		var resultVector = null;
		var collisionBody = closestFixture.GetBody();
		var ourVelocityLengthSquared = agent.velocity().LengthSquared();

		//Add our velocity and the other Agents velocity
		//If this makes the total length longer than the individual length of one of them, then we are going in the same direction
		var combinedVelocity = agent.velocity().Copy().Add(collisionBody.GetLinearVelocity());
		var combinedVelocityLengthSquared = combinedVelocity.LengthSquared();

		//We are going in the same direction and they aren't avoiding
		if (combinedVelocityLengthSquared > ourVelocityLengthSquared && closestFixture.GetUserData().avoidanceDirection === null) {
			return B2Vec2.Zero;
		}

		//We need to Steer to go around it, we assume the other shape is also a circle

		var vectorInOtherDirection = closestFixture.GetBody().GetPosition().Copy().Subtract(agent.position());

		//Are we more left or right of them
		var isLeft;
		if (closestFixture.GetUserData().avoidanceDirection !== null) {
			//If they are avoiding, avoid with the same direction as them, so we go the opposite way
			isLeft = closestFixture.GetUserData().avoidanceDirection;
		} else {
			//http://stackoverflow.com/questions/13221873/determining-if-one-2d-vector-is-to-the-right-or-left-of-another
			var dot = agent.velocity().x * -vectorInOtherDirection.y + agent.velocity().y * vectorInOtherDirection.x;
			isLeft = dot > 0;
		}
		agent.avoidanceDirection = isLeft;

		//Calculate a right angle of the vector between us
		//http://www.gamedev.net/topic/551175-rotate-vector-90-degrees-to-the-right/#entry4546571
		resultVector = isLeft ? new B2Vec2(-vectorInOtherDirection.y, vectorInOtherDirection.x) : new B2Vec2(vectorInOtherDirection.y, -vectorInOtherDirection.x);
		resultVector.Normalize();

		//Move it out based on our radius + theirs
		resultVector.Multiply(agent.radius + closestFixture.GetShape().GetRadius());

		//Steer torwards it, increasing force based on how close we are
		return steerTowards(agent, resultVector).Divide(minFraction);
	}
}
