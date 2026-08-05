## Request

fetch("https://vibes.ai/api/generation-batches", {
"headers": {
"accept": "_/_",
"content-type": "application/json",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/6b264691-a98e-4372-8f59-46a7428a24db"
},
"body": "{\"id\":\"batch-019fcf25-543d-72eb-b753-3f5c21f98d45\",\"type\":\"videos\",\"prompt\":\"test text prompt only\",\"timestamp\":\"2026-08-04T23:39:17.950Z\",\"content\":[{\"id\":\"batch-019fcf25-543d-72eb-b753-3f5c21f98d45-content-0\",\"type\":\"videos\",\"isLoading\":true},{\"id\":\"batch-019fcf25-543d-72eb-b753-3f5c21f98d45-content-1\",\"type\":\"videos\",\"isLoading\":true},{\"id\":\"batch-019fcf25-543d-72eb-b753-3f5c21f98d45-content-2\",\"type\":\"videos\",\"isLoading\":true},{\"id\":\"batch-019fcf25-543d-72eb-b753-3f5c21f98d45-content-3\",\"type\":\"videos\",\"isLoading\":true}],\"isComplete\":false,\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"480p\",\"batchVariation\":true},\"promptModel\":\"gemini-2.5-flash\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"generationStartTime\":\"2026-08-04T23:39:17.950Z\",\"isDirectGeneration\":true,\"projectId\":\"6b264691-a98e-4372-8f59-46a7428a24db\"}",
"method": "POST"
});

## Responce

{"batch":null,"id":"batch-019fcf25-543d-72eb-b753-3f5c21f98d45"}
