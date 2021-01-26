import { ICoords } from "./icoords";
import { IPlayer } from "./iplayer";

export interface IBuilding extends ICoords {
	level: number;
	selected: false;
	player: IPlayer;
}
