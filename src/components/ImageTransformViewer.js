// src/components/ImageTransformViewer.js
import React, { useState, useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components"; // FIX: Import useTheme

const ViewerContainer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
	background: ${({ theme }) => theme.accent};
	border-radius: 12px;
`;

const Canvas = styled.canvas`
	width: 100%;
	height: 100%;
	display: block;
`;

const ImageTransformViewer = ({
	objectPosition,
	objectSize,
	transformation,
	mirror,
}) => {
	const canvasRef = useRef(null);
	const [img, setImg] = useState(null);
	const theme = useTheme(); // FIX: Get theme context

	// Load the image once on component mount
	useEffect(() => {
		const image = new Image();
		image.src = "/sybil_cat.png"; // Path relative to the public folder
		image.onload = () => setImg(image);
	}, []);

	useEffect(() => {
		if (!canvasRef.current || !img) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Optimization for frequent getImageData
		const { width, height } = canvas.getBoundingClientRect();

		// Check for zero dimensions
		if (width === 0 || height === 0) return;

		canvas.width = width;
		canvas.height = height;

		const scale = Math.min(width, height) / 4;
		const originX = width / 2;
		const originY = height / 2;

		ctx.clearRect(0, 0, width, height);

		// --- Draw Axes ---
		ctx.strokeStyle = theme.line;
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(0, originY);
		ctx.lineTo(width, originY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(originX, 0);
		ctx.lineTo(originX, height);
		ctx.stroke();
		ctx.setLineDash([]);

		// --- Draw Mirror/Lens ---
		if (mirror && mirror.draw) {
			mirror.draw(ctx, scale, originX, originY);
		}

		const { x: objX, y: objY } = objectPosition;
		const { w: objW, h: objH } = objectSize;

		// --- Draw Virtual Image (Transformed) ---
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = img.width;
		tempCanvas.height = img.height;
		const tempCtx = tempCanvas.getContext("2d");
		tempCtx.drawImage(img, 0, 0);
		const originalImageData = tempCtx.getImageData(
			0,
			0,
			img.width,
			img.height,
		);

		ctx.globalAlpha = 0.65; // Make virtual image transparent

		// Pixel-by-pixel transformation (optimized)
		const pixelSkip = 4; // Process every 4th pixel for performance
		for (let j = 0; j < img.height; j += pixelSkip) {
			for (let i = 0; i < img.width; i += pixelSkip) {
				const index = (j * img.width + i) * 4;
				const r = originalImageData.data[index];
				const g = originalImageData.data[index + 1];
				const b = originalImageData.data[index + 2];
				const a = originalImageData.data[index + 3];

				if (a === 0) continue; // Skip transparent pixels

				const pX = objX + (i / img.width - 0.5) * objW;
				const pY = objY - (j / img.height - 0.5) * objH;

				const transformedPoint = transformation({ x: pX, y: pY });

				if (isNaN(transformedPoint.x) || isNaN(transformedPoint.y))
					continue;

				const canvasX = originX + transformedPoint.x * scale;
				const canvasY = originY - transformedPoint.y * scale;

				ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
				ctx.fillRect(
					Math.floor(canvasX),
					Math.floor(canvasY),
					pixelSkip,
					pixelSkip,
				);
			}
		}

		ctx.globalAlpha = 1.0;

		// --- Draw Real Object ---
		const canvasObjX = originX + (objX - objW / 2) * scale;
		const canvasObjY = originY - (objY + objH / 2) * scale;
		const canvasObjW = objW * scale;
		const canvasObjH = objH * scale;
		ctx.drawImage(img, canvasObjX, canvasObjY, canvasObjW, canvasObjH);
	}, [img, objectPosition, objectSize, transformation, mirror, theme]); // Rerun when theme changes

	return (
		<ViewerContainer>
			<Canvas ref={canvasRef} />
		</ViewerContainer>
	);
};

export default ImageTransformViewer; // FIX: Added the default export
