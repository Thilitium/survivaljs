import { ReturnStatement } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { CreepComponent } from "../components/creep/creep.component";
import { ICoords } from "../models/icoords";
import { ICreep } from "../models/icreep";
import { Mouse } from "../models/mouse";
import { EngineService } from "./engine.service";
import { EventmanagerService } from "./eventmanager.service";

@Injectable({
	providedIn: "root"
})
export class MouseService {
	private mouse: Mouse = Mouse.get();
	public hoveringCreep: ICreep = null;
	public selectedCreeps: ICreep[] = [];
	public selectionBoxStart: ICoords = null;
	public selectionBoxEnd: ICoords = null;

	constructor(private engine: EngineService, private events: EventmanagerService) {
		this.events.onProcessInputs.subscribe(() => this.processInputs());
	}

	public processInputs() {
		// Check if hovering creep.
		// We only retain the first creep that is hovered in the order of the list.
		this.hoveringCreep = null;
		this.engine.creeps.some((creep) => {
			if (this.mouse.x <= creep.x + creep.width &&
				this.mouse.x >= creep.x &&
				this.mouse.y <= creep.y + creep.height &&
				this.mouse.y >= creep.y) {
					this.hoveringCreep = creep;
			}

			return this.hoveringCreep !== null;
		});

		// Check if needed to update selectionBox
		if (this.selectionBoxStart !== null) {
			this.selectionBoxEnd = { x: this.mouse.x, y: this.mouse.y };
		}
	}

	public startSelection() {
		this.selectedCreeps = [];
		if (this.selectionBoxStart === null) {
			this.selectionBoxStart = { x: this.mouse.x, y: this.mouse.y };
		}
	}

	public stopSelection() {
		// Get creeps in the bounding box of the selection if it existed.
		if (this.selectionBoxEnd) {
			this.engine.creeps.forEach((creep) => {
				if (this.selectionBoxStart.x > this.selectionBoxEnd.x) {
					if (!(creep.x <= this.selectionBoxStart.x && creep.x >= this.selectionBoxEnd.x))
						return;
				} else {
					if (!(creep.x <= this.selectionBoxEnd.x && creep.x >= this.selectionBoxStart.x))
						return;
				}

				if (this.selectionBoxStart.y > this.selectionBoxEnd.y) {
					if (!(creep.y <= this.selectionBoxStart.y && creep.y >= this.selectionBoxEnd.y))
						return;
				} else {
					if (!(creep.y <= this.selectionBoxEnd.y && creep.y >= this.selectionBoxStart.y))
						return;
				}

				this.selectedCreeps.push(creep);
			});
		}

		this.selectionBoxEnd = null;
		this.selectionBoxStart = null;
	}


}
