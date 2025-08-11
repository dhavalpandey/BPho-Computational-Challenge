// src/pages/Task10.js
import React, { useState, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { motion } from "framer-motion";
import Slider from "../components/Slider";
import { anamorphicTransform } from "../utils/physics";

// --- Styled Components ---
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

const Canvas = styled.canvas`
	width: 100%;
	height: 100%;
	border-radius: 8px;
`;

// --- Task 10 Component ---
const Task10 = () => {
	const theme = useTheme();
	const canvasRef = useRef(null);
	const imgDataRef = useRef(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	const [radiusFactor, setRadiusFactor] = useState(3.0);
	const [arcDegrees, setArcDegrees] = useState(160);

	// Load image data once
	useEffect(() => {
		const image = new Image();
		image.src = "/sybil_cat.png";
		image.onload = () => {
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = image.width;
			tempCanvas.height = image.height;
			const tempCtx = tempCanvas.getContext("2d");
			tempCtx.drawImage(image, 0, 0);
			imgDataRef.current = {
				image: image,
				pixels: tempCtx.getImageData(0, 0, image.width, image.height),
			};
			setIsImageLoaded(true);
		};
	}, []);

	// Main drawing effect
	useEffect(() => {
		if (!isImageLoaded || !canvasRef.current) return;

		const { image, pixels } = imgDataRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const { width, height } = canvas.getBoundingClientRect();

		if (width === 0 || height === 0) return;

		canvas.width = width;
		canvas.height = height;

		ctx.clearRect(0, 0, width, height);

		// --- Left side: Draw Original Image in a Circle ---
		const leftOriginX = width / 4;
		const leftOriginY = height / 2;
		const circleRadius = Math.min(width / 4, height / 2) * 0.8;

		ctx.save();
		ctx.beginPath();
		ctx.arc(leftOriginX, leftOriginY, circleRadius, 0, 2 * Math.PI);
		ctx.strokeStyle = theme.line;
		ctx.stroke();
		ctx.clip();
		ctx.drawImage(
			image,
			leftOriginX - circleRadius,
			leftOriginY - circleRadius,
			circleRadius * 2,
			circleRadius * 2,
		);
		ctx.restore();
		ctx.fillStyle = theme.text;
		ctx.textAlign = "center";
		ctx.font = "14px " + theme.font;
		ctx.fillText(
			"Original Image (Unit Circle)",
			leftOriginX,
			leftOriginY + circleRadius + 20,
		);

		// --- Right side: Draw Anamorphic Image ---
		const rightOriginX = width * 0.65;
		const rightOriginY = height * 0.8;
		const pixelSkip = 2;

		for (let j = 0; j < pixels.height; j += pixelSkip) {
			for (let i = 0; i < pixels.width; i += pixelSkip) {
				const sourceIndex = (j * pixels.width + i) * 4;
				if (pixels.data[sourceIndex + 3] < 255) continue;

				const pX = (i / pixels.width) * 2 - 1;
				const pY = (1 - j / pixels.height) * 2 - 1;

				const transformed = anamorphicTransform(
					{ x: pX, y: pY },
					radiusFactor,
					arcDegrees,
				);
				if (isNaN(transformed.x) || isNaN(transformed.y)) continue;

				const targetX =
					rightOriginX +
					transformed.x * (circleRadius / radiusFactor);
				const targetY =
					rightOriginY -
					transformed.y * (circleRadius / radiusFactor);

				ctx.fillStyle = `rgb(${pixels.data[sourceIndex]}, ${
					pixels.data[sourceIndex + 1]
				}, ${pixels.data[sourceIndex + 2]})`;
				ctx.fillRect(
					Math.floor(targetX),
					Math.floor(targetY),
					pixelSkip,
					pixelSkip,
				);
			}
		}
		ctx.fillText("Anamorphic Image", rightOriginX, rightOriginY + 20);
	}, [isImageLoaded, radiusFactor, arcDegrees, theme]);

	return (
		<TaskContainer>
			<Title>Task 10: Anamorphic Image Transformation</Title>

			<TwoColumnLayout>
				<ControlAndVizContainer>
					<h3 style={{ marginBottom: "1rem" }}>
						Transformation Controls
					</h3>
					<Slider
						label="Radius Factor (Rf)"
						min={1.0}
						max={5.0}
						step={0.1}
						value={radiusFactor}
						onChange={(e) =>
							setRadiusFactor(parseFloat(e.target.value))
						}
					/>
					<Slider
						label="Arc Degrees"
						min={90}
						max={270}
						step={1}
						value={arcDegrees}
						onChange={(e) =>
							setArcDegrees(parseFloat(e.target.value))
						}
						unit="°"
					/>
				</ControlAndVizContainer>

				<ControlAndVizContainer>
					<Canvas ref={canvasRef} />
				</ControlAndVizContainer>
			</TwoColumnLayout>

			<SummaryContainer>
				<SummaryTitle>Analysis: Anamorphic Projection</SummaryTitle>
				<p>
					This simulation creates an anamorphic image by remapping
					pixels from a circular source image onto a sector of a
					circle. This is a classic technique in art and optics used
					to create distortions that appear correct only when viewed
					from a specific vantage point or, in this case, when
					reflected in a cylindrical mirror.
				</p>
				<p>The process involves these steps:</p>
				<ol>
					<li>
						Pixels from the original image are treated as points
						within a "unit circle" (a circle with radius 1).
					</li>
					<li>
						Each point's Cartesian coordinates (x, y) are converted
						to polar coordinates (radius, angle).
					</li>
					<li>
						These polar coordinates are then mapped to a new
						coordinate system: the new angle is determined by the
						original 'x' position, and the new radius is determined
						by the original 'y' position.
					</li>
					<li>
						Finally, the new polar coordinates are converted back to
						Cartesian coordinates to be drawn on the screen,
						resulting in the arced, distorted image.
					</li>
				</ol>
			</SummaryContainer>
		</TaskContainer>
	);
};

export default Task10;
