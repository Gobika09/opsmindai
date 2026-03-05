import { pipeline } from "@xenova/transformers";

let extractor;

export const generateEmbedding = async (text) => {
  try {
    if (!extractor) {
      console.log("Loading local embedding model...");
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);

    console.log("Embedding dimension:", embedding.length);

    return embedding;

  } catch (error) {
    console.error("Local Embedding Error:", error);
    throw error;
  }
};