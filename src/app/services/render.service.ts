import { Injectable } from '@angular/core';
import { EventmanagerService } from './eventmanager.service';
import { DrawEvent } from '../events/draw-event';

@Injectable({
	providedIn: 'root'
})
export class RenderService {
	private ctx: CanvasRenderingContext2D;
	private event: DrawEvent;
	private events: EventmanagerService;

	constructor() {
		this.events = EventmanagerService.get();
	}

	public init(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
		this.event = {
			ctx: this.ctx
		};

		requestAnimationFrame(() => this.render());
	}

	private render() {
		this.events.onDrawBackground.emit(this.event);
		this.events.onDrawBarracks.emit(this.event);
		this.events.onDrawCreeps.emit(this.event);
		this.events.onDrawAmbient.emit(this.event);
		this.events.onDrawUi.emit(this.event);

		requestAnimationFrame(() => this.render());
   	}
}
