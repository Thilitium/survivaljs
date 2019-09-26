import { ICreepEvent } from './icreep-event';
import { Creep } from '../models/creep';

export class CreepDiedEvent implements ICreepEvent {
	creep: Creep;
}
