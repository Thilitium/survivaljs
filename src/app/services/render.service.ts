import { Injectable } from '@angular/core';
import { EventmanagerService } from './eventmanager.service';
import { DrawEvent } from '../events/draw-event';
import { ScheduleDrawEvent } from '../events/schedule-draw-event';
import { UiLayer } from '../constants/enums';

@Injectable({
	providedIn: 'root'
})
export class RenderService {
	private ctx: CanvasRenderingContext2D;
	private uiCtx: CanvasRenderingContext2D;
	private events: EventmanagerService;
	private frameId: number = 0;

	constructor() {
		this.events = EventmanagerService.get();
		this.events.onScheduleDraw.subscribe((e) => this.handleSheduledDraws(e));
	}

	public init(ctx: CanvasRenderingContext2D, uiCtx: CanvasRenderingContext2D) {
		this.ctx = ctx;
		this.uiCtx = uiCtx;

		requestAnimationFrame(() => this.render());
	}

	private requests: ScheduleDrawEvent[] = [];

	private render() {
		// We make a map of all the layers and the events scheduled to them.
		var layers: ScheduleDrawEvent[][] = [];
		Object.keys(UiLayer).forEach((layer) => layers[layer] = []);
		this.requests.forEach(r => {
			layers[r.layer].push(r);
		});

		// we then draw each event on every layer in order
		layers.forEach(layer => {
			layer.forEach(scheduledDrawEvent  => {
				if (scheduledDrawEvent.layer === UiLayer.UI) {
					scheduledDrawEvent.action(this.uiCtx);
				} else {
					scheduledDrawEvent.action(this.ctx);
				}
			});
		});
		this.requests = [];
		this.frameId++;

		requestAnimationFrame(() => this.render());
		this.sendDrawRequest();
	}

	private sendDrawRequest() {
		// Ask people to schedule their events.
		this.events.onRequestDraw.emit({
			frameId: this.frameId
		});
	}

	private handleSheduledDraws(e: ScheduleDrawEvent) {
		// Get all the scheduled draw events.
		if (e.frameId == this.frameId) {
			this.requests.push(e);
		}
	}

}
