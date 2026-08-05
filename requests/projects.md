# List

## Request

fetch("https://vibes.ai/api/projects?limit=25&offset=0&sort=newest", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=a32cf806961822cf1bc8e45d53a7b1bc,sentry-org_id=4509963614355457,sentry-transaction=GET%20%2F,sentry-sampled=true,sentry-sample_rand=0.7693025936271904,sentry-sample_rate=0.1",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "a32cf806961822cf1bc8e45d53a7b1bc-9da9e6fa8a9950c4-0",
"cookie": "cookie_ack=true; meta_session=YOUR_COOKIE",
"Referer": "https://vibes.ai/"
},
"body": null,
"method": "GET"
});

## Responce

{
"success": true,
"projects": [
{
"id": "7c3c6169-1282-448f-809a-6f692ae47037",
"name": "Untitled",
"thumbnailUrl": "https://scontent-sin11-2.xx.fbcdn.net/v/t15.5256-10/765573062_1015226001278506_6503717142741244407_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=db3e61&_nc_ohc=Q1o4XDXFcQYQ7kNvwFBenC9&_nc_oc=Adr9k0AFFZuFu4YKbOkouR_eE34VO9pvMHi28OLwZ2SNwEUvjeeXD0XAWsO5H0TkztE&_nc_zt=23&_nc_ht=scontent-sin11-2.xx&_nc_gid=esKDGz_mkcoLcyWeHCicmw&_nc_ss=702a8&oh=00_AQHxlrgcck0-CuRdngSZo0-NFdYYrKPJJNF99PHZfbsIrw&oe=6A77F49F",
"exportStatus": "draft",
"createdAt": "2026-08-04T17:37:19.000Z",
"updatedAt": "2026-08-04T17:37:19.000Z",
"isShared": false
}
],
"page": {
"count": 1,
"hasMore": false,
"nextOffset": null
}
}

# Create

## Request

fetch("https://vibes.ai/api/projects", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=a32cf806961822cf1bc8e45d53a7b1bc,sentry-org_id=4509963614355457,sentry-transaction=GET%20%2F,sentry-sampled=true,sentry-sample_rand=0.7693025936271904,sentry-sample_rate=0.1",
"content-type": "application/json",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "a32cf806961822cf1bc8e45d53a7b1bc-a42636a1494b8f35-0"
},
"referrer": "https://vibes.ai/",
"body": "{\"name\":\"Untitled\"}",
"method": "POST",
"mode": "cors",
"credentials": "include"
});

## Responce

{
"success": true,
"project": {
"id": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"name": "Untitled",
"composition": {
"id": "studio-composition",
"tracks": [],
"duration": 5
},
"exportStatus": "draft",
"createdAt": "2026-08-04T18:25:36.025Z",
"updatedAt": "2026-08-04T18:25:36.025Z"
}
}
