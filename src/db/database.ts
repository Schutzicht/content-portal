import "dotenv/config";

// Helper to get env variables lazily to ensure dotenv has loaded
const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env[key]) return process.env[key];
    if ((import.meta as any).env && (import.meta as any).env[key]) return (import.meta as any).env[key];
    return undefined;
};

// Custom Turso client using native fetch to bypass @libsql/client bugs
const db = {
    async execute(sql: string, params: any[] = []) {
        const currentUrl = getEnv('TURSO_DATABASE_URL');
        const currentToken = getEnv('TURSO_AUTH_TOKEN');
        
        if (!currentUrl) throw new Error("TURSO_DATABASE_URL is not set. Please check your .env file.");

        // Convert the URL to a proper HTTP endpoint
        const endpoint = currentUrl.replace("libsql://", "https://") + "/v1/execute";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${currentToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                stmt: {
                    sql,
                    args: params.map(p => {
                        if (typeof p === 'number') return { type: 'integer', value: String(p) };
                        if (typeof p === 'boolean') return { type: 'integer', value: p ? '1' : '0' };
                        return { type: 'text', value: String(p) };
                    })
                }
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Turso Error: ${response.status} ${error}`);
        }

        const data = await response.json();
        // console.log("TURSO DATA:", JSON.stringify(data, null, 2));
        
        if (!data.result) {
            console.error("TURSO ERROR: No result in response", data);
            throw new Error(`Turso Error: No result in response. ${JSON.stringify(data.error || data)}`);
        }

        const { cols, rows } = data.result;
        if (!cols || !rows) {
            return { rows: [], columns: [] };
        }

        const columnNames = cols.map((c: any) => c.name);
        const normalizedRows = rows.map((row: any[]) => {
            const obj: any = {};
            columnNames.forEach((colName: string, idx: number) => {
                const cell = row[idx];
                obj[colName] = cell ? cell.value : null;
                
                // Handle type conversions
                if (cell && cell.type === 'integer' && cell.value !== null) {
                    obj[colName] = parseInt(cell.value, 10);
                }
            });
            return obj;
        });

        return {
            rows: normalizedRows,
            columns: columnNames,
        };
    }
};

export default db;
