import { Injectable } from '@angular/core';
import { CreepDiedEvent } from '../events/creeps/creep-died-event';
import { CustomEventEmitter } from '../events/custom-event-emitter';
import { CreepShotEvent } from '../events/creeps/creep-shot-event';
import { CreepKilledEvent } from '../events/creeps/creep-killed-event';
import { DrawEvent } from '../events/draw-event';
import { ProcessInputsEvent } from '../events/process-inputs-events';

@Injectable({
	providedIn: 'root'
})
export class EventmanagerService {
	public onCreepKill = new CustomEventEmitter<CreepKilledEvent>();
	public onCreepShot = new CustomEventEmitter<CreepShotEvent>();
	public onCreepDied = new CustomEventEmitter<CreepDiedEvent>();
	public onDrawBackground = new CustomEventEmitter<DrawEvent>();
	public onDrawBarracks = new CustomEventEmitter<DrawEvent>();
	public onDrawCreeps = new CustomEventEmitter<DrawEvent>();
	public onDrawAmbient = new CustomEventEmitter<DrawEvent>();
	public onDrawUi = new CustomEventEmitter<DrawEvent>();
	public onProcessInputs = new CustomEventEmitter<ProcessInputsEvent>();

	constructor() { }
}
