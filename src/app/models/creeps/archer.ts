import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';
import { CreepComponent } from '../../components/creep/creep.component';

export class Archer extends CreepComponent {
	type: CreepType = CreepType.Archer;

	baseStats: IStats = {
		maxHealth: 8,
		maxSpeed: 0.6,
		range: 22,
		attack: 0.8,
		attackSpeed: 0.55,
		value: 15
	};
}
