import { CreepType } from '../constants/enums';
import { IStats } from './istats';
import { ICoords } from './icoords';


export interface ICreep extends IStats, ICoords {
	aggroRange: number;
	targetInRange: boolean;
	speed: number;
	player: number;
	target: ICreep;
	width: number;
	height: number;
	health: number;
	shooting: boolean;
	lastShotTime: Date;
	type: CreepType;
	statsModifier: IStats;
	baseStats: IStats;
	destinations: ICoords[];
	currentDestination: ICoords;
	lastDestination: ICoords;
}
