// src/App.js
import React, { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

import { GlobalStyles, theme as appTheme } from "./GlobalStyles";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle"; // We'll create this next

// Lazy load pages for better performance
const Task1 = lazy(() => import("./pages/Task1"));
const Task2 = lazy(() => import("./pages/Task2")); // <-- ADD THIS LINE
const Task3 = lazy(() => import("./pages/Task3")); // <-- ADD THIS LINE
const Task4 = lazy(() => import("./pages/Task4")); // <-- ADD THIS LINE
const Task5 = lazy(() => import("./pages/Task5")); // <-- ADD THIS LINE
const Task6 = lazy(() => import("./pages/Task6")); // <-- ADD THIS LINE
const Task7 = lazy(() => import("./pages/Task7")); // <-- ADD THIS LINE
const Task8 = lazy(() => import("./pages/Task8")); // <-- ADD THIS LINE
const Task9 = lazy(() => import("./pages/Task9")); // <-- ADD THIS LINE

const AppContainer = styled.div`
	width: 100vw;
	min-height: 100vh;
	overflow-x: hidden;
`;

const PageContainer = styled.div`
	max-width: 1400px;
	margin: 2rem auto;
	padding: 0 2rem;
`;

const LoadingSpinner = styled(motion.div)`
	width: 50px;
	height: 50px;
	border: 5px solid ${(props) => props.theme.line};
	border-top: 5px solid ${(props) => props.theme.primary};
	border-radius: 50%;
	margin: 10rem auto;
`;

function App() {
	const [theme, setTheme] = useState("dark");
	const location = useLocation();

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<ThemeProvider theme={appTheme[theme]}>
			<GlobalStyles />
			<AppContainer>
				<Navbar />
				<ThemeToggle theme={theme} toggleTheme={toggleTheme} />
				<PageContainer>
					<AnimatePresence mode="wait">
						<Suspense
							fallback={
								<LoadingSpinner
									animate={{ rotate: 360 }}
									transition={{
										duration: 1,
										repeat: Infinity,
										ease: "linear",
									}}
								/>
							}>
							<Routes location={location} key={location.pathname}>
								<Route
									path="/"
									element={<Navigate to="/task1" />}
								/>
								<Route
									path="/task1"
									element={
										<TaskWrapper>
											<Task1 />
										</TaskWrapper>
									}
								/>
								<Route
									path="/task2"
									element={
										<TaskWrapper>
											<Task2 />
										</TaskWrapper>
									}
								/>
								<Route
									path="/task3"
									element={
										<TaskWrapper>
											<Task3 />
										</TaskWrapper>
									}
								/>
								<Route
									path="/task4"
									element={
										<TaskWrapper>
											<Task4 />
										</TaskWrapper>
									}
								/>{" "}
								<Route
									path="/task5"
									element={
										<TaskWrapper>
											<Task5 />
										</TaskWrapper>
									}
								/>{" "}
								<Route
									path="/task6"
									element={
										<TaskWrapper>
											<Task6 />
										</TaskWrapper>
									}
								/>{" "}
								{/* <-- ADD THIS LINE */}
								<Route
									path="/task7"
									element={
										<TaskWrapper>
											<Task7 />
										</TaskWrapper>
									}
								/>{" "}
								<Route
									path="/task8"
									element={
										<TaskWrapper>
											<Task8 />
										</TaskWrapper>
									}
								/>{" "}
								<Route
									path="/task9"
									element={
										<TaskWrapper>
											<Task9 />
										</TaskWrapper>
									}
								/>{" "}
								{/* <-- ADD THIS LINE */}
							</Routes>
						</Suspense>
					</AnimatePresence>
				</PageContainer>
			</AppContainer>
		</ThemeProvider>
	);
}

// Wrapper for cinematic page transitions
const pageVariants = {
	initial: { opacity: 0, scale: 0.98, y: 20 },
	in: { opacity: 1, scale: 1, y: 0 },
	out: { opacity: 0, scale: 0.98, y: -20 },
};

const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

const TaskWrapper = ({ children }) => (
	<motion.div
		initial="initial"
		animate="in"
		exit="out"
		variants={pageVariants}
		transition={pageTransition}>
		{children}
	</motion.div>
);

export default App;
