import { ICoords } from './icoords';
import { RenderingLayer } from '../constants/enums';
import { EventmanagerService } from '../services/eventmanager.service';
import { NewGameObjectEvent } from '../events/new-game-object-event';

/**
 * This class implements the basics needed for an object to be drawn.
 */
export class GameObject implements ICoords {
	private _currentLayer: RenderingLayer;
	private _layer;

	public sprite: HTMLImageElement;
	public draw(ctx: CanvasRenderingContext2D): void {}
	public spriteLoaded: boolean;
	public x: number;
	public y: number;

	get hidden() {
		return this._currentLayer !== RenderingLayer.HIDDEN;
	}

	set hidden(value: boolean) {
		if (value) {
			this._currentLayer = RenderingLayer.HIDDEN;
		} else {
			this._currentLayer = this.layer;
		}
	}

	get layer() {
		return this._layer;
	}

	set layer(value: RenderingLayer) {
		this._layer = value;
		if (this._currentLayer !== RenderingLayer.HIDDEN) {
			this._currentLayer = this._layer;
		}
	}



	constructor(events: EventmanagerService, sprite: HTMLImageElement, layer: RenderingLayer, coords: ICoords)  {
		this.sprite = sprite || null;
		this.spriteLoaded = sprite ? true : false;
		this.x = coords ? coords.x : 0;
		this.y = coords ? coords.y : 0;
		this.layer = layer ? layer : RenderingLayer.HIDDEN;
		events.onNewGameObject.emit({gameObject: this});
	}
}
