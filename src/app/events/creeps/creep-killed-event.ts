import { ICreepEvent } from './icreep-event';
import { ICreep } from '../../models/icreep';
import { CreepBase } from 'src/app/models/creeps/creep-base';

export class CreepKilledEvent  implements ICreepEvent {
	public creep: CreepBase;
	public killer: CreepBase;
}
