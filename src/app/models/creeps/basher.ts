import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';
import { CreepBase } from './creep-base';

export class Basher extends CreepBase {
	type: CreepType = CreepType.Melee;

	baseStats: IStats = {
		maxHealth: 10,
		maxSpeed: 1,
		range: 1,
		attack: 5,
		attackSpeed: 1,
		value: 10,
		acceleration: 50
	};
}
