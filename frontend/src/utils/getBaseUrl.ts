export const getBaseUrl = () => {
	// 1. Explicit environment variable
	if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

	// 2. Legacy environment variable
	if (process.env.NEXT_PUBLIC_USERS_LIST_URL) return process.env.NEXT_PUBLIC_USERS_LIST_URL;

	// 3. Fallback based on environment or hostname
	const isProduction = 
		process.env.NODE_ENV === "production" || 
		(typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1"));

	if (isProduction) {
		return "https://skillswap-platform-ovuw.onrender.com";
	}

	return "http://localhost:4000";
};