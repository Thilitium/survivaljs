import { ICoords } from './icoords';
import { RenderingLayer } from '../constants/enums';
import { EventmanagerService } from '../services/eventmanager.service';
import * as Box2D from '../../scripts/Box2D.js';
import b2Common = Box2D.Common;
import b2Math = Box2D.Common.Math;
import b2Collision = Box2D.Collision;
import b2Shapes = Box2D.Collision.Shapes;
import b2Dynamics = Box2D.Dynamics;
import b2Contacts = Box2D.Dynamics.Contacts;
import b2Controllers = Box2D.Dynamics.Controllers;
import b2Joints = Box2D.Dynamics.Joints;

/**
 * This class implements the basics needed for an object to be drawn.
 */
export class GameObject implements ICoords {
	private _currentLayer: RenderingLayer;
	private _layer;
	private _events: EventmanagerService;

	public sprite: HTMLImageElement;
	public spriteLoaded: boolean;
	public x: number;
	public y: number;

	/****************************************************************************************************************/
	/* PHYSICS ******************************************************************************************************/
	/****************************************************************************************************************/
	public group: number;

	public rotation = 0;
	public avoidanceDirection = null;
	public maxForce = 50; // rate of acceleration
	public maxSpd = 4; // grid squares / second

	public radius = 0.23;
	public minSeparation = this.radius * 4; // We'll move away from anyone nearer than this

	public maxCohesion = this.radius * 10; // We'll move closer to anyone within this bound

	public maxForceSquared = this.maxForce * this.maxForce;
	private maxSpeedSquared = this.maxSpd * this.maxSpd;

	public forceToApply: b2Common.Math.b2Vec2;

	// Create a physics body for the agent
	private fixDef = new b2Dynamics.b2FixtureDef();
	private bodyDef = new b2Dynamics.b2BodyDef();
	public body: b2Dynamics.b2Body;
	public fixture: b2Dynamics.b2Fixture;

	public position() {
		return this.body.GetPosition();
	}

	public velocity() {
		return this.body.GetLinearVelocity();
	}
	/****************************************************************************************************************/


	public draw(ctx: CanvasRenderingContext2D): void {}

	get hidden() {
		return this._currentLayer === RenderingLayer.HIDDEN;
	}

	set hidden(value: boolean) {
		if (value) {
			this._currentLayer = RenderingLayer.HIDDEN;
		} else {
			this._currentLayer = this.layer;
		}
	}

	get layer() {
		return this._layer;
	}

	set layer(value: RenderingLayer) {
		this._layer = value;
		if (this._currentLayer !== RenderingLayer.HIDDEN) {
			this._currentLayer = this._layer;
		}
	}

	constructor(events: EventmanagerService,
				sprite: HTMLImageElement,
				layer: RenderingLayer,
				coords: ICoords,
				world: b2Dynamics.b2World = null,
				group: number = null) {
		// TODO: We now have optionals parameters in method declaration
		this.sprite = sprite || null;
		this.spriteLoaded = sprite ? true : false;
		this.x = coords ? coords.x : 0;
		this.y = coords ? coords.y : 0;
		this.layer = layer ? layer : RenderingLayer.HIDDEN;
		events.onNewGameObject.emit({gameObject: this});
		this._events = events;


		/****************************************************************************************************************/
		/* PHYSICS ******************************************************************************************************/
		/****************************************************************************************************************/
		this.group = group;
		this.fixDef.density = 20.0;
		this.fixDef.friction = 0.0;
		this.fixDef.restitution = 0.0;
		this.fixDef.shape = new b2Collision.Shapes.b2CircleShape(this.radius);

		this.bodyDef.type = b2Dynamics.b2Body.b2_dynamicBody;
		//bodyDef.linearDamping = 0.1;
		this.bodyDef.position.SetV(new b2Common.Math.b2Vec2(this.x, this.y));

		this.body = world.CreateBody(this.bodyDef);
		this.fixture = this.body.CreateFixture(this.fixDef);

		this.body.SetUserData(this);
		this.fixture.SetUserData(this);
		/****************************************************************************************************************/
	}

	public destroy(): void {
		this._events.onDestroyedGameObject.emit({gameObject: this});
	}
}
