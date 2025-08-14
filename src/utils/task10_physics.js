export function discToAnnularArcTransform(
	{ x, y },
	Rf,
	arc_deg,
	tau = 0.35, // fixed inner/outer radius ratio (kept constant to honour “two inputs only”)
	eps = 1e-9,
) {
	// Reject points outside the unit disc (with a small tolerance)
	const rho2 = x * x + y * y;
	if (rho2 > 1 + eps) return { x: NaN, y: NaN };

	// Source polar
	const rho = Math.min(1, Math.sqrt(Math.max(0, rho2)));
	const phi = Math.atan2(y, x); // (-π, π]

	// Geometry
	const Δ = (Math.max(eps, arc_deg) * Math.PI) / 180; // arc span in radians
	const R_out = Math.max(eps, Rf);
	const R_in = Math.min(Math.max(eps, tau * R_out), R_out - eps); // ensure 0 < R_in < R_out

	// Target polar
	const rPrime = R_in + (R_out - R_in) * rho; // linear radial map to annulus
	const thetaPrime = -0.5 * Δ + (Δ * (phi + Math.PI)) / (2 * Math.PI); // uniform angular map

	return {
		x: rPrime * Math.cos(thetaPrime),
		y: rPrime * Math.sin(thetaPrime),
	};
}
