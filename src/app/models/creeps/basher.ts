import { ICreep } from '../icreep';
import { CreepType } from 'src/app/constants/enums';
import { IStats } from '../istats';

export class Basher implements ICreep {
	speed = 1;
	maxSpeed = 1;
	range = 20;
	x = 0;
	y = 0;
	player = -1;
	target: ICreep = null;
	width = 10;
	height = 10;
	health = 10;
	maxHealth = 10;
	attack = 3;
	attackSpeed = 1;
	value = 10;
	shooting = false;
	lastShotTime: Date = null;
	type: CreepType = CreepType.Melee;
	statsModifier: IStats = {
		maxHealth: 0,
		maxSpeed: 0,
		range: 0,
		attack: 0,
		attackSpeed: 0,
		value: 0
	};

	constructor() {}
}
