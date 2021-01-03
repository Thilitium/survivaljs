import { Icu } from "@angular/compiler/src/i18n/i18n_ast";
import { ICoords } from "../models/icoords";

export class Constants {
	public static readonly Offset: ICoords = { x: 0, y: 0 };
	public static readonly Mid: ICoords = { x: 300, y: 300 };
	public static readonly Left: ICoords = { x: 25, y: 300 };
	public static readonly TopLeft: ICoords = { x: 25, y: 25 };
	public static readonly Top: ICoords = { x: 300, y: 25 };
	public static readonly TopRight: ICoords = { x: 575, y: 25 };
	public static readonly Right: ICoords = { x: 575, y: 300 };
	public static readonly BottomRight: ICoords = { x: 575, y: 575 };
	public static readonly Bottom: ICoords = { x: 300, y: 575 };
	public static readonly BottomLeft: ICoords = { x: 25, y: 575 };
}
