import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RenderService } from 'src/app/services/render.service';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { GameObject } from 'src/app/models/gameobject';
import { RenderingLayer } from 'src/app/constants/enums';

@Component({
	selector: 'app-background',
	templateUrl: './background.component.html',
	styleUrls: ['./background.component.css']
})
export class BackgroundComponent extends GameObject implements OnInit {
	@ViewChild('canvas', {static: true}) canvas: ElementRef;


	constructor(private events: EventmanagerService, private render: RenderService) {
		super(events, null, RenderingLayer.BACKGROUND, {x: 200, y: 0});
		this.sprite = new Image();
		this.sprite.onload = () => {
			this.spriteLoaded = true;
		};
		this.sprite.src = '../../assets/map.png';
	}

	ngOnInit() {
		this.render.init(this.canvas.nativeElement.getContext('2d'));
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = 'rgb(80, 80, 80)';
		ctx.fillRect(0, 0, 800, 600);
	}
}
