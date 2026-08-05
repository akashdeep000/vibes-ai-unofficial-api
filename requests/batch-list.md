## Request

fetch("https://vibes.ai/api/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b/batches?limit=6&offset=0", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=c61c3ab83ead4a66ae4c7ad8a3748742,sentry-org_id=4509963614355457,sentry-transaction=%2Fprojects%2F%3AprojectId,sentry-sampled=false,sentry-sample_rand=0.12411063093356589,sentry-sample_rate=0.1",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "c61c3ab83ead4a66ae4c7ad8a3748742-a0ed237b13e8ab1c-0",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b"
},
"body": null,
"method": "GET"
});

## Responce Example 1 (after the image upload)

{
"batches": [
{
"id": "R3xTKL_bwZZ1om9r0O48p",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"type": "images",
"prompt": "Uploaded media",
"timestamp": "2026-08-04T18:32:24.000Z",
"isComplete": true,
"hasError": false,
"error": null,
"canRetry": true,
"config": {
"aspectRatio": "16:9"
},
"systemPrompt": null,
"promptModel": null,
"imageModel": null,
"videoModel": null,
"bulkGenId": null,
"generationStartTime": null,
"generationEndTime": null,
"creationContext": "pro",
"createdAt": "2026-08-04T18:32:24.000Z",
"updatedAt": "2026-08-04T18:32:24.000Z",
"content": [
{
"id": "70e5c5dd-a8ef-4893-98ae-6f2d15c94a3d",
"batchId": "R3xTKL_bwZZ1om9r0O48p",
"type": "images",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwEPejru&ccb=17-1&_nc_gid=FJeCGMYcC6HOJmMULouKFg&_nc_zt=14&_nc_ss=70289&oh=00_AQEIKvs0QSn8Rlji804tYVlVgh0cNA_3FtiF3WjwR8DL1A&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166369879902864",
"prompt": "Gemini_Generated_Image_auclocauclocaucl.png",
"imagePrompt": null,
"videoPrompt": null,
"isFavorited": false,
"isLoading": false,
"error": null,
"createdAt": "2026-08-04T18:32:24.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 1280,
"height": 720
},
"aspectRatio": "16:9"
}
},
"orderIndex": 0,
"srefValues": null,
"data": null,
"canRetry": true,
"updatedAt": "2026-08-04T18:32:24.000Z",
"hasUploadedAncestor": true,
"contentItemId": "saJw7zOwlqNnzbGhfO12e",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "uploaded",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:32:26.000Z"
}
],
"needsPolling": false
}
],
"nextOffset": null
}

## Responce Example 2 (after submit a batch)

{
"batches": [
{
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"type": "videos",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"timestamp": "2026-08-04T18:49:12.000Z",
"isComplete": false,
"hasError": false,
"error": null,
"canRetry": true,
"config": {
"imageModel": "midjen-base",
"resolution": "720p",
"videoModel": "midjen-short",
"aspectRatio": "9:16",
"promptModel": "gemini-2.5-flash",
"batchVariation": true,
"generationType": "t2v",
"directGeneration": true,
"lastFrameImageUrl": "https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A",
"lastFrameImageEntId": "1166380623235123",
"sourceContentItemIds": [
{
"id": "saJw7zOwlqNnzbGhfO12e",
"source": "start_frame"
},
{
"id": "R-87pwHcew94UWVW5pDpk",
"source": "end_frame"
}
],
"directPromptImageHandle": {
"source": "asset",
"image_url": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A",
"image_ent_id": "1166369879902864"
}
},
"systemPrompt": null,
"promptModel": "gemini-2.5-flash",
"imageModel": "midjen-base",
"videoModel": "midjen-short",
"bulkGenId": null,
"generationStartTime": "2026-08-04T18:49:12.000Z",
"generationEndTime": "2026-08-04T18:49:13.000Z",
"creationContext": "legacy",
"createdAt": "2026-08-04T18:49:13.000Z",
"updatedAt": "2026-08-04T18:49:18.000Z",
"content": [
{
"id": "b634b213-8a06-4d50-84a2-23d6d3b3f595",
"batchId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"type": "videos",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGY3-E7&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_ss=70289&_nc_zt=14&oh=00_AQGOPLwxkerbVirCp60oi0zX0kvAIq7NE7uO9DUhI41LmA&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166391013234084",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"imagePrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"videoPrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"isFavorited": false,
"isLoading": true,
"error": null,
"createdAt": "2026-08-04T18:49:14.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 720,
"height": 1280
},
"aspectRatio": "9:16"
}
},
"orderIndex": 0,
"srefValues": null,
"data": {
"videoGenEntId": "1166391013234084",
"requestId": "www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-3124baa5-c761-401b-a423-33c6da9d4632",
"imageEntId": "1166369879902864"
},
"canRetry": false,
"updatedAt": "2026-08-04T18:49:23.000Z",
"hasUploadedAncestor": true,
"contentItemId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "created",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:49:15.000Z"
},
{
"id": "62dbaffc-18b8-4480-8330-db9c2c66f53a",
"batchId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"type": "videos",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGY3-E7&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_ss=70289&_nc_zt=14&oh=00_AQGOPLwxkerbVirCp60oi0zX0kvAIq7NE7uO9DUhI41LmA&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166390993234086",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"imagePrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"videoPrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"isFavorited": false,
"isLoading": true,
"error": null,
"createdAt": "2026-08-04T18:49:14.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 720,
"height": 1280
},
"aspectRatio": "9:16"
}
},
"orderIndex": 1,
"srefValues": null,
"data": {
"videoGenEntId": "1166390993234086",
"requestId": "www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-56808b79-c647-4d50-add2-610a580b6917",
"imageEntId": "1166369879902864"
},
"canRetry": false,
"updatedAt": "2026-08-04T18:49:23.000Z",
"hasUploadedAncestor": true,
"contentItemId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-1",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "created",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:49:15.000Z"
},
{
"id": "de4427b6-347b-47e0-817b-4cfd7a773fa3",
"batchId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"type": "videos",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGY3-E7&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_ss=70289&_nc_zt=14&oh=00_AQGOPLwxkerbVirCp60oi0zX0kvAIq7NE7uO9DUhI41LmA&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166391026567416",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"imagePrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"videoPrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"isFavorited": false,
"isLoading": true,
"error": null,
"createdAt": "2026-08-04T18:49:14.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 720,
"height": 1280
},
"aspectRatio": "9:16"
}
},
"orderIndex": 2,
"srefValues": null,
"data": {
"videoGenEntId": "1166391026567416",
"requestId": "www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-d6f19906-ff12-4689-8ed0-f50c49817e09",
"imageEntId": "1166369879902864"
},
"canRetry": false,
"updatedAt": "2026-08-04T18:49:23.000Z",
"hasUploadedAncestor": true,
"contentItemId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-2",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "created",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:49:15.000Z"
},
{
"id": "a487d207-c8ab-4f33-aceb-4702992b756c",
"batchId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"type": "videos",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGY3-E7&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_ss=70289&_nc_zt=14&oh=00_AQGOPLwxkerbVirCp60oi0zX0kvAIq7NE7uO9DUhI41LmA&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166390996567419",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"imagePrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"videoPrompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"isFavorited": false,
"isLoading": true,
"error": null,
"createdAt": "2026-08-04T18:49:14.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 720,
"height": 1280
},
"aspectRatio": "9:16"
}
},
"orderIndex": 3,
"srefValues": null,
"data": {
"videoGenEntId": "1166390996567419",
"requestId": "www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-b46bab0e-b73f-400b-8182-c7ed0111150c",
"imageEntId": "1166369879902864"
},
"canRetry": false,
"updatedAt": "2026-08-04T18:49:23.000Z",
"hasUploadedAncestor": true,
"contentItemId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-3",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "created",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:49:15.000Z"
}
],
"needsPolling": true
},
{
"id": "uwNyUNhFjnW6Fu_SAPTka",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"type": "images",
"prompt": "Uploaded media",
"timestamp": "2026-08-04T18:41:06.000Z",
"isComplete": true,
"hasError": false,
"error": null,
"canRetry": true,
"config": {
"aspectRatio": "16:9"
},
"systemPrompt": null,
"promptModel": null,
"imageModel": null,
"videoModel": null,
"bulkGenId": null,
"generationStartTime": null,
"generationEndTime": null,
"creationContext": "pro",
"createdAt": "2026-08-04T18:41:06.000Z",
"updatedAt": "2026-08-04T18:41:06.000Z",
"content": [
{
"id": "99f09466-d868-4ae3-8f07-46abbcdd99a1",
"batchId": "uwNyUNhFjnW6Fu_SAPTka",
"type": "images",
"imageUrl": "https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwHUJSMy&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_zt=14&_nc_ss=70289&oh=00_AQFoWNXsbz-04jz78r_kZgkJFPCkAl33c5nu6PV4ZGKAqw&oe=6A999B6A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166380623235123",
"prompt": "Gemini_Generated_Image_c4n3b3c4n3b3c4n3.png",
"imagePrompt": null,
"videoPrompt": null,
"isFavorited": false,
"isLoading": false,
"error": null,
"createdAt": "2026-08-04T18:41:06.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 1280,
"height": 720
},
"aspectRatio": "16:9"
}
},
"orderIndex": 0,
"srefValues": null,
"data": null,
"canRetry": true,
"updatedAt": "2026-08-04T18:41:06.000Z",
"hasUploadedAncestor": true,
"contentItemId": "R-87pwHcew94UWVW5pDpk",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "uploaded",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:41:07.000Z"
}
],
"needsPolling": false
},
{
"id": "R3xTKL_bwZZ1om9r0O48p",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"type": "images",
"prompt": "Uploaded media",
"timestamp": "2026-08-04T18:32:24.000Z",
"isComplete": true,
"hasError": false,
"error": null,
"canRetry": true,
"config": {
"aspectRatio": "16:9"
},
"systemPrompt": null,
"promptModel": null,
"imageModel": null,
"videoModel": null,
"bulkGenId": null,
"generationStartTime": null,
"generationEndTime": null,
"creationContext": "pro",
"createdAt": "2026-08-04T18:32:24.000Z",
"updatedAt": "2026-08-04T18:32:24.000Z",
"content": [
{
"id": "70e5c5dd-a8ef-4893-98ae-6f2d15c94a3d",
"batchId": "R3xTKL_bwZZ1om9r0O48p",
"type": "images",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGY3-E7&ccb=17-1&_nc_gid=ZxdiZmvF2YCJYkAr5OjBQw&_nc_ss=70289&_nc_zt=14&oh=00_AQGOPLwxkerbVirCp60oi0zX0kvAIq7NE7uO9DUhI41LmA&oe=6A999B2A",
"videoUrl": null,
"imageHandle": null,
"videoHandle": null,
"mediaEntId": "1166369879902864",
"prompt": "Gemini_Generated_Image_auclocauclocaucl.png",
"imagePrompt": null,
"videoPrompt": null,
"isFavorited": false,
"isLoading": false,
"error": null,
"createdAt": "2026-08-04T18:32:24.000Z",
"structuredOutput": {
"metadata": {
"dimensions": {
"width": 1280,
"height": 720
},
"aspectRatio": "16:9"
}
},
"orderIndex": 0,
"srefValues": null,
"data": null,
"canRetry": true,
"updatedAt": "2026-08-04T18:32:24.000Z",
"hasUploadedAncestor": true,
"contentItemId": "saJw7zOwlqNnzbGhfO12e",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"relationship": "uploaded",
"isInTimeline": false,
"sourceProjectId": null,
"addedAt": "2026-08-04T18:32:26.000Z"
}
],
"needsPolling": false
}
],
"nextOffset": null
}
