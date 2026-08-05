# POST

## Request

fetch("https://vibes.ai/api/generate/videos", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=f4e74971361b46ae8ecd62780788f713,sentry-org_id=4509963614355457,sentry-transaction=%2Fprojects%2F%3AprojectId,sentry-sampled=false,sentry-sample_rand=0.6787860290461282,sentry-sample_rate=0.1",
"content-type": "application/json",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "f4e74971361b46ae8ecd62780788f713-9e351f40cc8ca1b7-0",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b"
},
"body": "{\"inputs\":[{\"type\":\"image\",\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageEntId\":\"1166369879902864\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"originalPrompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"720p\",\"batchVariation\":true,\"sourceContentItemIds\":[{\"id\":\"saJw7zOwlqNnzbGhfO12e\",\"source\":\"start_frame\"},{\"id\":\"R-87pwHcew94UWVW5pDpk\",\"source\":\"end_frame\"}],\"directPromptImageHandle\":{\"image_url\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"image_ent_id\":\"1166369879902864\",\"source\":\"asset\"},\"lastFrameImageUrl\":\"https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A\",\"lastFrameImageEntId\":\"1166380623235123\"}},{\"type\":\"image\",\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageEntId\":\"1166369879902864\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"originalPrompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"720p\",\"batchVariation\":true,\"sourceContentItemIds\":[{\"id\":\"saJw7zOwlqNnzbGhfO12e\",\"source\":\"start_frame\"},{\"id\":\"R-87pwHcew94UWVW5pDpk\",\"source\":\"end_frame\"}],\"directPromptImageHandle\":{\"image_url\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"image_ent_id\":\"1166369879902864\",\"source\":\"asset\"},\"lastFrameImageUrl\":\"https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A\",\"lastFrameImageEntId\":\"1166380623235123\"}},{\"type\":\"image\",\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageEntId\":\"1166369879902864\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"originalPrompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"720p\",\"batchVariation\":true,\"sourceContentItemIds\":[{\"id\":\"saJw7zOwlqNnzbGhfO12e\",\"source\":\"start_frame\"},{\"id\":\"R-87pwHcew94UWVW5pDpk\",\"source\":\"end_frame\"}],\"directPromptImageHandle\":{\"image_url\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"image_ent_id\":\"1166369879902864\",\"source\":\"asset\"},\"lastFrameImageUrl\":\"https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A\",\"lastFrameImageEntId\":\"1166380623235123\"}},{\"type\":\"image\",\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageEntId\":\"1166369879902864\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"originalPrompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"720p\",\"batchVariation\":true,\"sourceContentItemIds\":[{\"id\":\"saJw7zOwlqNnzbGhfO12e\",\"source\":\"start_frame\"},{\"id\":\"R-87pwHcew94UWVW5pDpk\",\"source\":\"end_frame\"}],\"directPromptImageHandle\":{\"image_url\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"image_ent_id\":\"1166369879902864\",\"source\":\"asset\"},\"lastFrameImageUrl\":\"https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A\",\"lastFrameImageEntId\":\"1166380623235123\"}}],\"config\":{\"directGeneration\":true,\"promptModel\":\"gemini-2.5-flash\",\"aspectRatio\":\"9:16\",\"imageModel\":\"midjen-base\",\"videoModel\":\"midjen-short\",\"resolution\":\"720p\",\"batchVariation\":true,\"sourceContentItemIds\":[{\"id\":\"saJw7zOwlqNnzbGhfO12e\",\"source\":\"start_frame\"},{\"id\":\"R-87pwHcew94UWVW5pDpk\",\"source\":\"end_frame\"}],\"directPromptImageHandle\":{\"image_url\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"image_ent_id\":\"1166369879902864\",\"source\":\"asset\"},\"lastFrameImageUrl\":\"https://scontent-sin2-1.xx.fbcdn.net/o1/v/t6/f2/m421/AQOafrMGAnyGC6eFG__ImH6hAxWXNdsa_Sc7VW-LwwNAp5g4y8Rj33k63TTu-_jA7Ul1UMT9CL_pkDsFZcJ6fq-QzlDJ?_nc_cat=102&_nc_sid=5b3566&_nc_ht=scontent-sin2-1.xx.fbcdn.net&_nc_ohc=VaIFstZn3j4Q7kNvwFYeqY6&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQHVAp-fFES_nXoigBGxQm-dcrWabz_LCbQ6bjKbcdfkZQ&oe=6A999B6A\",\"lastFrameImageEntId\":\"1166380623235123\",\"generationType\":\"t2v\"},\"batchId\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d\",\"mg_request_id\":\"www-019fce1b-bdcf-788c-92a4-05d75e20b139\",\"projectId\":\"7a0f777a-d069-4b4b-8aa2-7560fe351c4b\"}",
"method": "POST"
});

## Responce

{
"success": true,
"batchId": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"videoGenEntIds": [
"1166391013234084",
"1166390993234086",
"1166391026567416",
"1166390996567419"
],
"needsPolling": true,
"hasPartialErrors": false,
"items": [
{
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0-1785869363957",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A",
"isLoading": true,
"error": null
},
{
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-1-1785869363957",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A",
"isLoading": true,
"error": null
},
{
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-2-1785869363957",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A",
"isLoading": true,
"error": null
},
{
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-3-1785869363957",
"imageUrl": "https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A",
"isLoading": true,
"error": null
}
]
}

# PUT

## Request

fetch("https://vibes.ai/api/generation-batches", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=f4e74971361b46ae8ecd62780788f713,sentry-org_id=4509963614355457,sentry-transaction=%2Fprojects%2F%3AprojectId,sentry-sampled=false,sentry-sample_rand=0.6787860290461282,sentry-sample_rate=0.1",
"content-type": "application/json",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "f4e74971361b46ae8ecd62780788f713-b7549dd52548d93c-0",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b"
},
"body": "{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d\",\"content\":[{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0\",\"type\":\"videos\",\"isLoading\":false,\"videoUrl\":\"https://scontent-sin11-1.xx.fbcdn.net/o1/v/t6/f2/m477/AQPSXinPWoX5axc-6WNkdyWYVKQ_d02doaYF9Nfpb662RgKtbmkOANjIO7g2_VC6soFKk8CrqAnHorYWqklhJV3Z2x2sJuFvYon0UhZ0RuQvHHuGvy-mQa98mj6nKFRo.mp4?_nc_cat=105&_nc_sid=12fd43&_nc_ht=scontent-sin11-1.xx.fbcdn.net&_nc_ohc=NqjxOqNSfLMQ7kNvwEu7Pvn&ccb=17-1&_nc_gid=U9DPHvro3ZQIY16_AlgDOg&_nc_zt=28&_nc_ss=70289&oh=00_AQEOtWNUy2bER5flQPI0YRWNl65DBzOoTWYulPCVK9b_Nw&oe=6A999A78\",\"videoHandle\":null,\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageHandle\":null,\"data\":\"{\\\"videoGenEntId\\\":\\\"1166391013234084\\\",\\\"requestId\\\":\\\"www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-3124baa5-c761-401b-a423-33c6da9d4632\\\",\\\"imageEntId\\\":\\\"1166369879902864\\\"}\",\"error\":null},{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-1\",\"type\":\"videos\",\"isLoading\":false,\"videoUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m477/AQOlfOnlhXlwIpEs42eCndXWmgc-EigFFAXXbJukTnkgAuy6ebTFZ0LOYh5QtQvv9ok1m7EZMfqXDkIcuVOoPgECsObEcd9cB6_oVjFkmYiCwj_sXh4C_qod59VNSYaS.mp4?_nc_cat=110&_nc_sid=12fd43&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=K_4eQEbRq0kQ7kNvwGlA4BG&ccb=17-1&_nc_gid=z2yQlsvbgPVpOCq-SotjYQ&_nc_zt=28&_nc_ss=70289&oh=00_AQG3MvuCQDTVLRkXPcfHGH_Dt_C2mA1_KAFtOxt5E9vEaw&oe=6A99B095\",\"videoHandle\":null,\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageHandle\":null,\"data\":\"{\\\"videoGenEntId\\\":\\\"1166390993234086\\\",\\\"requestId\\\":\\\"www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-56808b79-c647-4d50-add2-610a580b6917\\\",\\\"imageEntId\\\":\\\"1166369879902864\\\"}\",\"error\":null},{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-2\",\"type\":\"videos\",\"isLoading\":false,\"videoUrl\":\"https://scontent-sin11-2.xx.fbcdn.net/o1/v/t6/f2/m257/AQNYe-ZrvwuGht1h_cZsSxPyKre-ser-2fosDr3vZ0fLigeGyr1Dws2efiL8UGXp75J8g-s2QjoccXN2I4gWandcFlhRSL7WSQhszJon011b4OHN8bA9kC2eDLUDPMnz.mp4?_nc_cat=108&_nc_sid=12fd43&_nc_ht=scontent-sin11-2.xx.fbcdn.net&_nc_ohc=LS8W5GvkX5wQ7kNvwH6S9VL&ccb=17-1&_nc_gid=giUfx8aSGrPu8SwtMaVrkQ&_nc_zt=28&_nc_ss=70289&oh=00_AQGJxg-6EFm0uXU-vtHrAUob59N_EXzX2fUMAMwBvYPWBg&oe=6A999833\",\"videoHandle\":null,\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageHandle\":null,\"data\":\"{\\\"videoGenEntId\\\":\\\"1166391026567416\\\",\\\"requestId\\\":\\\"www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-d6f19906-ff12-4689-8ed0-f50c49817e09\\\",\\\"imageEntId\\\":\\\"1166369879902864\\\"}\",\"error\":null},{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-3\",\"type\":\"videos\",\"isLoading\":false,\"videoUrl\":\"https://scontent-sin6-1.xx.fbcdn.net/o1/v/t6/f2/m477/AQN-p3SogD3QAc5ab2GGwmGIC3ncMaRmjrbocLlB-qesez2vpCTpPfoUJeXkSKOBD9-nDQLr2rRQ2THFTjOqjg40ksPIfpsmy-budFweXHfcj4NIXmKr6Xpoc5kiQQJT.mp4?_nc_cat=111&_nc_sid=12fd43&_nc_ht=scontent-sin6-1.xx.fbcdn.net&_nc_ohc=lqvDUi8G_VEQ7kNvwHgHbdS&ccb=17-1&_nc_gid=-CQUBO2ibktGNr019mYneA&_nc_zt=28&_nc_ss=70289&oh=00_AQEfjj_G1cHsEuK6Njh5fnd0rT0IRwtJkZGTUcZQnO_J0g&oe=6A9994F6\",\"videoHandle\":null,\"imageUrl\":\"https://scontent-sin6-3.xx.fbcdn.net/o1/v/t6/f2/m421/AQOXVucHN1Iuhcj6zNU83rhEY2YWFtxyYTaJfsGAFXF-BEzlGfRbayY88lDNfu3GIypx146BUjpU0jpLKNfuSYth6rNo?_nc_cat=110&_nc_sid=5b3566&_nc_ht=scontent-sin6-3.xx.fbcdn.net&_nc_ohc=x8DeieiKCAAQ7kNvwGCr0wW&ccb=17-1&_nc_gid=45TQhLg80r77PaNgjerxXQ&_nc_zt=14&_nc_ss=70289&oh=00_AQE5FwCo8LzYfDFTyKxjt-l0WBhtkRsgvaIV7KGyq4Oxpw&oe=6A999B2A\",\"imageHandle\":null,\"data\":\"{\\\"videoGenEntId\\\":\\\"1166390996567419\\\",\\\"requestId\\\":\\\"www-1202d9ec-6fab-4152-9912-6ca8cbbaa910-b46bab0e-b73f-400b-8182-c7ed0111150c\\\",\\\"imageEntId\\\":\\\"1166369879902864\\\"}\",\"error\":null}],\"isComplete\":true,\"generationEndTime\":\"2026-08-04T18:51:05.498Z\"}",
"method": "PUT"
});

## Responce

{
"batch": {
"id": "batch-019fce1b-bdce-7881-8057-d3a5347f266d",
"userId": "1202d9ec-6fab-4152-9912-6ca8cbbaa910",
"projectId": "7a0f777a-d069-4b4b-8aa2-7560fe351c4b",
"type": "videos",
"prompt": "Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.",
"timestamp": "2026-08-04T18:49:12.000Z",
"isComplete": true,
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
"generationEndTime": "2026-08-04T18:51:05.000Z",
"creationContext": "legacy",
"createdAt": "2026-08-04T18:49:13.000Z",
"updatedAt": "2026-08-04T18:51:06.000Z"
}
}
