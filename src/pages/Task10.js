// src/pages/Task10.js
import React, { useState, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import { discToAnnularArcTransform } from "../utils/task10_physics";

// --- Styled Components (consistent across tasks) ---
const TaskContainer = styled(motion.div)``;

const Title = styled.h2`
	margin-bottom: 1.5rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text};
	border-left: 4px solid ${({ theme }) => theme.primary};
	padding-left: 1rem;
`;

const TwoColumnLayout = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 2rem;
	align-items: stretch;
`;

const ControlAndVizContainer = styled.div`
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 12px;
	padding: 2rem;
	box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
	min-height: 500px;
	display: flex;
	flex-direction: column;
`;

const SummaryContainer = styled.div`
	grid-column: 1 / -1;
	background: ${({ theme }) => theme.accent};
	border-radius: 8px;
	padding: 1.5rem;
	line-height: 1.7;
	border: 1px solid ${({ theme }) => theme.line};
	margin-top: 2rem;
	font-size: 1rem;
`;

const SummaryTitle = styled.h3`
	margin-bottom: 1rem;
	color: ${({ theme }) => theme.primary};
`;

const Equation = styled.div`
	margin: 1rem 0;
	padding: 1rem;
	background: ${({ theme }) => theme.body};
	border-radius: 6px;
	text-align: center;
	font-family: "Courier New", Courier, monospace;
	font-size: 1.1rem;
	overflow-x: auto;
`;

const Canvas = styled.canvas`
	width: 100%;
	height: 100%;
	border-radius: 8px;
`;

// --- Component ---
const Task10 = () => {
	const theme = useTheme();
	const canvasRef = useRef(null);
	const imgDataRef = useRef(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	// Only the two required controls
	const [Rf, setRf] = useState(3.0); // outer arc radius
	const [arcDeg, setArcDeg] = useState(160); // total angular span

	// Load the source image once
	useEffect(() => {
		const image = new Image();
		image.src = "/sybil_cat.png";
		image.onload = () => {
			const tmp = document.createElement("canvas");
			tmp.width = image.width;
			tmp.height = image.height;
			const tctx = tmp.getContext("2d");
			tctx.drawImage(image, 0, 0);
			imgDataRef.current = {
				image,
				pixels: tctx.getImageData(0, 0, image.width, image.height),
			};
			setIsImageLoaded(true);
		};
	}, []);

	// Render
	useEffect(() => {
		if (!isImageLoaded || !canvasRef.current) return;

		const { image, pixels } = imgDataRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { alpha: true });

		// HiDPI setup
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const rect = canvas.getBoundingClientRect();
		const W = Math.max(1, Math.floor(rect.width));
		const H = Math.max(1, Math.floor(rect.height));
		canvas.width = Math.floor(W * dpr);
		canvas.height = Math.floor(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;

		// Clear
		ctx.clearRect(0, 0, W, H);

		// Symmetric layout (both visuals perfectly centred in their halves)
		const pad = 24;
		const halfW = (W - 3 * pad) / 2;

		// Left unit circle centre & radius
		const leftCX = pad + halfW / 2;
		const leftCY = H / 2;
		const discRadiusPx = Math.min(halfW / 2, H / 2 - pad); // keep generous margins

		// Right annular arc centre (the “red star” position)
		const rightCX = pad * 2 + halfW + halfW / 2;
		const rightCY = H / 2;

		// Common scale so both sides share the same pixel density.
		// The outer ring radius must fit: Rf * scale <= discRadiusPx
		const scale = discRadiusPx / Math.max(1e-9, Rf);

		// --- Left: Original image clipped to a perfect unit circle ---
		ctx.save();
		ctx.beginPath();
		ctx.arc(leftCX, leftCY, discRadiusPx, 0, 2 * Math.PI);
		ctx.strokeStyle = theme.line;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.clip();
		ctx.drawImage(
			image,
			leftCX - discRadiusPx,
			leftCY - discRadiusPx,
			discRadiusPx * 2,
			discRadiusPx * 2,
		);
		ctx.restore();

		ctx.fillStyle = theme.text;
		ctx.textAlign = "center";
		ctx.font = `14px ${theme.font || "system-ui"}`;
		ctx.fillText(
			"Original Image (Unit Circle)",
			leftCX,
			leftCY + discRadiusPx + 20,
		);

		// --- Right: Annular arc guide (outer arc + inner blank circle + two radii) ---
		const Δ = (arcDeg * Math.PI) / 180;
		const thetaStart = -Δ / 2;
		const thetaEnd = +Δ / 2;

		const tau = 0.35; // fixed inner/outer ratio (kept constant to honour “two inputs only”)
		const R_out_px = Rf * scale;
		const R_in_px = Math.max(1, tau * R_out_px);

		// Draw the annulus edges
		ctx.save();
		ctx.translate(rightCX, rightCY);
		ctx.strokeStyle = theme.line;
		ctx.lineWidth = 1;

		// Outer boundary
		ctx.beginPath();
		ctx.moveTo(
			R_out_px * Math.cos(thetaStart),
			R_out_px * Math.sin(thetaStart),
		);
		ctx.arc(0, 0, R_out_px, thetaStart, thetaEnd);
		ctx.stroke();

		// Inner boundary (blank hole)
		ctx.beginPath();
		ctx.moveTo(
			R_in_px * Math.cos(thetaStart),
			R_in_px * Math.sin(thetaStart),
		);
		ctx.arc(0, 0, R_in_px, thetaStart, thetaEnd);
		ctx.stroke();

		// Two radii (start/end)
		ctx.beginPath();
		ctx.moveTo(
			R_in_px * Math.cos(thetaStart),
			R_in_px * Math.sin(thetaStart),
		);
		ctx.lineTo(
			R_out_px * Math.cos(thetaStart),
			R_out_px * Math.sin(thetaStart),
		);
		ctx.moveTo(R_in_px * Math.cos(thetaEnd), R_in_px * Math.sin(thetaEnd));
		ctx.lineTo(
			R_out_px * Math.cos(thetaEnd),
			R_out_px * Math.sin(thetaEnd),
		);
		ctx.stroke();

		// Draw the small “star” at the sector centre (the base of the object)
		ctx.fillStyle = theme.primary;
		const star = (r) => {
			ctx.beginPath();
			for (let k = 0; k < 10; k++) {
				const ang = (k * Math.PI) / 5;
				const rr = k % 2 === 0 ? r : r / 2;
				ctx.lineTo(rr * Math.cos(ang), rr * Math.sin(ang));
			}
			ctx.closePath();
			ctx.fill();
		};
		star(6);
		ctx.restore();

		// --- Pixel remap: unit disc → annular arc (ring) ---
		const step = 2; // performance knob; lower = finer sampling
		for (let j = 0; j < pixels.height; j += step) {
			for (let i = 0; i < pixels.width; i += step) {
				const idx = (j * pixels.width + i) * 4;
				const a = pixels.data[idx + 3];
				if (a < 8) continue; // near-transparent -> skip

				// Map source pixel centre to unit-disc coords (x,y) in [-1,1], y-up
				const u = (i + 0.5) / pixels.width;
				const v = (j + 0.5) / pixels.height;
				const x = 2 * u - 1;
				const y = 1 - 2 * v;

				const t = discToAnnularArcTransform({ x, y }, Rf, arcDeg);
				if (!isFinite(t.x) || !isFinite(t.y)) continue;

				// World (y-up) -> Canvas (y-down)
				const targetX = rightCX + t.x * scale;
				const targetY = rightCY - t.y * scale;

				ctx.fillStyle = `rgb(${pixels.data[idx]}, ${
					pixels.data[idx + 1]
				}, ${pixels.data[idx + 2]})`;
				ctx.fillRect(
					Math.floor(targetX),
					Math.floor(targetY),
					step,
					step,
				);
			}
		}

		ctx.fillStyle = theme.text;
		ctx.textAlign = "center";
		ctx.font = `14px ${theme.font || "system-ui"}`;
		ctx.fillText(
			"Anamorphic Image (Annular Arc)",
			rightCX,
			rightCY + Math.max(R_out_px, discRadiusPx) + 20,
		);
	}, [isImageLoaded, Rf, arcDeg, theme]);

	return (
		<TaskContainer>
			<Title>Task 10: Anamorphic Image Transformation</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Transformation Controls
					</h3>

					<Slider
						label="Arc Radius Rf"
						min={1.0}
						max={6.0}
						step={0.1}
						value={Rf}
						onChange={(e) => setRf(parseFloat(e.target.value))}
					/>

					<Slider
						label="Arc Span (degrees)"
						min={30}
						max={360}
						step={1}
						value={arcDeg}
						onChange={(e) => setArcDeg(parseFloat(e.target.value))}
						unit="°"
					/>
				</ControlAndVizContainer>

				<ControlAndVizContainer>
					<Canvas ref={canvasRef} />
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>Analysis: Anamorphic Image</SummaryTitle>
				<p>
					The entire unit-disc image is re-expressed in polar form (ρ,
					φ) and stretched into the annulus sector between a small
					inner blank circle and the outer arc of radius R<sub>f</sub>
					. Setting Δ = 360° produces a complete ring with a central
					hole; placing a polished cylinder over the original disc
					reconstructs the image with a three-dimensional appearance.
				</p>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task10;
