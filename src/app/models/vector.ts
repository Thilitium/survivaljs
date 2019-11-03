import { ICoords } from './icoords';

/**
 * This class represents a 2D vector.
 */
export class Vector {
	public x: number;
	public y: number;

	constructor(vX: number = 0, vY: number = 0) {
		this.x = vX;
		this.y = vY;
	}

	/**
	 * This method constructs a vector that represent the path between two points.
	 * @param 	start 	Starting point of the vector.
	 * @param 	end 	End point of the vector
	 * @returns The vector.
	 */
	public static between(start: ICoords, end: ICoords) {
		return new Vector(
			start.x - end.x,
			start.y - end.y
		);
	}

	/**
	 * This method computes the length of a vector.
	 * @returns The length of the vector.
	 */
	public length(): number {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	/**
	 * This method return the vector multiplied by the supplied value.
	 * @param multiplicator The value by which we need to multiply the vector.
	 * @returns The vector resulting from the multiplication.
	 */
	public multiply(multiplicator: number): Vector {
		return new Vector(
			this.x * multiplicator,
			this.y * multiplicator
		);
	}

	/**
	 * This method compute a normalized version of this vector.
	 * @returns The normalized version of this vector.
	 */
	public normalize(): Vector {
		const length = this.length();

		return new Vector(
			this.x / length,
			this.y / length
		);
	}

	/**
	 * This method computes the substraction of another vector to this one.
	 * @param vector The vector we want to substract.
	 * @returns The computed vector.
	 */
	public subtract(vector: Vector): Vector {
		return new Vector(
			this.x - vector.x,
			this.y - vector.y
		);
	}

	/**
	 * This method computes the addition of another vector to this one.
	 * @param vector The vector we want to add.
	 * @returns The resulting vector.
	 */
	public add(vector: Vector): Vector {
		return new Vector(
			this.x + vector.x,
			this.y + vector.y
		);
	}

	/**
	 * This method computes the rotation of a vector.
	 * @param angle The angle in radians.
	 * @returns The rotated vector.
	 */
	public rotate(angle: number): Vector {
		return new Vector(
			this.x * Math.cos(angle) - this.y * Math.sin(angle),
			this.x * Math.sin(angle) + this.y * Math.cos(angle)
		);
	}
}
