import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';
import { CreepComponent } from '../../components/creep/creep.component';

export class Basher extends CreepComponent {
	type: CreepType = CreepType.Basher;

	baseStats: IStats = {
		maxHealth: 23,
		maxSpeed: 0.6,
		range: 1,
		attack: 2,
		attackSpeed: 0.5,
		value: 10
	};

	constructor() {
		super();
	}
}
