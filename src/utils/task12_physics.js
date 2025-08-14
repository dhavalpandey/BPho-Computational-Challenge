// --- Task 12 physics helpers: prism ray tracing with “top-left” left-face normal
// Maths is y-up. Rendering can flip Y once in SVG.

// ========== vector ops ==========
const V = (x, y) => ({ x, y });
const add = (a, b) => V(a.x + b.x, a.y + b.y);
const sub = (a, b) => V(a.x - b.x, a.y - b.y);
const mul = (a, k) => V(a.x * k, a.y * k);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const len = (a) => Math.hypot(a.x, a.y);
const nrm = (a) => {
	const L = len(a);
	return L > 0 ? V(a.x / L, a.y / L) : V(0, 0);
};

// rotate 90° left (CCW): gives the “left-hand” normal of a tangent
const perpLeft = (t) => V(-t.y, t.x);

// ========== geometry ==========
/** Build isosceles prism of height H with apex angle alphaDeg (CCW order). */
export function buildPrism(alphaDeg, H = 1.0) {
	const a = (alphaDeg * Math.PI) / 180;
	const halfBase = Math.tan(a / 2) * H;

	const p_left = V(-halfBase, -H / 2);
	const p_top = V(0, +H / 2);
	const p_right = V(+halfBase, -H / 2);

	// Edges (A->B) CCW: left, right, base
	const faces = [
		{ A: p_left, B: p_top }, // 0: left face (slanted up-right)
		{ A: p_top, B: p_right }, // 1: right face
		{ A: p_right, B: p_left }, // 2: base (not usually used)
	];

	// Unit tangents along faces
	const tangents = faces.map(({ A, B }) => nrm(sub(B, A)));

	// *** IMPORTANT CONVENTION ***
	// We define the left-face normal to be the *perp-left* of its tangent,
	// which points to the TOP-LEFT corner (your requirement).
	const n_left_topLeft = nrm(perpLeft(tangents[0]));

	// The other faces: we’ll still compute outward normals if needed,
	// but we only require a *correctly oriented* normal for each refraction
	// (the refraction routine auto-orients to the incident medium).
	const outwardNormals = tangents.map((t) => nrm(V(t.y, -t.x))); // rotate CW

	return {
		p_left,
		p_top,
		p_right,
		faces,
		tangents,
		n_left_topLeft,
		outwardNormals,
		H,
	};
}

/** Ray/segment intersection. Ray: P+t*r, t>=0. Segment: A + u*(B-A), 0<=u<=1. */
function raySegIntersect(P, r, A, B, eps = 1e-9) {
	const s = sub(B, A);
	const denom = r.x * s.y - r.y * s.x;
	if (Math.abs(denom) < eps) return null;
	const AP = sub(A, P);
	const t = (AP.x * s.y - AP.y * s.x) / denom;
	const u = (AP.x * r.y - AP.y * r.x) / denom;
	if (t >= eps && u >= -eps && u <= 1 + eps) {
		return { t, u, point: add(P, mul(r, t)) };
	}
	return null;
}

/** Snell refraction (vector form). Auto-orients the normal to the incident medium. */
function refract(iHat, nHat, n1, n2, eps = 1e-9) {
	let i = nrm(iHat);
	let n = nrm(nHat);

	// Ensure n points into the incident medium: require -i·n >= 0
	if (-dot(i, n) < 0) n = V(-n.x, -n.y);

	const eta = n1 / n2;
	const cosi = Math.max(-1, Math.min(1, -dot(i, n))); // cos θ_i
	const k = 1 - eta * eta * (1 - cosi * cosi);
	if (k < eps) return { ok: false }; // Total Internal Reflection
	const t = add(mul(i, eta), mul(n, eta * cosi - Math.sqrt(k)));
	return { ok: true, tHat: nrm(t) };
}

/**
 * Trace a wavelength through the prism with your conventions:
 *  - θi measured to the left-face normal pointing TOP-LEFT.
 *  - The beam must come from the RIGHT of canvas.
 */
export function tracePrismRay({
	prism,
	incidenceAngleDeg,
	nGlass,
	extent = 2.6,
}) {
	const { faces, tangents, n_left_topLeft } = prism;
	const LEFT = 0,
		RIGHT = 1,
		BASE = 2;

	// Entry point: midpoint of the left face (anywhere on a plane gives identical refraction)
	const entry = mul(add(faces[LEFT].A, faces[LEFT].B), 0.5);

	// Build TWO candidate incident directions in air that make θi with the TOP-LEFT normal.
	// i = -cosθ * n  ±  sinθ * t   (both approach the face; choose the one whose source is to the RIGHT)
	const theta = (incidenceAngleDeg * Math.PI) / 180;
	const n = n_left_topLeft; // TOP-LEFT normal (into AIR, by our convention)
	const t = tangents[LEFT]; // along the face (up-right)
	const i1 = nrm(add(mul(n, -Math.cos(theta)), mul(t, +Math.sin(theta))));
	const i2 = nrm(add(mul(n, -Math.cos(theta)), mul(t, -Math.sin(theta))));

	// Place sources backward along each direction and pick the one whose source lies to the RIGHT
	const src1 = add(entry, mul(i1, -extent));
	const src2 = add(entry, mul(i2, -extent));
	const useFirst = src1.x > src2.x; // rightmost source = “beam enters from right”
	const iAir = useFirst ? i1 : i2;
	const source = useFirst ? src1 : src2;

	// Intersect that ray with the left face to confirm entry (robust against geometry changes)
	const hitLeft = raySegIntersect(source, iAir, faces[LEFT].A, faces[LEFT].B);
	if (!hitLeft) return { source, tir: true };
	const trueEntry = hitLeft.point;

	// Refraction #1: AIR (n=1) -> GLASS (n=nGlass). Normal = TOP-LEFT normal (auto-oriented inside refract()).
	const r1 = refract(iAir, n, 1.0, nGlass);
	if (!r1.ok) return { source, entry: trueEntry, tir: true };

	// Propagate to next face (right or base), take nearest hit.
	const insideDir = r1.tHat;
	const candidates = [
		{
			idx: RIGHT,
			hit: raySegIntersect(
				trueEntry,
				insideDir,
				faces[RIGHT].A,
				faces[RIGHT].B,
			),
		},
		{
			idx: BASE,
			hit: raySegIntersect(
				trueEntry,
				insideDir,
				faces[BASE].A,
				faces[BASE].B,
			),
		},
	].filter((c) => c.hit);

	if (!candidates.length) return { source, entry: trueEntry, tir: true };

	candidates.sort((a, b) => a.hit.t - b.hit.t);
	const { idx: exitFaceIdx, hit } = candidates[0];
	const insideExit = hit.point;

	// Refraction #2: GLASS -> AIR, normal must be into the incident medium (GLASS) at the second interface.
	// The outward normal of that face points from glass to air; flip it to point into glass.
	const outwardExit = nrm(
		V(tangents[exitFaceIdx].y, -tangents[exitFaceIdx].x),
	); // CW of tangent
	const nIntoGlass = V(-outwardExit.x, -outwardExit.y);
	const r2 = refract(insideDir, nIntoGlass, nGlass, 1.0);
	if (!r2.ok) return { source, entry: trueEntry, insideExit, tir: true };

	const exitDir = r2.tHat;
	const outEnd = add(insideExit, mul(exitDir, extent));

	return { source, entry: trueEntry, insideExit, outEnd, tir: false };
}
