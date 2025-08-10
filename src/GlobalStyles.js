import { createGlobalStyle } from "styled-components";

export const theme = {
	light: {
		body: "#f0f2f5",
		text: "#1c1e21",
		primary: "#007AFF",
		accent: "rgba(255, 255, 255, 0.8)",
		line: "#dce1e6",
		shadow: "rgba(0, 0, 0, 0.1)",
	},
	dark: {
		body: "#121212",
		text: "#e4e6eb",
		primary: "#0A84FF",
		accent: "#1e1e1e",
		line: "#3a3b3c",
		shadow: "rgba(0, 0, 0, 0.4)",
	},
	font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: ${({ theme }) => theme.font};
    transition: all 0.25s linear;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.body};
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.line};
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.primary};
  }
`;
