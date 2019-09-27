import { CreepType } from '../constants/enums';
import { IStats } from './istats';


export interface ICreep extends IStats {
	speed: number;
	x: number;
	y: number;
	player: number;
	target: ICreep;
	width: number;
	height: number;
	health: number;
	shooting: boolean;
	lastShotTime: Date;
	type: CreepType;
	statsModifier: IStats;
}
