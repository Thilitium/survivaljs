import { ICreepEvent } from './icreep-event';
import { ICreep } from '../../models/icreep';

export class CreepKilledEvent  implements ICreepEvent {
	public creep: ICreep;
	public killer: ICreep;
}
