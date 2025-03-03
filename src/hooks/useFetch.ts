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
		try {
			setLoading(true);
			const response = await fetch(`https://broke-end.vercel.app/${endpoint}`);
			if (!response.ok) throw new Error(`Error ${response.status}`);
			const result = options.expectJson ? await response.json() : await response.text();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error(String(err)));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (endpoint) {
			fetchData();
			if (options.autoRefetch && options.refetchInterval) {
				const interval = setInterval(fetchData, options.refetchInterval);
				return () => clearInterval(interval);
			}
		}
	}, [endpoint]);

	return { data, loading, error, refetch: fetchData };
}

export async function fetchPost(endpoint: string, body: any) {
	const response = await fetch(`https://broke-end.vercel.app/${endpoint}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		throw new Error(`Error ${response.status}`);
	}
	return await response.json();
}
