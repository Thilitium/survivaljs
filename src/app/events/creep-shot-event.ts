import { Creep } from '../models/creep';
import { ICreepEvent } from './icreep-event';

export class CreepShotEvent implements ICreepEvent {
	creep: Creep;
}
