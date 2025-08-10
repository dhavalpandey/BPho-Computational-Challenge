// src/utils/physics.js

/**
 * Sellmeier equation for the refractive index n of BK7 Crown glass.
 * @param {number} wavelength - Wavelength in nanometers (nm).
 * @returns {number} Refractive index.
 */
export const getCrownGlassRefractiveIndex = (wavelength) => {
	const lambdaSq = (wavelength / 1000) ** 2; // Wavelength in microns, squared

	const B = [1.03961212, 0.231792344, 1.01146945];
	const C = [0.00600069867, 0.0200179144, 103.560653];

	let sum = 0;
	for (let i = 0; i < B.length; i++) {
		sum += (B[i] * lambdaSq) / (lambdaSq - C[i]);
	}

	return Math.sqrt(1 + sum);
};

/**
 * Empirical formula for the refractive index of water vs frequency.
 * @param {number} frequency - Frequency in THz (405-790).
 * @returns {number} Refractive index.
 */
export const getWaterRefractiveIndex = (frequency) => {
	const f_scaled_sq = ((frequency * 1e12) / 1e15) ** 2;
	const n_sq_minus_1_inv_sq = 1.731 - 0.261 * f_scaled_sq;
	if (n_sq_minus_1_inv_sq <= 0) return NaN; // Avoid complex numbers
	const n_sq_minus_1 = Math.pow(n_sq_minus_1_inv_sq, -0.5);
	return Math.sqrt(n_sq_minus_1 + 1);
};

/**
 * Converts a light frequency (THz) to an approximate RGB CSS color string.
 * This function smoothly interpolates between key color points.
 * @param {number} frequency - Frequency in THz.
 * @returns {string} CSS color string 'rgb(r,g,b)'.
 */
export const frequencyToColor = (frequency) => {
	const F = [405, 480, 510, 530, 600, 620, 680, 790]; // THz
	const R = [1, 1, 1, 0, 0, 0, 137 / 255, 1];
	const G = [0, 127 / 255, 1, 1, 1, 1, 0, 0];
	const B = [0, 0, 0, 0, 1, 1, 1, 1];

	const interp = (points, values, x) => {
		if (x <= points[0]) return values[0];
		if (x >= points[points.length - 1]) return values[values.length - 1];

		for (let i = 0; i < points.length - 1; i++) {
			if (x >= points[i] && x <= points[i + 1]) {
				const t = (x - points[i]) / (points[i + 1] - points[i]);
				return values[i] * (1 - t) + values[i + 1] * t;
			}
		}
		return 0; // Fallback
	};

	const r = Math.round(interp(F, R, frequency) * 255);
	const g = Math.round(interp(F, G, frequency) * 255);
	const b = Math.round(interp(F, B, frequency) * 255);

	return `rgb(${r},${g},${b})`;
};
/**
 * Performs a linear regression on a set of 2D points.
 * y = mx + c
 * @param {Array<Object>} data - Array of objects, e.g., [{ x: 1, y: 2 }, ...]
 * @returns {Object} { slope, intercept, rSquared, predict }
 */
export const linearRegression = (data) => {
	// ... (code for linearRegression remains the same)
	const n = data.length;
	if (n === 0)
		return { slope: 0, intercept: 0, rSquared: 0, predict: (x) => 0 };

	let sumX = 0,
		sumY = 0,
		sumXY = 0,
		sumX2 = 0,
		sumY2 = 0;
	data.forEach(({ x, y }) => {
		sumX += x;
		sumY += y;
		sumXY += x * y;
		sumX2 += x * x;
		sumY2 += y * y;
	});

	const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
	const intercept = (sumY - slope * sumX) / n;
	const rSquared = Math.pow(
		(n * sumXY - sumX * sumY) /
			Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)),
		2,
	);

	const predict = (x) => slope * x + intercept;

	return { slope, intercept, rSquared, predict };
};

/**
 * [NEW & IMPROVED] Precisely finds the refraction point using the bisection method.
 * This function finds the root of f(x) = n1*sin(theta1) - n2*sin(theta2), which is the
 * point where the travel time is minimized.
 * @returns {number} The precise x-coordinate of the refraction point.
 */
export const findRefractionPoint = (L, y1, y2, n1, n2) => {
	const snellsLawDifference = (x) => {
		const sin_theta1 = x / Math.sqrt(x ** 2 + y1 ** 2);
		const sin_theta2 = (L - x) / Math.sqrt((L - x) ** 2 + y2 ** 2);
		return n1 * sin_theta1 - n2 * sin_theta2;
	};

	let low = 0;
	let high = L;
	let mid = L / 2;
	const tolerance = 1e-12; // High precision for floating point numbers

	// Bisection method is robust and guaranteed to converge here
	for (let i = 0; i < 100; i++) {
		mid = (low + high) / 2;
		const lowVal = snellsLawDifference(low);
		const midVal = snellsLawDifference(mid);

		if (lowVal * midVal > 0) {
			low = mid;
		} else {
			high = mid;
		}
		if ((high - low) / 2 < tolerance) {
			break;
		}
	}

	return mid;
};

/**
 * [NEW] Calculates the transformed coordinates for a real image from a converging lens.
 * Valid for objects placed outside the focal length (x > f).
 * @param {object} point - The point on the object, { x, y }.
 * @param {number} f - The focal length of the lens.
 * @returns {object} The transformed point { x, y }.
 */
export const convergingLensRealImage = (point, f) => {
	const { x, y } = point;

	// If the object is at or within the focal length, a real image isn't formed.
	// We return NaN to prevent drawing.
	if (x <= f) {
		return { x: NaN, y: NaN };
	}

	// Thin lens coordinate transform equations from the document
	const transformedX = (-f / (x - f)) * x;
	const transformedY = (y / x) * transformedX;

	return { x: transformedX, y: transformedY };
};
