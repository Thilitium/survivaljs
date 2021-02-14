import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';
import { CreepComponent } from '../../components/creep/creep.component';

export class Tower extends CreepComponent {
	type: CreepType = CreepType.Archer;

	baseStats: IStats = {
		maxHealth: 8,
		maxSpeed: 0,
		range: 30,
		attack: 1,
		attackSpeed: 0.4,
		value: 150
	};
}
