import { IStats } from '../istats';
import { CreepType, RenderingLayer } from 'src/app/constants/enums';
import { ICreep } from '../icreep';
import { ICoords } from '../icoords';
import { Subscription } from 'rxjs';
import { GameObject } from '../gameobject';
import { OnDestroy } from '@angular/core';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import * as Box2D from '../../../scripts/Box2D.js';
import b2Common = Box2D.Common;
import b2Math = Box2D.Common.Math;
import b2Collision = Box2D.Collision;
import b2Shapes = Box2D.Collision.Shapes;
import b2Dynamics = Box2D.Dynamics;
import b2Contacts = Box2D.Dynamics.Contacts;
import b2Controllers = Box2D.Dynamics.Controllers;
import b2Joints = Box2D.Dynamics.Joints;

export class CreepBase extends GameObject implements OnDestroy, ICreep {
	baseStats: IStats = null;
	type: CreepType = CreepType.Unknown;

	speed = 0;
	x = 0;
	y = 0;
	destination: ICoords = null;
	player = -1;
	target: ICreep = null;
	width = 10;
	height = 10;
	health = 10;
	shooting = false;
	lastShotTime: Date = null;
	aggroRange = 50;
	targetInRange = false;
	statsModifier: IStats = {
		maxHealth: 0,
		maxSpeed: 0,
		range: 0,
		attack: 0,
		attackSpeed: 0,
		value: 0
	};

	lastDestination: ICoords = null;
	public get currentDestination(): ICoords {
		return this.target ? this.target : this.destination;
	}
	public get maxHealth(): number { return this.baseStats.maxHealth + this.statsModifier.maxHealth; }
	public get maxSpeed(): number { return this.baseStats.maxSpeed + this.statsModifier.maxSpeed; }
	public get range(): number {return this.baseStats.range + this.statsModifier.range; }
	public get attack(): number {return this.baseStats.attack + this.statsModifier.attack; }
	public get attackSpeed(): number { return this.baseStats.attackSpeed + this.statsModifier.attackSpeed; }
	public get value(): number { return this.baseStats.value + this.statsModifier.value; }

	private subscriptions: Array<Subscription> = [];
	private shootingDisplay = false;
	private get pctHealth(): number {
		return this.health / this.maxHealth;
	}

	constructor(
		private events: EventmanagerService, coords: ICoords = {x: 0, y: 0}, world: Box2D.Dynamics.b2World = null, group: number = null) {
		super(events, null, RenderingLayer.CREEPS, coords, world, group);
		this.subscriptions.push(this.events.onCreepShot.subscribe(e => {
			if (e.creep === this) {
				this.shootingAnimation();
			}
		}));
	}

	shootingAnimation() {
		this.shootingDisplay = true;
		setTimeout(() => {
			this.shootingDisplay = false;
		}, 50);
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		// Black border (or yellow if attacking)
		ctx.fillStyle = this.shootingDisplay ? 'rgb(255, 255, 0)' : 'rgb(0, 0, 0)';
		ctx.beginPath();
		ctx.arc(this.x + this.width / 2, this.y + this.width / 2, (this.width) / 2, 0, 2 * Math.PI);
		ctx.fill();

		// Creep
		ctx.fillStyle = this.player === 1 ? 'rgb(0, 0, 255)' : 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(this.x + this.width / 2, this.y + this.width / 2, (this.width - 1) / 2, 0, 2 * Math.PI);
		ctx.fill();

		// Health bar border
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(this.x, this.y - 7, this.width, 5);

		// Health bar background
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.fillRect(this.x + 1, this.y - 6, this.width - 2, 3);

		// Health bar
		ctx.fillStyle = 'rgb(0, 255, 0)';
		ctx.fillRect(this.x + 1, this.y - 6, this.pctHealth * (this.width - 2), 3);
	}

	// TODO: Implémenter un destructeur à la mano
	ngOnDestroy(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
