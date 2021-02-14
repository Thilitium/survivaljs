import { UiLayer } from "../constants/enums";

export class ScheduleDrawEvent {
	public action: (ctx: CanvasRenderingContext2D) => void;
	public layer: UiLayer;
	public frameId: number;
}
