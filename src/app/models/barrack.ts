import { GameObject } from './gameobject';
import { IBuilding } from './ibuilding';
import { IPlayer } from './iplayer';
import { IStats } from './istats';

export abstract class Barrack extends GameObject implements IBuilding {
	level: number;
	selected: false;
	player: IPlayer;
	respawnTime: number; // seconds
	lastSpawnTime: number = 0; // milliseconds
	meleeModifier: IStats;
	rangedModifier: IStats;
}
