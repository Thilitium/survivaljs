import { Component, Input, OnDestroy } from "@angular/core";
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
		this.events.onDrawUi.subscribe((e) => this.draw(e));
	}

	private draw(e: DrawEvent) {

	}

	ngOnDestroy(): void {
		this.events.onDrawUi.unsubscribe();
	}
}
