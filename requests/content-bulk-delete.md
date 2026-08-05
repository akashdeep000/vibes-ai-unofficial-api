## Request

fetch("https://vibes.ai/api/content-items/bulk-delete", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=831dac29595646d28c65a8e86c3d0d56,sentry-org_id=4509963614355457,sentry-transaction=%2Fprojects%2F%3AprojectId,sentry-sampled=false,sentry-sample_rand=0.3795802527194867,sentry-sample_rate=0.1",
"content-type": "application/json",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "831dac29595646d28c65a8e86c3d0d56-af93c2f33759a520-0",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b"
},
"body": "{\"contentItemIds\":[\"saJw7zOwlqNnzbGhfO12e\"],\"projectId\":\"7a0f777a-d069-4b4b-8aa2-7560fe351c4b\"}",
"method": "DELETE"
});

## Responce

{"deletedItems":1,"removedFromProject":1}
