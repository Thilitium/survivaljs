export enum CreepType {
	Unknown,
	Ranged,
	Melee
}

/**
 * @description
 * Defines the different levels of rendering from backmost to topmost.
 */
export enum RenderingLayer {
	HIDDEN,
	BACKGROUND,
	FLOOR,
	CREEPS,
	STRUCTURES,
	ENVIRONMENT,
	FX,
	FOREGROUND,
	UI_BACKGROUND,
	UI_FOREGROUND
}
