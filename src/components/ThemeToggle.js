// src/components/ThemeToggle.js (Corrected)
import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion"; // <-- FIX: Added AnimatePresence

const ToggleContainer = styled.button`
	background: ${({ theme }) => theme.accent};
	border: 1px solid ${({ theme }) => theme.line};
	border-radius: 30px;
	cursor: pointer;
	display: flex;
	align-items: center;
	font-size: 0.5rem;
	justify-content: space-between;
	margin: 0 auto;
	overflow: hidden;
	padding: 0.5rem;
	position: fixed;
	width: 4rem;
	height: 2.2rem;
	top: 1rem;
	right: 2rem;
	z-index: 1001;

	svg {
		height: auto;
		width: 1.2rem;
		transition: all 0.3s linear;
	}
`;

const Icon = ({ icon }) => {
	return icon === "moon" ? (
		<motion.svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ color: "#f1c40f" }}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</motion.svg>
	) : (
		<motion.svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ color: "#f39c12" }}>
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</motion.svg>
	);
};

const ThemeToggle = ({ theme, toggleTheme }) => {
	const isLight = theme === "light";
	return (
		<ToggleContainer onClick={toggleTheme}>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={isLight ? "sun" : "moon"}
					initial={{ y: -30, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 30, opacity: 0 }}
					transition={{ duration: 0.2 }}>
					<Icon icon={isLight ? "sun" : "moon"} />
				</motion.div>
			</AnimatePresence>
		</ToggleContainer>
	);
};

export default ThemeToggle;
