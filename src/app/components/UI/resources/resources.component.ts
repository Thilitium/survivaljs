import { Component, Input, OnDestroy } from "@angular/core";
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

	constructor(private events: EventmanagerService, private mouse: MouseService, private render: RenderService) {
		this.events.onDrawUi.subscribe((e) => this.draw(e));
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
		this.events.onDrawUi.unsubscribe();
	}
}
