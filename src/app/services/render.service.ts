import { Injectable } from '@angular/core';
import { EventmanagerService } from './eventmanager.service';
import { DrawEvent } from '../events/draw-event';

@Injectable({
	providedIn: 'root'
})
export class RenderService {
	private ctx: CanvasRenderingContext2D;
	private event: DrawEvent;

	constructor(private events: EventmanagerService) { }

	public init(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
		this.event = {
			ctx: this.ctx
		};

		requestAnimationFrame(() => this.render());
	}

	private render() {
		this.events.onDraw0.emit(this.event);
		this.events.onDraw1.emit(this.event);
		this.events.onDraw2.emit(this.event);

		requestAnimationFrame(() => this.render());
   	}
}
