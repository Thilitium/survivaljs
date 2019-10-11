import { Vector } from './vector';

describe('Vector', () => {
	it('should create an instance', () => {
		expect(new Vector(0, 0)).toBeTruthy();
	});

	it('should have a correct length', () => {
		expect((new Vector(0, 5)).length()).toBe(5);
	});

	it('should normalize correctly', () => {
		expect(new Vector(15, 17).normalize().length()).toBe(1);
	});
});
