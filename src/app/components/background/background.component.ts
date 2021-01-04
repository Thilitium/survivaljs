import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RenderService } from 'src/app/services/render.service';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { DrawEvent } from 'src/app/events/draw-event';
import { MouseService } from 'src/app/services/mouse.service';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { Mouse } from 'src/app/models/mouse';

@Component({
	selector: 'app-background',
	templateUrl: './background.component.html',
	styleUrls: ['./background.component.css']
})
export class BackgroundComponent implements OnInit {
	@ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;

	private background: HTMLImageElement;
	private backgroundLoaded = false;

	constructor(private events: EventmanagerService, private render: RenderService, private mouseManager: MouseService) {
		this.background = new Image();
		this.background.onload = () => {
			this.backgroundLoaded = true;
		};
		this.background.src = '../../assets/map.png';

		this.events.onDrawBackground.subscribe((e) => this.draw(e));
	}

	ngOnInit() {
		this.registerEvents();
		const ctx = this.canvas.nativeElement.getContext('2d');
		this.render.init(ctx);
	}

	private registerEvents() {
		this.canvas.nativeElement.onmousemove = (e: MouseEvent) => {
			Mouse.get().x = e.offsetX;
			Mouse.get().y = e.offsetY;
		};

		this.canvas.nativeElement.onmousedown = (e: MouseEvent) => {
			this.mouseManager.startSelection();
		}

		this.canvas.nativeElement.onmouseup = (e: MouseEvent) => {
			this.mouseManager.stopSelection();
		};
	}

	private draw(e: DrawEvent) {
		e.ctx.fillStyle = 'rgb(80, 80, 80)';
		e.ctx.fillRect(0, 0, 800, 600);

		if (this.backgroundLoaded) {
			e.ctx.drawImage(this.background, 0, 0);
		}
	}
}


		/*// this will capture all mousemove events from the canvas element
  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }*/
