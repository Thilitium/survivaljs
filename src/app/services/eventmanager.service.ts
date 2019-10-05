import { Injectable } from '@angular/core';
import { CreepDiedEvent } from '../events/creep-died-event';
import { CustomEventEmitter } from '../events/custom-event-emitter';
import { CreepShotEvent } from '../events/creep-shot-event';
import { CreepKilledEvent } from '../events/creep-killed-event';
import { DrawEvent } from '../events/draw-event';

@Injectable({
	providedIn: 'root'
})
export class EventmanagerService {
	public onCreepKill = new CustomEventEmitter<CreepKilledEvent>();
	public onCreepShot = new CustomEventEmitter<CreepShotEvent>();
	public onCreepDied = new CustomEventEmitter<CreepDiedEvent>();
	public onDraw0 = new CustomEventEmitter<DrawEvent>();
	public onDraw1 = new CustomEventEmitter<DrawEvent>();
	public onDraw2 = new CustomEventEmitter<DrawEvent>();

	constructor() { }
}
