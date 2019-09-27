import { CreepBase } from './creep-base';
import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';

export class Archer extends CreepBase {
	type: CreepType = CreepType.Ranged;

	baseStats: IStats = {
		maxHealth: 5,
		maxSpeed: 1,
		range: 40,
		attack: 2,
		attackSpeed: 1,
		value: 15
	};
}
