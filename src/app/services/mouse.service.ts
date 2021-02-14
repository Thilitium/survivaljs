import { Injectable } from "@angular/core";
import { Math2 } from "src/helpers/Math2";
import { IBuilding } from "../models/ibuilding";
import { ICoords } from "../models/icoords";
import { ICreep } from "../models/icreep";
import { Mouse } from "../models/mouse";
import { Players } from "./players";
import { EngineService } from "./engine.service";
import { EventmanagerService } from "./eventmanager.service";

export class MouseService {
	private engine: EngineService;
	private events: EventmanagerService;

	private mouse: Mouse = Mouse.get();
	public hoveringCreep: ICreep = null;
	public selectedCreeps: ICreep[] = [];
	public selectionBoxStart: ICoords = null;
	public selectionBoxEnd: ICoords = null;
	public selectedBuilding: IBuilding = null;

	private static _instance = null;

	public static get(): MouseService {
		if (this._instance === null) {
			this._instance = new this();
		}

		return this._instance;
	}

	private constructor() {
		this.events = EventmanagerService.get();
		this.engine = EngineService.get();
		this.events.onProcessInputs.subscribe(() => this.processInputs());
	}

	// Process user inputs and update the service state (i.e hovered creeps and selection box end), usually called on each frame.
	// Warning, this is probably a heavy process, it would be cool to run this in parallel if we can be thread safe.
	public processInputs() {
		this.hoveringCreep = null;

		this.engine.creeps.some((creep) => {
			if (Math2.isInBoundingBox(creep, { x: creep.x + creep.width, y: creep.y + creep.height }, this.mouse)) {
					this.hoveringCreep = creep;
			}

			return this.hoveringCreep !== null;
		});

		// Check if needed to update selectionBox
		if (this.selectionBoxStart !== null) {
			this.selectionBoxEnd = { x: this.mouse.x, y: this.mouse.y };
		}
	}

	// On mouse dowm, we start the selection and save the current value as the start of the selectionbox.
	public startSelection() {
		this.selectedCreeps = [];
		if (this.selectionBoxStart === null) {
			this.selectionBoxStart = { x: this.mouse.x, y: this.mouse.y };
		}
	}

	// Could also be called commitSelection, happens on mouse up and basically selects all the creeps that needs to be selected, if any.
	public stopSelection() {
		// Get creeps in the bounding box of the selection if it existed and it was larger than 4px.
		if (this.selectionBoxEnd && (Math2.dist(this.selectionBoxStart, this.selectionBoxEnd) > 4)) {
			Players.getAll().some((p) => {
				if (Math2.isInBoundingBox(this.selectionBoxStart, this.selectionBoxEnd, p.barrack)) {
					this.selectedBuilding = p.barrack;
				}
			});

			this.engine.creeps.forEach((creep) => {
				if (Math2.isInBoundingBox(this.selectionBoxStart, this.selectionBoxEnd, creep)) {
					this.selectedCreeps.push(creep);
				}
			});
		} else {
			// If we have no selection box or just a small one we check if the mouse is inside of a creep.
			// We take the first one we find
			this.engine.creeps.some((creep) => {
				if (Math2.isInBoundingBox(creep.boundingBox().start, creep.boundingBox().end, this.mouse)) {
					this.selectedCreeps.push(creep);
					return true;
				}

				return false;
			})
		}

		this.selectionBoxEnd = null;
		this.selectionBoxStart = null;
	}
}
