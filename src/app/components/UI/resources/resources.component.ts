import { Component, Input, OnDestroy } from "@angular/core";
import { UiLayer } from "src/app/constants/enums";
import { DrawEvent } from "src/app/events/draw-event";
import { IPlayer } from "src/app/models/iplayer";
import { EventmanagerService } from "src/app/services/eventmanager.service";
import { MouseService } from "src/app/services/mouse.service";
import { RenderService } from "src/app/services/render.service";

@Component({
	selector: 'app-ui-resources',
	template: ''
})
export class ResourcesComponent implements OnDestroy {
	@Input() player: IPlayer;
	@Input() x: number;
	@Input() y: number;
	private events: EventmanagerService;
	private mouse: MouseService;

	constructor(private render: RenderService) {
		this.events = EventmanagerService.get();
		this.mouse = MouseService.get();
		//this.events.onDrawUi.subscribe((e) => this.draw(e));
		this.events.onRequestDraw.subscribe(e => {
			this.events.onScheduleDraw.emit({
				action: (ctx) => this.draw({ctx: ctx}),
				layer: UiLayer.UI,
				frameId: e.frameId
			});
		});
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = this.player.color;
		e.ctx.fillRect(this.x, this.y, 200, 25);
		e.ctx.fillStyle = 'black';
		e.ctx.fillRect(this.x + 2, this.y + 2, 196, 21);
		e.ctx.fillStyle = 'white';
		e.ctx.fillText(`Gold: ${this.player.gold}`, this.x + 12, this.y + 16, 42);

		e.ctx.restore();
	}

	ngOnDestroy(): void {
		//this.events.onDrawUi.unsubscribe();
	}
}
