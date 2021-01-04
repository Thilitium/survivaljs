import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';
import { CreepBase } from './creep-base';

export class Basher extends CreepBase {
	type: CreepType = CreepType.Basher;

	baseStats: IStats = {
		maxHealth: 23,
		maxSpeed: 0.6,
		range: 1,
		attack: 2,
		attackSpeed: 0.5,
		value: 10
	};
}
