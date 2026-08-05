## Request

fetch("https://vibes.ai/api/projects/7c3c6169-1282-448f-809a-6f692ae47037?deleteAssets=true", {
"headers": {
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=204fc66cd40d49c2bdfaa17cf758c909,sentry-org_id=4509963614355457,sentry-sampled=false,sentry-sample_rand=0.9589112266146211,sentry-sample_rate=0.1",
"content-type": "application/json",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sentry-trace": "204fc66cd40d49c2bdfaa17cf758c909-865d706ef683d282-0",
"Referer": "https://vibes.ai/"
},
"body": null,
"method": "DELETE"
});

## Responce

{"success":true,"message":"Project deleted successfully","deletedOrphanCount":9}
