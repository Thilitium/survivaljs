import { Component, OnDestroy } from "@angular/core";
import { DrawEvent } from "src/app/events/draw-event";
import { EventmanagerService } from "src/app/services/eventmanager.service";
import { MouseService } from "src/app/services/mouse.service";
import { RenderService } from "src/app/services/render.service";

@Component({
	selector: 'app-selectionbox',
	template: ''
})
export class SelectionboxComponent implements OnDestroy {

	constructor(private events: EventmanagerService, private mouse: MouseService, private render: RenderService) {
		this.events.onDrawUi.subscribe((e) => this.draw(e));
	}

	private draw(e: DrawEvent) {

		if (this.mouse.selectionBoxEnd !== null) {
			e.ctx.beginPath();
			e.ctx.globalAlpha = 0.2;
			e.ctx.rect(this.mouse.selectionBoxStart.x, this.mouse.selectionBoxStart.y,
				this.mouse.selectionBoxEnd.x - this.mouse.selectionBoxStart.x,
				this.mouse.selectionBoxEnd.y - this.mouse.selectionBoxStart.y);
			e.ctx.fillStyle = "cyan";
			e.ctx.fill();
			e.ctx.strokeStyle = "blue";
			e.ctx.lineWidth = 2;
			e.ctx.stroke();
			e.ctx.globalAlpha = 1;
			e.ctx.closePath();
			e.ctx.restore();
		}
	}

	ngOnDestroy(): void {
		this.events.onDrawUi.unsubscribe();
	}
}