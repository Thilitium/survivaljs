import { Injectable } from '@angular/core';
import { CreepDiedEvent } from '../events/creep-died-event';
import { CustomEventEmitter } from '../events/custom-event-emitter';
import { CreepShotEvent } from '../events/creep-shot-event';
import { CreepKilledEvent } from '../events/creep-killed-event';

@Injectable({
	providedIn: 'root'
})
export class EventmanagerService {
	public onCreepKill = new CustomEventEmitter<CreepKilledEvent>();
	public onCreepShot = new CustomEventEmitter<CreepShotEvent>();
	public onCreepDied = new CustomEventEmitter<CreepDiedEvent>();

	constructor() { }
}
