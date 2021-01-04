import { ICreep } from '../../models/icreep';
import { ICreepEvent } from './icreep-event';

export class CreepShotEvent implements ICreepEvent {
	creep: ICreep;
}
