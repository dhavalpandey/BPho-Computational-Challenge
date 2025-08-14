export function convexMirrorPixelTransform({ x, y }, R, eps = 1e-9) {
	// Object must be on the right-hand side of the centre.
	if (x <= 0) return { x: NaN, y: NaN };

	// Limit to vertical aperture of the mirror.
	if (Math.abs(y) >= R) return { x: NaN, y: NaN };

	// On-axis limit (y -> 0): mapping shrinks radially to the origin in this model.
	if (Math.abs(y) < eps) return { x: 0, y: 0 };

	// α = 0.5 * atan2(y, x)   (use atan2 then halve; critical for correctness)
	const alpha = 0.5 * Math.atan2(y, x);

	// Guard cos(2α) near zero (grazing configuration).
	const c2a = Math.cos(2 * alpha);
	if (Math.abs(c2a) < eps) return { x: NaN, y: NaN };

	const k = x / c2a;

	// Denominator MUST use (x / y) * sin(α) exactly (common bug is y/x).
	const denom = k / R - Math.cos(alpha) + (x / y) * Math.sin(alpha);
	if (Math.abs(denom) < eps) return { x: NaN, y: NaN };

	const Y = (k * Math.sin(alpha)) / denom;
	const X = x * (Y / y);

	return { x: X, y: Y };
}
