import { ICreepEvent } from './icreep-event';
import { Creep } from '../models/creep';

export class CreepKilledEvent  implements ICreepEvent {
	public creep: Creep;
	public killer: Creep;
}
