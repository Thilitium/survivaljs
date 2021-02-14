import { Component, Input, OnDestroy } from "@angular/core";
import { UiLayer } from "src/app/constants/enums";
import { DrawEvent } from "src/app/events/draw-event";
import { IPlayer } from "src/app/models/iplayer";
import { EventmanagerService } from "src/app/services/eventmanager.service";
import { MouseService } from "src/app/services/mouse.service";
import { RenderService } from "src/app/services/render.service";

@Component({
	selector: 'app-ui-upgrades',
	template: ''
})
export class UpgradesComponent implements OnDestroy {
	@Input() player: IPlayer;
	@Input() x: number;
	@Input() y: number;

	private events: EventmanagerService;
	private mouse: MouseService;
	constructor(private render: RenderService) {
		this.events = EventmanagerService.get();
		this.mouse = MouseService.get();
		this.events.onRequestDraw.subscribe(e => {
			this.events.onScheduleDraw.emit({
				layer: UiLayer.UI,
				frameId: e.frameId,
				action: (ctx) => this.draw({ctx: ctx})
			});
		});
		//this.events.onDrawUi.subscribe((e) => this.draw(e));
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = this.player.color;
		e.ctx.fillRect(this.x, this.y, 200, 100);
		e.ctx.fillStyle = 'black';
		e.ctx.fillRect(this.x + 2, this.y + 2, 196, 96);
		e.ctx.restore();


		e.ctx.beginPath();
		e.ctx.strokeStyle = 'white';
		e.ctx.lineWidth = 2;

		// horizontal lines for grid
		for(let iLine = 0; iLine < 3; iLine++) {
			const yLine = this.y + (1 + iLine) * 25;
			e.ctx.moveTo(this.x + 4, yLine);
			e.ctx.lineTo(this.x + 198, yLine);
		}

		// vertical lines for grid
		for (let iLine = 0; iLine < 7; iLine++) {
			const xLine = this.x + (1 + iLine) * 25;
			e.ctx.moveTo(xLine, this.y + 2);
			e.ctx.lineTo(xLine, this.y + 98);
		}

		e.ctx.stroke();
		e.ctx.closePath();

		e.ctx.restore();



	}

	ngOnDestroy(): void {
	}
}
