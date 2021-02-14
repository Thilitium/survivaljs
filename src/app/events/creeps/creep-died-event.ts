import { ICreepEvent } from './icreep-event';
import { CreepBase } from 'src/app/models/creeps/creep-base';

export class CreepDiedEvent implements ICreepEvent {
	creep: CreepBase;
}
