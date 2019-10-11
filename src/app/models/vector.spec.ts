import { Vector } from './vector';

describe('Vector', () => {
	it('should create an instance', () => {
		expect(new Vector(0, 0)).toBeTruthy();
	});

	it('should have a correct length', () => {
		expect((new Vector(0, 5)).length()).toBe(5);
	});

	it('should normalize', () => {
		expect(new Vector(15, 17).normalize().length()).toBe(1);
	});

	it('should multiply', () => {
		expect(new Vector(20, 30).multiply(3).x).toBe(20 * 3);
		expect(new Vector(15, 65).multiply(9).y).toBe(65 * 9);
	});

	it('should add', () => {
		expect(new Vector(3, 4).add(new Vector(5, 6)).x).toBe(8);
		expect(new Vector(3, 4).add(new Vector(5, 6)).y).toBe(10);
	});

	it('should subtract', () => {
		expect(new Vector(3, 4).subtract(new Vector(5, 6)).x).toBe(-2);
		expect(new Vector(3, 4).subtract(new Vector(5, 7)).y).toBe(-3);
	});
});
