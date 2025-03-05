import { useState, useEffect } from "react";

interface UseFetchOptions {
	autoRefetch?: boolean;
	refetchInterval?: number;
	expectJson?: boolean;
}

export function useFetch<T>(endpoint: string, options: UseFetchOptions = {}) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchData = async () => {
		if (!endpoint || endpoint.trim() === "") {
			setLoading(false);
			return;
		}
		
		try {
			setLoading(true);
			const url = `https://cb-web.dev/${endpoint}`;
			console.log(`[GET] Fetching from: ${url}`);
			
			const response = await fetch(url);
			
			if (!response.ok) throw new Error(`Error ${response.status}`);
			const result = options.expectJson ? await response.json() : await response.text();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error(String(err)));
			console.error(`[GET] Error fetching ${endpoint}:`, err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (endpoint && endpoint.trim().length > 0) {
			console.log(`[GET] Initiating fetch for: ${endpoint}`);
			fetchData();
			if (options.autoRefetch && options.refetchInterval) {
				const interval = setInterval(fetchData, options.refetchInterval);
				return () => clearInterval(interval);
			}
		} else {
			// Setze Ladezustand auf false, wenn kein Endpoint vorhanden ist
			setLoading(false);
		}
	}, [endpoint]);

	return { data, loading, error, refetch: fetchData };
}

export async function fetchPost(endpoint: string, body: any) {
	const url = `https://cb-web.dev/${endpoint}`;
	console.log(`[POST] Sending to: ${url}`);
	console.log(`[POST] Request body:`, JSON.stringify(body, null, 2));
	
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		console.error(`[POST] Error response (${response.status}):`, errorText);
		throw new Error(`Error ${response.status}: ${errorText}`);
	}
	
	const responseData = await response.json();
	console.log(`[POST] Response:`, JSON.stringify(responseData, null, 2));
	return responseData;
}
