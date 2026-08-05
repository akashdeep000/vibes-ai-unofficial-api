## Request

fetch("https://vibes.ai/api/auth/check-token", {
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
"sentry-trace": "a32cf806961822cf1bc8e45d53a7b1bc-b9dad2ea76f475cb-0",
"cookie": "cookie_ack=true; meta_session=YOUR_COOKIE",
"Referer": "https://vibes.ai/"
},
"body": null,
"method": "GET"
});

## Responce

{
"user": {
"id": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"username": "akashdeep.das.9843",
"accountStatus": "ACTIVE",
"roles": [],
"createdAt": "2026-08-04T17:36:19.000Z",
"updatedAt": "2026-08-04T17:36:19.000Z",
"abraUserId": "1166298453243340",
"sessionId": "3c4878b0-9862-4315-877b-d8b3779b1f23",
"kadabraProfile": {
"id": "c5033878-52e8-4a8d-9362-4d796adac5d9",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"kadabraUserId": "1166298453243340",
"incognitoAccess": "NONE",
"kadabraProfileId": "1166298489910003",
"kadabraProfileUsername": "akashdeep.das.9843",
"kadabraProfilePictureURL": "https://scontent-sin11-2.xx.fbcdn.net/v/t39.30808-6/765769763_1166298599909992_3340599750060672882_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=b94e50&_nc_ohc=By86LVFObZIQ7kNvwGyEtMX&_nc_oc=AdpTh4q53VuwFZXq4ehGGp83kS1M6W7VZy3IqwpIzH_hdB42zLfD9hrr_IqdwgJQoIk&_nc_zt=23&_nc_ht=scontent-sin11-2.xx&_nc_gid=tlnjQSNpHZkALgd88d2c0A&_nc_ss=702a8&oh=00_AQFJF_cy8aMm1Bf0nwddLydl_nMVsmwaWENvRhbbvwEzDA&oe=6A77DCD5",
"createdAt": "2026-08-04T17:36:20.000Z",
"updatedAt": "2026-08-04T17:36:22.000Z",
"syncedAt": "2026-08-04T17:36:22.000Z",
"dataSyncedAt": "2026-08-04T17:36:20.000Z"
}
}
}
