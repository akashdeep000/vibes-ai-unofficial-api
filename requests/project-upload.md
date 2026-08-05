## Request

POST /api/projects/:projectId/upload — attaches uploaded media to a project. This is the second
half of the upload flow: first POST /api/upload-media returns the media reference, then this call
makes it a project content item (its returned id is the start-frame sourceContentItemId for t2v).

fetch("https://vibes.ai/api/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b/upload", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"cookie": "cookie_ack=true; meta_session=YOUR_COOKIE",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b"
},
"body": "{\"files\":[{\"mediaEntId\":\"1166551463218039\",\"uploadToken\":\"1202d9ec-6fab-4152-9912-6ca8cbbaa910|1166551463218039|1785878412|95f09cb4126b41dd9b774870fa39952f6af2637b5369bfaf969746d9b86d60ab\",\"cdnUrl\":\"https://scontent-sin11-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQMcvmuCiMXzwNw9ro1W_cfTYiTTPn42Sz5RI7oU8TfLzvcY6hAiHFgMdrSDAWpBBTbnOka-gu96uwB_pqzdqYm1Ejun?_nc_cat=105&_nc_sid=5b3566&_nc_ht=scontent-sin11-1.xx.fbcdn.net&_nc_ohc=fDWGRwnScNMQ7kNvwHqoDJP&ccb=17-1&_nc_gid=aLGWzKK3OGko6GEuopSUQg&_nc_ss=70289&_nc_zt=14&oh=00_AQGqNAvl1nACQ95HKK1IocQKdxGS6wDxpSP39FF4Vnmcrw&oe=6A99DF83\",\"filename\":\"Gemini_Generated_Image_bgt6ytbgt6ytbgt6.png\",\"dimensions\":{\"width\":711,\"height\":1264},\"aspectRatio\":\"9:16\"}]}",
"method": "POST"
});

## Responce

{
"success": true,
"contentItems": [
{
"id": "EaEjRyW2PwZXhK0ythgek",
"type": "images",
"imageUrl": "https://scontent-sin6-2.xx.fbcdn.net/o1/v/t6/f2/m421/AQOg5TOdccxlPEnY0we6PJHyZMsYdBdo9-nquJ6ru3EF5eSm-FvZRBm7b668eP9KKbt4WkPAR87uUfY3DKDInQCDxrCi?_nc_cat=109&_nc_sid=5b3566&_nc_ht=scontent-sin6-2.xx.fbcdn.net&_nc_ohc=-Gtb0wb01lQQ7kNvwHuW_rr&ccb=17-1&_nc_gid=26THOIQHlI_p6yyKfXrZXg&_nc_zt=14&_nc_ss=70289&oh=00_AQFwDMSyvHkAH0Hja5B9sy4URCsPfVTJ3bLc2nhWltfUJg&oe=6A99BEEB",
"videoUrl": null
}
],
"count": 1
}
