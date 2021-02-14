import { Injectable } from '@angular/core';
import { CreepDiedEvent } from '../events/creeps/creep-died-event';
import { CustomEventEmitter } from '../events/custom-event-emitter';
import { CreepShotEvent } from '../events/creeps/creep-shot-event';
import { CreepKilledEvent } from '../events/creeps/creep-killed-event';
import { DrawEvent } from '../events/draw-event';
import { ProcessInputsEvent } from '../events/process-inputs-events';
import { EventManager } from '@angular/platform-browser';
import { ScheduleDrawEvent } from '../events/schedule-draw-event';
import { RequestDrawEvent } from '../events/request-draw-event';

export class EventmanagerService {
	public onCreepKill = new CustomEventEmitter<CreepKilledEvent>();
	public onCreepShot = new CustomEventEmitter<CreepShotEvent>();
	public onCreepDied = new CustomEventEmitter<CreepDiedEvent>();
	public onProcessInputs = new CustomEventEmitter<ProcessInputsEvent>();
	public onScheduleDraw = new CustomEventEmitter<ScheduleDrawEvent>();
	public onRequestDraw = new CustomEventEmitter<RequestDrawEvent>();

	private static _instance = null;
	public static get(): EventmanagerService {
		if(this._instance === null) {
			this._instance = new this();
		}

		return this._instance;
	}

	private constructor() { }
}
