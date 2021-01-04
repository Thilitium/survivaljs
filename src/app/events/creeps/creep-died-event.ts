import { ICreepEvent } from './icreep-event';
import { ICreep } from '../../models/icreep';

export class CreepDiedEvent implements ICreepEvent {
	creep: ICreep;
}
