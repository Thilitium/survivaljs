import { IStats } from '../istats';
import { CreepType } from 'src/app/constants/enums';
import { ICreep } from '../icreep';

export class CreepBase {
	baseStats: IStats = null;
	type: CreepType = CreepType.Unknown;

	speed = 0;
	x = 0;
	y = 0;
	player = -1;
	target: ICreep = null;
	width = 10;
	height = 10;
	health = 10;
	shooting = false;
	lastShotTime: Date = null;
	statsModifier: IStats = {
		maxHealth: 0,
		maxSpeed: 0,
		range: 0,
		attack: 0,
		attackSpeed: 0,
		value: 0
	};

	public get maxHealth(): number { return this.baseStats.maxHealth + this.statsModifier.maxHealth; }
	public get maxSpeed(): number { return this.baseStats.maxSpeed + this.statsModifier.maxSpeed; }
	public get range(): number {return this.baseStats.range + this.statsModifier.range; }
	public get attack(): number {return this.baseStats.attack + this.statsModifier.attack; }
	public get attackSpeed(): number { return this.baseStats.attackSpeed + this.statsModifier.attackSpeed; }
	public get value(): number { return this.baseStats.value + this.statsModifier.value; }


	constructor() {}
}