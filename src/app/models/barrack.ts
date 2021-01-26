import { IBuilding } from './ibuilding';
import { ICreep } from './icreep';

export interface Barrack extends IBuilding {
	respawnTime: number;
	creeps: Array<ICreep>;
}
