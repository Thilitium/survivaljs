import { Injectable } from '@angular/core';
import { CreepDiedEvent } from '../events/creep-died-event';
import { CustomEventEmitter } from '../events/custom-event-emitter';
import { CreepShotEvent } from '../events/creep-shot-event';
import { CreepKilledEvent } from '../events/creep-killed-event';
import { NewGameObjectEvent } from '../events/new-game-object-event';
import { DestroyedGameObjectEvent } from '../events/destroyed-game-object-event';

@Injectable({
	providedIn: 'root'
})
export class EventmanagerService {
	public onCreepKill = new CustomEventEmitter<CreepKilledEvent>();
	public onCreepShot = new CustomEventEmitter<CreepShotEvent>();
	public onCreepDied = new CustomEventEmitter<CreepDiedEvent>();
	public onNewGameObject = new CustomEventEmitter<NewGameObjectEvent>();
	public onDestroyedGameObject = new CustomEventEmitter<DestroyedGameObjectEvent>();

	constructor() { }
}
