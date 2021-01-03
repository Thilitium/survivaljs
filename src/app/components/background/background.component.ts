import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RenderService } from 'src/app/services/render.service';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { DrawEvent } from 'src/app/events/draw-event';

@Component({
	selector: 'app-background',
	templateUrl: './background.component.html',
	styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements OnInit {
	@ViewChild('canvas', {static: true}) canvas: ElementRef;

	private background: HTMLImageElement;
	private backgroundLoaded = false;

	constructor(private events: EventmanagerService, private render: RenderService) {
		this.background = new Image();
		this.background.onload = () => {
			this.backgroundLoaded = true;
		};
		this.background.src = '../../assets/map.png';

		this.events.onDraw0.subscribe((e) => this.draw(e));
	}

	ngOnInit() {
		this.render.init(this.canvas.nativeElement.getContext('2d'));
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = 'rgb(80, 80, 80)';
		e.ctx.fillRect(0, 0, 800, 600);

		if (this.backgroundLoaded) {
			e.ctx.drawImage(this.background, 0, 0);
		}
	}
}
