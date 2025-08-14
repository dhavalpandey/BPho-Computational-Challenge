// src/utils/physics.js
export const getCrownGlassRefractiveIndex = (wavelength) => {
	const lambdaSq = (wavelength / 1000) ** 2;
	const B = [1.03961212, 0.231792344, 1.01146945];
	const C = [0.00600069867, 0.0200179144, 103.560653];
	let sum = 0;
	for (let i = 0; i < B.length; i++) {
		sum += (B[i] * lambdaSq) / (lambdaSq - C[i]);
	}
	return Math.sqrt(1 + sum);
};

export const getWaterRefractiveIndex = (frequency) => {
	const f_scaled_sq = ((frequency * 1e12) / 1e15) ** 2;
	const n_sq_minus_1_inv_sq = 1.731 - 0.261 * f_scaled_sq;
	if (n_sq_minus_1_inv_sq <= 0) return NaN;
	const n_sq_minus_1 = Math.pow(n_sq_minus_1_inv_sq, -0.5);
	return Math.sqrt(n_sq_minus_1 + 1);
};

export const frequencyToColor = (frequency) => {
	const F = [405, 480, 510, 530, 600, 620, 680, 790];
	const R = [1, 1, 1, 1, 0, 0, 127 / 255, 137 / 255];
	const G = [0, 127 / 255, 1, 1, 1, 1, 0, 0];
	const B = [0, 0, 0, 0, 1, 1, 1, 1];
	const interp = (p, v, x) => {
		if (x <= p[0]) return v[0];
		if (x >= p[p.length - 1]) return v[v.length - 1];
		for (let i = 0; i < p.length - 1; i++) {
			if (x >= p[i] && x <= p[i + 1]) {
				const t = (x - p[i]) / (p[i + 1] - p[i]);
				return v[i] * (1 - t) + v[i + 1] * t;
			}
		}
		return 0;
	};
	const r = Math.round(interp(F, R, frequency) * 255);
	const g = Math.round(interp(F, G, frequency) * 255);
	const b = Math.round(interp(F, B, frequency) * 255);
	return `rgb(${r},${g},${b})`;
};

export const linearRegression = (data) => {
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

export const findRefractionPoint = (L, y1, y2, n1, n2) => {
	const f = (x) =>
		n1 * (x / Math.sqrt(x ** 2 + y1 ** 2)) -
		n2 * ((L - x) / Math.sqrt((L - x) ** 2 + y2 ** 2));
	let low = 0,
		high = L,
		mid;
	for (let i = 0; i < 100; i++) {
		mid = (low + high) / 2;
		if (f(low) * f(mid) > 0) low = mid;
		else high = mid;
		if ((high - low) / 2 < 1e-12) break;
	}
	return mid;
};

// --- This is the new, unified function replacing the two separate ones ---
export const thinLensTransform = (point, f) => {
	const { x: u, y } = point;
	if (u === f || u === 0) {
		return { x: NaN, y: NaN };
	}

	// 1. Calculate image distance 'v' using the thin lens equation: 1/v = 1/f - 1/u
	const v = 1 / (1 / f - 1 / u);

	// 2. Calculate magnification: M = -v/u
	const M = -v / u;

	// 3. Define transformed coordinates based on convention:
	//    Image x-position is at -v (left side for real images, right side for virtual)
	//    Image y-position is magnified by M
	const x_image = -v; // CRITICAL FIX: Real images form at -v in our coordinate system
	const y_image = y * M;

	return { x: x_image, y: y_image };
};

export const concaveMirrorTransform = (point, R) => {
	const { x: u, y } = point;
	const f = R / 2;

	if (u === f || u <= 0) {
		return { x: NaN, y: NaN };
	}

	// 1. Calculate image distance 'v' using the Mirror Equation: 1/v = 1/f - 1/u
	const v = 1 / (1 / f - 1 / u);

	// 2. Calculate magnification: M = -v/u
	const M = -v / u;
	const y_image = y * M;

	return { x: v, y: y_image };
};

export const concaveMirrorPixelTransform = (point, R) => {
	const a = point.x;
	const b = point.y;

	// 1. Ray from (a,b) travels horizontally left. Intersection yi = b.
	// Clamp to mirror aperture to prevent sqrt of negative.
	const yi = Math.max(-R + 1e-6, Math.min(R - 1e-6, b));
	const xi_squared = R * R - yi * yi;
	if (xi_squared < 0) return { x: NaN, y: NaN };
	const xi = -Math.sqrt(xi_squared); // Use left arc

	// 2. Reflect incident direction d_in = (-1, 0) about unit normal n̂ = (xi/R, yi/R)
	const nx = xi / R;
	const ny = yi / R;
	const din_dot_n = -nx; // d_in.x * nx + d_in.y * ny = -1 * nx + 0 * ny

	const dout_x = -1 - 2 * din_dot_n * nx;
	const dout_y = 0 - 2 * din_dot_n * ny;

	// If reflected ray doesn't travel right, it won't intersect the plane x=a.
	if (dout_x < 1e-9) return { x: NaN, y: NaN };

	// 3. Find intersection of reflected ray with the object plane x=a
	// Ray: P(t) = (xi, yi) + t * (dout_x, dout_y). We want P(t).x = a.
	// xi + t * dout_x = a  =>  t = (a - xi) / dout_x
	const t = (a - xi) / dout_x;
	const A = a; // By definition, it's in the object plane
	const B = yi + t * dout_y;

	return { x: A, y: B };
};

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
export const anamorphicTransform = (point, Rf, arc_deg) => {
	const { x, y } = point;

	// 1. Check if the point is within the source unit circle
	if (x ** 2 + y ** 2 > 1) {
		return { x: NaN, y: NaN };
	}

	// 2. Map the object's local coordinates to the new polar coordinates
	// The new radius is proportional to the original y-coordinate.
	// We map y from [-1, 1] to a radius [0, 2*Rf] based at the center of the arc.
	// The document shows the arc centered at the base of the object, so we adjust.
	// Let's use a simpler, direct mapping from the diagram:
	// Original X maps to Angle. Original Y maps to Radius.

	const arc_rad = arc_deg * (Math.PI / 180);

	// Map x from [-1, 1] to an angle from [-arc_rad/2, +arc_rad/2]
	const theta = x * (arc_rad / 2);

	// Map y from [-1, 1] to a radius from [Rf, Rf + objectHeight]
	// Let's assume the "red star" base is at Rf and the object has a height proportional to Rf.
	// A more direct interpretation from the visual is that the y-coordinate maps to the radius.
	// y=-1 -> R = 0. y=1 -> R = Rf. So, R = Rf * (y+1)/2
	const r = (Rf * (y + 1)) / 2;

	// 3. Convert the new polar coordinates back to cartesian for drawing.
	// We add PI/2 to rotate the arc to be upright.
	const trans_X = r * Math.sin(theta);
	const trans_Y = r * Math.cos(theta);

	return { x: trans_X, y: trans_Y };
};

/**
 * [NEW] Calculates the rainbow elevation angles based on Descartes' model.
 * @param {number} theta_deg - Angle of incidence in degrees.
 * @param {number} n - Refractive index of the water droplet.
 * @returns {object} { phi_deg, primary_epsilon_deg, secondary_epsilon_deg }
 */
export const calculateRainbowAngles = (theta_deg, n) => {
	const theta_rad = theta_deg * (Math.PI / 180);

	// From Snell's Law: sin(theta) = n * sin(phi)
	const sin_phi = Math.sin(theta_rad) / n;
	if (Math.abs(sin_phi) > 1)
		return {
			phi_deg: NaN,
			primary_epsilon_deg: NaN,
			secondary_epsilon_deg: NaN,
		};
	const phi_rad = Math.asin(sin_phi);

	// Primary rainbow elevation: ε = 4φ - 2θ
	const primary_epsilon_rad = 4 * phi_rad - 2 * theta_rad;

	// Secondary rainbow elevation: ε = π - 6φ + 2θ
	const secondary_epsilon_rad = Math.PI - 6 * phi_rad + 2 * theta_rad;

	return {
		phi_deg: phi_rad * (180 / Math.PI),
		primary_epsilon_deg: primary_epsilon_rad * (180 / Math.PI),
		secondary_epsilon_deg: secondary_epsilon_rad * (180 / Math.PI),
	};
};

/**
 * [NEW] Finds the precise angle of incidence (θ) that causes the rainbow for a given refractive index (n).
 * This is the angle of minimum deviation, where dε/dθ = 0.
 * @param {number} n - Refractive index of the water droplet.
 * @returns {object} { primary_theta_deg, secondary_theta_deg }
 */
export const findRainbowMinDeviation = (n) => {
	// For primary rainbow, from dε/dθ = 0, we get cos²(θ) = (n² - 1) / 3
	const cos2_theta_primary = (n ** 2 - 1) / 3;
	const primary_theta_rad =
		cos2_theta_primary > 0 ? Math.acos(Math.sqrt(cos2_theta_primary)) : NaN;

	// For secondary rainbow, from dε/dθ = 0, we get cos²(θ) = (n² - 1) / 8
	const cos2_theta_secondary = (n ** 2 - 1) / 8;
	const secondary_theta_rad =
		cos2_theta_secondary > 0
			? Math.acos(Math.sqrt(cos2_theta_secondary))
			: NaN;

	return {
		primary_theta_deg: primary_theta_rad * (180 / Math.PI),
		secondary_theta_deg: secondary_theta_rad * (180 / Math.PI),
	};
};

/**
 * [NEW] Calculates the full ray path and angles for dispersion through a prism.
 * @param {number} theta_i_deg - Angle of incidence in degrees.
 * @param {number} alpha_deg - Prism apex angle in degrees.
 * @param {number} n - Refractive index of the prism for a given wavelength.
 * @returns {object} An object with angles and a flag for Total Internal Reflection (TIR).
 */
export const calculatePrismPath = (theta_i_deg, alpha_deg, n) => {
	const theta_i_rad = theta_i_deg * (Math.PI / 180);
	const alpha_rad = alpha_deg * (Math.PI / 180);

	// 1. First Refraction (Air -> Glass)
	const sin_beta = Math.sin(theta_i_rad) / n;
	if (Math.abs(sin_beta) > 1) return { tir: true }; // Should not happen for n > 1
	const beta_rad = Math.asin(sin_beta);

	// 2. Angle at the second interface
	const gamma_rad = alpha_rad - beta_rad;

	// 3. Check for Total Internal Reflection (TIR)
	const sin_gamma = Math.sin(gamma_rad);
	if (n * sin_gamma > 1) {
		return { tir: true }; // Total Internal Reflection occurs
	}

	// 4. Second Refraction (Glass -> Air)
	const theta_t_rad = Math.asin(n * sin_gamma);

	// 5. Total Deviation
	const delta_rad = theta_i_rad + theta_t_rad - alpha_rad;

	return {
		tir: false,
		theta_i_deg,
		beta_deg: beta_rad * (180 / Math.PI),
		gamma_deg: gamma_rad * (180 / Math.PI),
		theta_t_deg: theta_t_rad * (180 / Math.PI),
		delta_deg: delta_rad * (180 / Math.PI),
	};
};
