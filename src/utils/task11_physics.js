const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

// Safe asin for [−1,1]
function asn(x) {
	return Math.asin(Math.max(-1, Math.min(1, x)));
}

// Build φ(θ; n) with Snell; return null if invalid.
function phiFromTheta(theta, n) {
	const s = Math.sin(theta) / n;
	if (s < -1 || s > 1) return null; // impossibility
	return asn(s);
}

// Deviation functions
function deviationPrimary(theta, n) {
	const phi = phiFromTheta(theta, n);
	if (phi == null) return Number.POSITIVE_INFINITY;
	return Math.PI + 2 * theta - 4 * phi;
}

function deviationSecondary(theta, n) {
	const phi = phiFromTheta(theta, n);
	if (phi == null) return Number.POSITIVE_INFINITY;
	return 2 * Math.PI + 2 * theta - 6 * phi;
}

// Golden-section search on [a,b] for function f; returns {x, fx}
function goldenMin(f, a, b, tol = 1e-8, maxIter = 120) {
	const φ = (1 + Math.sqrt(5)) / 2;
	const ρ = 1 - 1 / φ;
	let x1 = a + ρ * (b - a);
	let x2 = b - ρ * (b - a);
	let f1 = f(x1);
	let f2 = f(x2);
	let iter = 0;
	while (Math.abs(b - a) > tol && iter++ < maxIter) {
		if (f1 > f2) {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = b - ρ * (b - a);
			f2 = f(x2);
		} else {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = a + ρ * (b - a);
			f1 = f(x1);
		}
	}
	const x = (a + b) / 2;
	return { x, fx: f(x) };
}

// Public API

// Find minima of primary and secondary deviations for a given refractive index n
export function findMinimaDeg(n) {
	// search domain for θ: avoid endpoints; clamp within (0, π/2)
	const a = 1e-6,
		b = Math.PI / 2 - 1e-6;
	const p = goldenMin((th) => deviationPrimary(th, n), a, b);
	const s = goldenMin((th) => deviationSecondary(th, n), a, b);

	const theta1 = p.x;
	const theta2 = s.x;
	const D1 = p.fx;
	const D2 = s.fx;

	const phi1 = phiFromTheta(theta1, n);
	const phi2 = phiFromTheta(theta2, n);

	return {
		primary: {
			theta_deg: theta1 * DEG,
			phi_deg: (phi1 ?? 0) * DEG,
			deviation_deg: D1 * DEG,
			elevation_deg: 180 - D1 * DEG, // ε = 180° − D°
		},
		secondary: {
			theta_deg: theta2 * DEG,
			phi_deg: (phi2 ?? 0) * DEG,
			deviation_deg: D2 * DEG,
			elevation_deg: 180 - D2 * DEG,
		},
		critical_deg: Math.asin(1 / n) * DEG, // water→air critical angle inside droplet
	};
}

// For simulator: tabulate ε₁(f) and ε₂(f) across frequency domain
export function sampleRainbowAngles(getN, fStart = 405, fEnd = 790, step = 5) {
	const out = [];
	for (let f = fStart; f <= fEnd; f += step) {
		const n = getN(f);
		if (!isFinite(n)) continue;
		const { primary, secondary } = findMinimaDeg(n);
		out.push({
			f,
			eps1: primary.elevation_deg,
			eps2: secondary.elevation_deg,
		});
	}
	return out;
}
