import { Injectable } from '@angular/core';
import { EventmanagerService } from './eventmanager.service';
import { DrawEvent } from '../events/draw-event';
import { GameObject } from '../models/gameobject';
import { RenderingLayer } from '../constants/enums';
import { cpus } from 'os';
import { of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RenderService {
	private gameObjects: Array<GameObject>;
	private ctx: CanvasRenderingContext2D;
	private event: DrawEvent;

	constructor(private events: EventmanagerService) {
		this.gameObjects = [];
		this.events.onNewGameObject.subscribe((e) => this.gameObjects.push(e.gameObject));
	 }

	public init(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
		this.event = {
			ctx: this.ctx
		};

		requestAnimationFrame(() => this.render());
	}

	private render() {
		/*this.events.onDraw0.emit(this.event);
		this.events.onDraw1.emit(this.event);
		this.events.onDraw2.emit(this.event);*/

		this.drawFrame(this.gameObjects, this.ctx);
		requestAnimationFrame(() => this.render());
	}

	/**
	 * This method draws a new frame.
	 * @param objects The game objects.
	 * @param ctx The canvas rendering context.
	 */
	private drawFrame(objects: Array<GameObject>, ctx: CanvasRenderingContext2D) {
		const layers = [];

		// List of layers to draw;
		//TODO: Juste make an enumerator
		layers[RenderingLayer.BACKGROUND] = [];
		layers[RenderingLayer.FLOOR] = [];
		layers[RenderingLayer.CREEPS] = [];
		layers[RenderingLayer.STRUCTURES] = [];
		layers[RenderingLayer.ENVIRONMENT] = [];
		layers[RenderingLayer.FX] = [];
		layers[RenderingLayer.FOREGROUND] = [];
		layers[RenderingLayer.UI_BACKGROUND] = [];
		layers[RenderingLayer.UI_FOREGROUND] = [];

		// Indexing the GameObjects by layer for optimization.
		objects.forEach(o => {
			const objectLayer = layers[o.layer];
			if (objectLayer) {
				objectLayer.push(o);
			}
		});

		// Drawing each layer in order.
		layers.forEach((l) => {
			this.drawLayer(l, ctx);
		});
	}

	/**
	 * This method draws a layer comprised of game objects.
	 * @param gameObjects The game objects of the layer.
	 * @param ctx The canvas rendering context.
	 */
	private drawLayer(gameObjects: Array<GameObject>, ctx: CanvasRenderingContext2D) {
		const layerObjects = [];
		gameObjects.forEach(g => {
			if (!g.hidden) {
				this.drawSprite(g, ctx); // We draw a sprite if present & loaded.
				g.draw(ctx); // We call the object's internal draw method.
			}
		});
	}

	/**
	 * This method draws a sprite on screen.
	 * @param o The GameObject we want to draw a sprite from.
	 * @param c The canvas context.
	 */
	private drawSprite(o: GameObject, c: CanvasRenderingContext2D) {
		if (o.sprite && o.spriteLoaded) {
			c.drawImage(o.sprite, o.x, o.y);
		}
	}

}
