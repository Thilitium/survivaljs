import { Injectable } from '@angular/core';
import { ICreep } from '../models/icreep';
import { EventmanagerService } from './eventmanager.service';
import { CreepType } from '../constants/enums';
import { ICoords } from '../models/icoords';
import NavMesh from '../../scripts/navmesh.js';
import { CreepBase } from '../models/creeps/creep-base';
import { GameObject } from '../models/gameobject';
import Box2D from '../../scripts/Box2D.js';
const B2Vec2 = Box2D.Common.Math.b2Vec2;

@Injectable({
	providedIn: 'root'
})
export class EngineService {
	public creeps: Array<CreepBase>;
	private navMesh: NavMesh;

	// Tick rate in ms.
	private tickRate = 16;
	public world: Box2D.Dynamics.b2World;

	constructor(private events: EventmanagerService) {
		this.creeps = [];
		this.world = new Box2D.Dynamics.b2World(Box2D.Common.Math.b2Math.b2Vec2_zero, true);

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

		// TODO: Move extensions to an appropriate file
		B2Vec2.prototype.Round = function() {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);

			return this;
		};

		B2Vec2.prototype.Floor = function() {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);

			return this;
		};

		B2Vec2.prototype.Angle = function() {
			return Math.atan2(this.x, -this.y) * 180 / Math.PI;
		};

		B2Vec2.prototype.DistanceTo = function(target: Box2D.Common.Math.b2Vec2) {
			const copy = this.Copy();
			copy.Subtract(target);

			return copy.Length();
		};


		B2Vec2.prototype.Divide = function(a = 0) {
			this.x /= a;
			this.y /= a;

			return this;
		};
	}

	public start() {
		this.gameLoop();
	}

	private gameLoop() {
		setTimeout(() => {
			this.checkTargets();
			/*this.checkCollisions();
			this.attackProcess();
			this.checkDeadCreeps();
			this.moveCreeps();
			this.gameLoop();*/

			this.creeps.forEach(c => c.avoidanceDirection = null);

			this.creeps.forEach(creep => {
				// Work out our behaviours
				const ff = this.steeringBehaviourSeek(creep, new B2Vec2(creep.destination.x, creep.destination.y));
				const sep = this.steeringBehaviourSeparation(creep);
				const alg = this.steeringBehaviourAlignment(creep);
				const coh = this.steeringBehaviourCohesion(creep);
				const avd = this.steeringBehaviourAvoid(creep);

				// creep.avd = avd.Copy();

				// For visually debugging forces agent.forces = [ff.Copy(), sep.Copy(), alg.Copy(), coh.Copy()];
				sep.Multiply(2.2);
				alg.Multiply(0.3);
				coh.Multiply(0.05);
				ff.Add(sep); ff.Add(alg); ff.Add(coh); ff.Add(avd);
				creep.forceToApply = ff;

				const lengthSquared = creep.forceToApply.LengthSquared();
				if (lengthSquared > creep.maxForceSquared) {
					creep.forceToApply.Multiply(creep.maxForce / Math.sqrt(lengthSquared));
				}
			});

			// Move agents based on forces being applied (aka physics)
			this.creeps.forEach(creep => {
				// Apply the force
				// console.log(i + ': ' + agent.forceToApply.x + ', ' + agent.forceToApply.y);
				creep.forceToApply.Multiply(this.tickRate);
				creep.body.ApplyImpulse(creep.forceToApply, creep.position());

				// Calculate our new movement angle TODO: Should probably be done after running step
				creep.rotation = creep.velocity().Angle();

				// Moving creep on screen
				creep.x = creep.position().x;
				creep.y = creep.position().y;
			});

			this.world.Step(this.tickRate, 10, 10);
			this.world.ClearForces();
		}, this.tickRate);
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
			this.creeps[i].destroy();
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
					const pctX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY));
					const pctY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY));
					creep.x += (deltaX < 0 ? -creep.speed : creep.speed) * pctX;
					creep.y += (deltaY < 0 ? -creep.speed : creep.speed) * pctY;
				}
			}
		});
	}












	/********************** BEHAVIORS */
	private steeringBehaviourSeek(agent: GameObject, dest: Box2D.Common.Math.b2Vec2): Box2D.Common.Math.b2Vec2 {
		if (dest.x === agent.position().x && dest.y === agent.position().y) {
			return new B2Vec2();
		}


		// Desired change of location
		const desired = dest.Copy();
		desired.Subtract(agent.position());

		// Desired velocity (move there at maximum speed)
		desired.Multiply(agent.maxSpd / desired.Length());

		// The velocity change we want
		desired.Subtract(agent.velocity());

		// Convert to a force
		desired.Multiply(agent.maxForce / agent.maxSpd);

		return desired;
	}

	private steeringBehaviourSeparation(agent: GameObject): Box2D.Common.Math.b2Vec2 {
		const totalForce = new B2Vec2();
		let neighboursCount = 0;

		for (var i = 0; i < this.creeps.length; i++) {
			const a = this.creeps[i];
			if (a !== agent) {
				const distance = agent.position().DistanceTo(a.position());
				if (distance < agent.minSeparation && distance > 0) {
					// Vector to other agent
					const pushForce = agent.position().Copy();
					pushForce.Subtract(a.position());
					const length = pushForce.Normalize(); // Normalize returns the original length
					const r = (agent.radius + a.radius);
					pushForce.Multiply(1 - ((length - r) / (agent.minSeparation - r))); // agent.minSeparation)));

					totalForce.Add(pushForce);
					// totalForce.Add(pushForce.Multiply(1 - (length / agent.minSeparation)));
					// totalForce.Add(pushForce.Divide(agent.radius));

					neighboursCount++;
				}
			}
		}

		if (neighboursCount === 0) {
			return totalForce; // Zero
		}

		totalForce.Multiply(agent.maxForce / neighboursCount);

		return totalForce;
	}

	private steeringBehaviourCohesion(agent: GameObject): Box2D.Common.Math.b2Vec2 {
		// Start with just our position
		let centerOfMass = new B2Vec2(); // agent.position().Copy();
		let neighboursCount = 0;

		for (var i = 0; i < this.creeps.length; i++) {
			const a = this.creeps[i];
			if (a !== agent && a.group === agent.group) {
				const distance = agent.position().DistanceTo(a.position());
				if (distance < agent.maxCohesion) {
					// sum up the position of our neighbours
					centerOfMass.Add(a.position());
					neighboursCount++;
				}
			}
		}

		if (neighboursCount === 0) {
			return new B2Vec2();
		}

		// Get the average position of ourself and our neighbours
		centerOfMass = centerOfMass.Divide(neighboursCount);

		// seek that position
		return this.steeringBehaviourSeek(agent, centerOfMass);
	}

	private steeringBehaviourAlignment(agent: GameObject): Box2D.Common.Math.b2Vec2 {
		let averageHeading = new B2Vec2();
		let neighboursCount = 0;

		// for each of our neighbours (including ourself)
		for (var i = 0; i < this.creeps.length; i++) {
			const a = this.creeps[i];
			const distance = agent.position().DistanceTo(a.position());
			// That are within the max distance and are moving
			if (distance < agent.maxCohesion && a.velocity().Length() > 0 && a.group === agent.group) {
				// Sum up our headings
				const head = a.velocity().Copy();
				head.Normalize();
				averageHeading.Add(head);
				neighboursCount++;
			}
		}

		if (neighboursCount === 0) {
			return averageHeading; // Zero
		}

		// Divide to get the average heading
		averageHeading = averageHeading.Divide(neighboursCount);

		// Steer towards that heading
		return this.steerTowards(agent, averageHeading);
	}

	private steeringBehaviourAvoid(agent: GameObject): Box2D.Common.Math.b2Vec2 {
		if (agent.velocity().LengthSquared() <= agent.radius) {
			return Box2D.Common.Math.b2Math.b2Vec2_zero;
		}

		// Do some ray casts to work out what is in front of us
		let minFraction = 2;
		let closestFixture = null;

		const callback = (fixture, point, normal, fraction) => {
			// Ignore ourself
			if (fixture === agent.fixture) {
				return fraction;
			}

			// Only care about dynamic (moving) things
			if (fraction < minFraction && fixture.GetBody().GetType() === Box2D.Dynamics.b2Body.b2_dynamicBody) {
				minFraction = fraction;
				closestFixture = fixture;
			}

			return 0;
		};

		// Do a straight forward cast from our center
		const agentPosAndVelocity = agent.position().Copy();
		agentPosAndVelocity.Add(agent.velocity());
		this.world.RayCast(callback, agent.position(), agentPosAndVelocity);

		// Calculate an offset so we can do casts from our edge
		const velCopy = agent.velocity().Copy();
		velCopy.Normalize();
		const temp = velCopy.x;
		velCopy.x = velCopy.y;
		velCopy.y = -temp;
		velCopy.Multiply(agent.radius);

		// Do a raycast forwards from our right and left edge
		let agentPos1 = agent.position().Copy();
		let agentPos2 = agent.position().Copy();
		agentPos1.Add(velCopy);
		agentPos2.Add(agent.velocity());
		agentPos2.Add(velCopy);
		this.world.RayCast(callback, agentPos1, agentPos2);

		agentPos1 = agent.position().Copy();
		agentPos2 = agent.position().Copy();
		agentPos1.Subtract(velCopy);
		agentPos2.Add(agent.velocity());
		agentPos2.Subtract(velCopy);
		this.world.RayCast(callback, agentPos1, agentPos2);

		// TODO: May be faster to do a single AABB query or a shape query

		if (closestFixture == null) {
			return Box2D.Common.Math.b2Math.b2Vec2_zero;
		}

		let resultVector = null;

		const collisionBody = closestFixture.GetBody();

		const ourVelocityLengthSquared = agent.velocity().LengthSquared();
		const combinedVelocity = agent.velocity().Copy();
		combinedVelocity.Add(collisionBody.GetLinearVelocity());

		const combinedVelocityLengthSquared = combinedVelocity.LengthSquared();

		// We are going in the same direction and they aren't avoiding
		if (combinedVelocityLengthSquared > ourVelocityLengthSquared && closestFixture.GetUserData().avoidanceDirection === null) {
			return Box2D.Common.Math.b2Math.b2Vec2_zero;
		}

		// Steer to go around it
		const otherType = closestFixture.GetShape().GetType();

		if (otherType === Box2D.Collision.Shapes.b2CircleShape) {

			const vectorInOtherDirection = closestFixture.GetBody().GetPosition().Copy();
			vectorInOtherDirection.Subtract(agent.position());

			// Are we more left or right of them
			let isLeft;
			if (closestFixture.GetUserData().avoidanceDirection !== null) {
				// If they are avoiding, avoid with the same direction as them, so we go the opposite way
				isLeft = closestFixture.GetUserData().avoidanceDirection;
			} else {
				// http://stackoverflow.com/questions/13221873/determining-if-one-2d-vector-is-to-the-right-or-left-of-another
				const dot = agent.velocity().x * -vectorInOtherDirection.y + agent.velocity().y * vectorInOtherDirection.x;
				isLeft = dot > 0;
			}
			agent.avoidanceDirection = isLeft;

			// Calculate a right angle of the vector between us
			// http://www.gamedev.net/topic/551175-rotate-vector-90-degrees-to-the-right/#entry4546571
			resultVector =
				isLeft ?
				new B2Vec2(-vectorInOtherDirection.y, vectorInOtherDirection.x) :
				new B2Vec2(vectorInOtherDirection.y, -vectorInOtherDirection.x);
			resultVector.Normalize();

			// Move it out based on our radius + theirs
			resultVector.Multiply(agent.radius + closestFixture.GetShape().GetRadius());
		} else {
			// Not supported
			// otherType == B2Shape.e_polygonShape
			// debugger;
			console.log('NOT SUPPORTED');
		}

		// Steer torwards it, increasing force based on how close we are
		return this.steerTowards(agent, resultVector).Divide(minFraction);
	}

	private steerTowards(agent: GameObject, desiredDirection: Box2D.Common.Math.b2Vec2): Box2D.Common.Math.b2Vec2 {
		// Multiply our direction by speed for our desired speed
		const desired = desiredDirection.Copy();
		desired.Multiply(agent.maxSpd);

		// The velocity change we want
		desired.Subtract(agent.velocity());

		// Convert to a force
		desired.Multiply(agent.maxForce / agent.maxSpd);

		return desired;
	}
}





/*
//How big the grid is in pixels
var gridWidthPx = 800, gridHeightPx = 448;
var gridPx = 32;

//Grid size in actual units
var gridWidth = gridWidthPx / gridPx;
var gridHeight = gridHeightPx / gridPx;

//Storage for the current agents and obstacles
var agents = new Array();
var obstacles = new Array();

//The physics world
var world = new B2World(B2Vec2.Zero, true);

//Defines an agent that moves
Agent = function (pos, group) {
	this.group = group;

	this.rotation = 0;

	this.maxForce = 50; //rate of acceleration
	this.maxSpeed = 4; //grid squares / second

	this.radius = 0.23;
	this.minSeparation = this.radius * 4; // We'll move away from anyone nearer than this

	this.maxCohesion = this.radius * 10; //We'll move closer to anyone within this bound

	this.maxForceSquared = this.maxForce * this.maxForce;
	this.maxSpeedSquared = this.maxSpeed * this.maxSpeed;

	//Create a physics body for the agent
	var fixDef = new B2FixtureDef();
	var bodyDef = new B2BodyDef();

	fixDef.density = 20.0;
	fixDef.friction = 0.0;
	fixDef.restitution = 0.0;
	fixDef.shape = new B2CircleShape(this.radius);

	bodyDef.type = B2Body.b2_dynamicBody;
	//bodyDef.linearDamping = 0.1;
	bodyDef.position.SetV(pos);

	this.body = world.CreateBody(bodyDef);
	this.fixture = this.body.CreateFixture(fixDef);

	this.body.SetUserData(this);
	this.fixture.SetUserData(this);
};
Agent.prototype.position = function () {
	return this.body.GetPosition();
};
Agent.prototype.velocity = function () {
	return this.body.GetLinearVelocity();
};

var destinations = [
	new B2Vec2(gridWidth - 2, gridHeight / 2), //middle right
	new B2Vec2(1, gridHeight / 2) //middle left
];

//Called to start the game
function startGame() {
	var url = document.URL;
	var hash = url.substring(url.indexOf("#")+1);

	if (hash == 'onemiddle') {
		agents.push(new Agent(new B2Vec2(0, gridHeight / 2), 0));
		agents.push(new Agent(new B2Vec2(gridWidth - 2, gridHeight / 2), 1));
	} else if (hash == 'onetop') {
		agents.push(new Agent(new B2Vec2(0, 2), 0));
		agents.push(new Agent(new B2Vec2(gridWidth - 2, 2), 1));
		destinations[0].y = gridHeight - 1;
		destinations[1].y = gridHeight - 1;
	} else if (hash == 'smallgroups') {

		for (var yPos = gridHeight / 2 - 1; yPos <= gridHeight / 2 + 1; yPos++) {
			agents.push(new Agent(new B2Vec2(0, yPos), 0));
			agents.push(new Agent(new B2Vec2(1, yPos), 0));
			agents.push(new Agent(new B2Vec2(2, yPos), 0));
			agents.push(new Agent(new B2Vec2(gridWidth - 1, yPos), 1));
			agents.push(new Agent(new B2Vec2(gridWidth - 2, yPos), 1));
			agents.push(new Agent(new B2Vec2(gridWidth - 3, yPos), 1));
		}
	} else {
		for (var yPos = 1; yPos < gridHeight - 1; yPos++) {
			agents.push(new Agent(new B2Vec2(0, yPos), 0));
			agents.push(new Agent(new B2Vec2(1, yPos), 0));
			agents.push(new Agent(new B2Vec2(2, yPos), 0));
		}

		for (yPos = 1; yPos < gridHeight - 1; yPos++) {
			agents.push(new Agent(new B2Vec2(gridWidth - 1, yPos), 1));
			agents.push(new Agent(new B2Vec2(gridWidth - 2, yPos), 1));
			agents.push(new Agent(new B2Vec2(gridWidth - 3, yPos), 1));
		}
	}


	//for (var i = 0; i < 30; i++) {
	//	var x = 1 + Math.floor(Math.random() * (gridWidth - 3));
	//	var y = Math.floor(Math.random() * (gridHeight - 2));
	//	obstacles.push(new B2Vec2(x, y));
	//}

	for (var i = 0; i < obstacles.length; i++) {
		var pos = obstacles[i];

		//Create a physics body for the agent
		var fixDef = new B2FixtureDef();
		var bodyDef = new B2BodyDef();

		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;
		fixDef.shape = new B2PolygonShape();
		fixDef.shape.SetAsBox(0.5, 0.5);

		bodyDef.type = B2Body.b2_staticBody;
		bodyDef.position.SetV(pos);

		world.CreateBody(bodyDef).CreateFixture(fixDef);
	}

	stage.addEventListener('stagemouseup', function (ev) {
		destinations[0].x = ev.stageX / gridPx - 0.5;
		destinations[0].y = ev.stageY / gridPx - 0.5;

		destinations[1].x = (gridWidthPx - ev.stageX) / gridPx - 0.5;
		destinations[1].y = (gridHeightPx - ev.stageY) / gridPx - 0.5;
	});
}

function round(val) {
	return val.toFixed(1);
}

//called periodically to update the game
//dt is the change of time since the last update (in seconds)
function gameTick(dt) {
	var i, agent;

	for (i = agents.length - 1; i >= 0; i--) {
		agents[i].avoidanceDirection = null;
	}

	//Calculate steering and flocking forces for all agents
	for (i = agents.length - 1; i >= 0; i--) {
		agent = agents[i];

		//Work out our behaviours
		var ff = steeringBehaviourSeek(agent, destinations[agent.group]);
		var sep = steeringBehaviourSeparation(agent);
		var alg = steeringBehaviourAlignment(agent);
		var coh = steeringBehaviourCohesion(agent);
		var avd = steeringBehaviourAvoid(agent);

		agent.avd = avd.Copy();

		//For visually debugging forces agent.forces = [ff.Copy(), sep.Copy(), alg.Copy(), coh.Copy()];

		agent.forceToApply = ff.Add(sep.Multiply(2.2)).Add(alg.Multiply(0.3)).Add(coh.Multiply(0.05)).Add(avd);

		var lengthSquared = agent.forceToApply.LengthSquared();
		if (lengthSquared > agent.maxForceSquared) {
			agent.forceToApply.Multiply(agent.maxForce / Math.sqrt(lengthSquared));
		}
	}

	//Move agents based on forces being applied (aka physics)
	for (i = agents.length - 1; i >= 0; i--) {
		agent = agents[i];

		//Apply the force
		//console.log(i + ': ' + agent.forceToApply.x + ', ' + agent.forceToApply.y);
		agent.body.ApplyImpulse(agent.forceToApply.Multiply(dt), agent.position());

		//Calculate our new movement angle TODO: Should probably be done after running step
		agent.rotation = agent.velocity().Angle();
	}

	world.Step(dt, 10, 10);
	world.ClearForces();
}

function steeringBehaviourSeek(agent, dest) {

	if (dest.x == agent.position().x && dest.y == agent.position().y) {
		return new B2Vec2();
	}


	//Desired change of location
	var desired = dest.Copy().Subtract(agent.position());
	//Desired velocity (move there at maximum speed)
	desired.Multiply(agent.maxSpeed / desired.Length());
	//The velocity change we want
	var velocityChange = desired.Subtract(agent.velocity());
	//Convert to a force
	return velocityChange.Multiply(agent.maxForce / agent.maxSpeed);
}

function steeringBehaviourSeparation(agent) {
	var totalForce = new B2Vec2();
	var neighboursCount = 0;

	for (var i = 0; i < agents.length; i++) {
		var a = agents[i];
		if (a != agent) {
			var distance = agent.position().DistanceTo(a.position());
			if (distance < agent.minSeparation && distance > 0) {
				//Vector to other agent
				var pushForce = agent.position().Copy().Subtract(a.position());
				var length = pushForce.Normalize(); //Normalize returns the original length
				var r = (agent.radius + a.radius);

				totalForce.Add(pushForce.Multiply(1 - ((length - r) / (agent.minSeparation - r))));//agent.minSeparation)));
				//totalForce.Add(pushForce.Multiply(1 - (length / agent.minSeparation)));
				//totalForce.Add(pushForce.Divide(agent.radius));

				neighboursCount++;
			}
		}
	}

	if (neighboursCount == 0) {
		return totalForce; //Zero
	}

	return totalForce.Multiply(agent.maxForce / neighboursCount);
}

function steeringBehaviourCohesion(agent) {
	//Start with just our position
	var centerOfMass = new B2Vec2()//agent.position().Copy();
	var neighboursCount = 0;

	for (var i = 0; i < agents.length; i++) {
		var a = agents[i];
		if (a != agent && a.group == agent.group) {
			var distance = agent.position().DistanceTo(a.position());
			if (distance < agent.maxCohesion) {
				//sum up the position of our neighbours
				centerOfMass.Add(a.position());
				neighboursCount++;
			}
		}
	}

	if (neighboursCount == 0) {
		return new B2Vec2();
	}

	//Get the average position of ourself and our neighbours
	centerOfMass.Divide(neighboursCount);

	//seek that position
	return steeringBehaviourSeek(agent, centerOfMass);
}

function steeringBehaviourAlignment(agent) {
	var averageHeading = new B2Vec2();
	var neighboursCount = 0;

	//for each of our neighbours (including ourself)
	for (var i = 0; i < agents.length; i++) {
		var a = agents[i];
		var distance = agent.position().DistanceTo(a.position());
		//That are within the max distance and are moving
		if (distance < agent.maxCohesion && a.velocity().Length() > 0 && a.group == agent.group) {
			//Sum up our headings
			var head = a.velocity().Copy();
			head.Normalize();
			averageHeading.Add(head);
			neighboursCount++;
		}
	}

	if (neighboursCount == 0) {
		return averageHeading; //Zero
	}

	//Divide to get the average heading
	averageHeading.Divide(neighboursCount);

	//Steer towards that heading
	return steerTowards(agent, averageHeading);
}

function steeringBehaviourAvoid(agent) {
	if (agent.velocity().LengthSquared() <= agent.radius) {
		return B2Vec2.Zero;
	}

	//Do some ray casts to work out what is in front of us
	var minFraction = 2;
	var closestFixture = null;

	var callback = function (fixture, point, normal, fraction) {
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

	//TODO: May be faster to do a single AABB query or a shape query

	if (closestFixture == null) {
		return B2Vec2.Zero;
	}

	var resultVector = null;

	var collisionBody = closestFixture.GetBody();

	var ourVelocityLengthSquared = agent.velocity().LengthSquared();
	var combinedVelocity = agent.velocity().Copy().Add(collisionBody.GetLinearVelocity());

	var combinedVelocityLengthSquared = combinedVelocity.LengthSquared();

	//We are going in the same direction and they aren't avoiding
	if (combinedVelocityLengthSquared > ourVelocityLengthSquared && closestFixture.GetUserData().avoidanceDirection === null) {
		return B2Vec2.Zero;
	}

	//Steer to go around it
	var otherType = closestFixture.GetShape().GetType();
	if (otherType == B2Shape.e_circleShape) {

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
	} else {
		//Not supported
		//otherType == B2Shape.e_polygonShape
		debugger;
	}

	//Steer torwards it, increasing force based on how close we are
	return steerTowards(agent, resultVector).Divide(minFraction);
}

function steerTowards(agent, desiredDirection) {
	//Multiply our direction by speed for our desired speed
	var desiredVelocity = desiredDirection.Multiply(agent.maxSpeed);

	//The velocity change we want
	var velocityChange = desiredVelocity.Subtract(agent.velocity());
	//Convert to a force
	return velocityChange.Multiply(agent.maxForce / agent.maxSpeed);
}
*/
