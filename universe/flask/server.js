import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize ChromaDB client with explicit configuration
const client = new ChromaClient({ path: "http://localhost:8000" }); // Ensure ChromaDB server is running
let collection;

// Enhanced initialization function with retry logic
async function initializeCollection() {
    let retries = 3;
    const retryDelay = 5000; // Retry every 5 seconds

    while (retries > 0) {
        try {
            const embedder = new OpenAIEmbeddingFunction({
                openai_api_key: process.env.OPENAI_API_KEY,
            });

            collection = await client.getOrCreateCollection({
                name: "search_results",
                embeddingFunction: embedder,
            });

            console.log("ChromaDB collection initialized successfully");
            return;
        } catch (error) {
            retries--;
            console.error(`ChromaDB connection failed. Retrying... (${retries} attempts remaining)`);
            if (retries === 0) throw new Error("Failed to connect to ChromaDB. Ensure the server is running on port 8000.");
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
}

// Helper: Add documents to ChromaDB
const addToChroma = async (documents) => {
    try {
        const ids = documents.map((_, index) => `doc_${Date.now()}_${index}`);
        const documentsText = documents.map((doc) => `${doc.title} ${doc.summary}`);
        const metadatas = documents.map((doc) => ({
            title: doc.title,
            summary: doc.summary,
            url: doc.link,
        }));

        await collection.add({ ids, documents: documentsText, metadatas });
        console.log("Documents added to ChromaDB");
    } catch (error) {
        console.error("Error adding documents to ChromaDB:", error.message);
        throw error;
    }
};

// Helper: Query ChromaDB
const queryChroma = async (query) => {
    try {
        const results = await collection.query({
            queryTexts: [query],
            nResults: 10,
        });

        return results.metadatas[0].map((metadata) => ({
            title: metadata.title,
            summary: metadata.summary,
            url: metadata.url,
        }));
    } catch (error) {
        console.error("Error querying ChromaDB:", error.message);
        throw error;
    }
};

// Helper: Fetch Data from arXiv
const fetchArxiv = async (query) => {
    try {
        const response = await axios.get("http://export.arxiv.org/api/query", {
            params: { search_query: query, max_results: 5 },
        });
        return parseArxivResults(response.data);
    } catch (error) {
        console.error("arXiv API error:", error.message);
        return [];
    }
};

const parseArxivResults = (data) => {
    const regex = /<entry>(.*?)<\/entry>/gs;
    const matches = data.match(regex) || [];
    return matches.map((entry) => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1]?.trim() || "No Title";
        const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1]?.trim() || "No Summary";
        const link = entry.match(/<link href="(.*?)"/)?.[1] || "#";
        return { title, summary, link };
    });
};

// Helper: Fetch Data from GitHub
const fetchGitHub = async (query) => {
    try {
        const response = await axios.get("https://api.github.com/search/repositories", {
            headers: { Authorization: `token ${process.env.GITHUB_API_KEY}` },
            params: { q: query, sort: "stars", order: "desc", per_page: 5 },
        });
        return response.data.items.map((repo) => ({
            title: repo.name,
            summary: repo.description,
            link: repo.html_url,
        }));
    } catch (error) {
        console.error("GitHub API error:", error.message);
        return [];
    }
};

// Helper: Fetch Data from Stack Overflow
const fetchStackOverflow = async (query) => {
    try {
        const response = await axios.get("https://api.stackexchange.com/2.3/search", {
            params: {
                order: "desc",
                sort: "relevance",
                intitle: query,
                site: "stackoverflow",
                pagesize: 5,
            },
        });
        return response.data.items.map((item) => ({
            title: item.title,
            summary: "No summary available.",
            link: item.link,
        }));
    } catch (error) {
        console.error("Stack Overflow API error:", error.message);
        return [];
    }
};

// Endpoint: Handle Search
app.post("/search", async (req, res) => {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: "Query cannot be empty." });
    }

    try {
        const arxivData = await fetchArxiv(query);
        const githubData = await fetchGitHub(query);
        const stackOverflowData = await fetchStackOverflow(query);

        const allDocuments = [...arxivData, ...githubData, ...stackOverflowData];
        await addToChroma(allDocuments);

        const results = await queryChroma(query);
        res.json({ query, results });
    } catch (error) {
        console.error("Error during /search:", error.message);
        res.status(500).json({ error: "Error retrieving search results." });
    }
});

// Start server with ChromaDB initialization
const PORT = 5000;
(async () => {
    try {
        await initializeCollection();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
})();
