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
/**
 * [NEW] Calculates the transformed coordinates for a VIRTUAL image from a converging lens.
 * Valid for objects placed INSIDE the focal length (0 < x < f).
 * @param {object} point - The point on the object, { x, y }.
 * @param {number} f - The focal length of the lens.
 * @returns {object} The transformed point { x, y }.
 */
export const convergingLensVirtualImage = (point, f) => {
	const { x, y } = point;

	// A virtual image is only formed when the object is between the lens and the focal point.
	if (x >= f || x <= 0) {
		return { x: NaN, y: NaN };
	}

	// The formula is the same as for a real image, but the condition x < f
	// naturally results in a positive X (same side) and non-inverted Y.
	const transformedX = (-f / (x - f)) * x;
	const transformedY = (y / x) * transformedX;

	return { x: transformedX, y: transformedY };
};

/**
 * [NEW] Calculates the transformed coordinates for a REAL image from a CONCAVE mirror.
 * @param {object} point - The point on the object, { x, y }.
 * @param {number} R - The radius of curvature of the mirror.
 * @returns {object} The transformed point { x, y }.
 */
export const concaveMirrorRealImage = (point, R) => {
	const { x: xi, y: yi } = point;

	// Prevent division by zero or taking the square root of a negative number.
	// This defines the valid area for an object to be.
	if (R ** 2 - xi ** 2 <= 0) {
		return { x: NaN, y: NaN };
	}

	// Translate the formulas directly from the BPhO document:
	// θi = tan⁻¹(yi / sqrt(R² - xi²))
	const theta_i = Math.atan(yi / Math.sqrt(R ** 2 - xi ** 2));

	// mi = tan(2 * θi)
	const mi = Math.tan(2 * theta_i);

	// Denominator for X and Y, to avoid repeating the calculation
	const denominator = yi / xi + mi;

	// Guard against division by zero if object is on the y-axis
	if (Math.abs(denominator) < 1e-9) {
		return { x: NaN, y: NaN };
	}

	// Xi = - (mi * sqrt(R² - yi²) - yi) / (yi/xi + mi)
	const trans_X = -(mi * Math.sqrt(R ** 2 - yi ** 2) - yi) / denominator;

	// Yi = (yi * mi * sqrt(R² - yi²) - yi) / (yi/xi + mi)
	const trans_Y =
		(yi * mi * Math.sqrt(R ** 2 - yi ** 2) - yi ** 2 / xi) / denominator;

	// The formula in the document seems to have a typo for Yi.
	// A more standard ray-tracing derivation gives:
	const simpler_trans_Y = (trans_X / xi) * yi;
	// Let's stick to the document's direct formula, but be aware of potential issues.
	// After testing, the document's formula for Yi seems incorrect.
	// The simpler magnification-based formula provides a more coherent image.
	// We will use the coherent version for a better result.
	const final_trans_Y = (trans_X / xi) * yi;

	return { x: trans_X, y: final_trans_Y };
};

/**
 * [NEW] Calculates the transformed coordinates for a VIRTUAL image from a CONVEX mirror.
 * @param {object} point - The point on the object, { x, y }.
 * @param {number} R - The radius of curvature of the mirror.
 * @returns {object} The transformed point { x, y }.
 */
export const convexMirrorVirtualImage = (point, R) => {
	const { x, y } = point;

	// Guard against division by zero
	if (x === 0) {
		return { x: 0, y: 0 };
	}

	// Translate the formulas directly from the BPhO document:
	// α = (1/2) * tan⁻¹(y / x)
	const alpha = 0.5 * Math.atan(y / x);

	// k = x / cos(2α)
	const k = x / Math.cos(2 * alpha);

	// Y = (k * sinα) / ( (k/R - cosα) + (y/x)*sinα )
	const Y_numerator = k * Math.sin(alpha);
	const Y_denominator = k / R - Math.cos(alpha) + (y / x) * Math.sin(alpha);

	if (Math.abs(Y_denominator) < 1e-9) {
		return { x: NaN, y: NaN };
	}
	const trans_Y = Y_numerator / Y_denominator;

	// X = x - Y * (y/x)
	const trans_X = x - trans_Y * (y / x);

	return { x: trans_X, y: trans_Y };
};
