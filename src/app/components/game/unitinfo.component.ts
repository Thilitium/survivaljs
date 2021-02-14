import { Input } from "@angular/core";
import { Component, OnDestroy } from "@angular/core";
import { DrawEvent } from "src/app/events/draw-event";
import { IPlayer } from "src/app/models/iplayer";
import { EventmanagerService } from "src/app/services/eventmanager.service";
import { MouseService } from "src/app/services/mouse.service";
import { RenderService } from "src/app/services/render.service";

@Component({
	selector: 'app-ui-unitinfo',
	template: ''
})
export class UnitInfoComponent implements OnDestroy {
	@Input() player: IPlayer;
	@Input() x: number;
	@Input() y: number;

	constructor(private events: EventmanagerService, private mouse: MouseService, private render: RenderService) {
		//this.events.onDrawUi.subscribe((e) => this.draw(e));
	}

	private draw(e: DrawEvent) {

	}

	ngOnDestroy(): void {
		//this.events.onDrawUi.unsubscribe();
	}
}
