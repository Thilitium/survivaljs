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

	constructor(private events: EventmanagerService, private render: RenderService) {
		this.events.onDraw0.subscribe(this.draw);
	}

	ngOnInit() {
		this.render.init(this.canvas.nativeElement.getContext('2d'));
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = '#FFFFFF';
		e.ctx.fillRect(0, 0, 800, 600);
	}
}
