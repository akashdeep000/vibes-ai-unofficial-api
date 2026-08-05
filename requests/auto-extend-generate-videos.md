## Request

fetch("https://vibes.ai/api/generate/videos", {
"headers": {
"accept": "_/_",
"accept-language": "en-US,en;q=0.9",
"baggage": "sentry-environment=production,sentry-release=b06102654b92d2d02ceb8b06f94c6d182344bed4,sentry-public_key=2f357cf8852a33530d72872e55d86a65,sentry-trace_id=b675ca0c8a2c48af9f9f1025490d0b02,sentry-org_id=4509963614355457,sentry-transaction=%2Fprojects%2F%3AprojectId%2Fcontent%2F%3AcontentItemId,sentry-sampled=true,sentry-sample_rand=0.08854574945423277,sentry-sample_rate=0.1",
"content-type": "application/json",
"priority": "u=1, i",
"sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "\"Linux\"",
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sentry-trace": "b675ca0c8a2c48af9f9f1025490d0b02-971caa635d6fbb4d-1",
"cookie": "cookie_ack=true; meta_session=YOUR_COOKIE",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b/content/batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0"
},
"body": "{\"inputs\":[{\"type\":\"extend\",\"mediaEntId\":\"1166391013234084\",\"videoUrl\":\"https://video-sin11-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQN-Jlhpj_d96MD5zXFO3rJ03RXpCLujAU6Veg9edrWOKojunH_8fp9ELuax01AZXYr9RWLTGDGSxkonNzV5HUG47kYy8WeztV7wmd4.mp4?_nc_cat=105&_nc_sid=b66105&_nc_ht=video-sin11-1.xx.fbcdn.net&_nc_ohc=16I3QSyNuKgQ7kNvwHr6qW-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMDc0NTg5ODA4MzIyNzU0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjUsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=2a58791a8a49c4ce&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC8zQjRBMDVDRDRCQzU1Njg4OENCNTE2QjM5MzgxODI4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmhKPv_K3V6AMVAigCQzMsF0AUVP3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=4ZujLLKU1HsvOyGqPWBMvw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFlwVGKUdzNuwL2QZRgCS4dXnED9lmKqQCN-Te8DPbflw&oe=6A7824F6\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"config\":{\"metadata\":{\"dimensions\":{\"width\":720,\"height\":1280},\"aspectRatio\":\"9:16\"},\"videoModel\":\"midjen-extend\",\"imageModel\":\"midjen-base\",\"generationType\":\"extend\",\"sourceVideoUrl\":\"https://video-sin11-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQN-Jlhpj_d96MD5zXFO3rJ03RXpCLujAU6Veg9edrWOKojunH_8fp9ELuax01AZXYr9RWLTGDGSxkonNzV5HUG47kYy8WeztV7wmd4.mp4?_nc_cat=105&_nc_sid=b66105&_nc_ht=video-sin11-1.xx.fbcdn.net&_nc_ohc=16I3QSyNuKgQ7kNvwHr6qW-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMDc0NTg5ODA4MzIyNzU0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjUsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=2a58791a8a49c4ce&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC8zQjRBMDVDRDRCQzU1Njg4OENCNTE2QjM5MzgxODI4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmhKPv_K3V6AMVAigCQzMsF0AUVP3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=4ZujLLKU1HsvOyGqPWBMvw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFlwVGKUdzNuwL2QZRgCS4dXnED9lmKqQCN-Te8DPbflw&oe=6A7824F6\",\"audioSourceUrl\":\"https://video-sin11-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQN-Jlhpj_d96MD5zXFO3rJ03RXpCLujAU6Veg9edrWOKojunH_8fp9ELuax01AZXYr9RWLTGDGSxkonNzV5HUG47kYy8WeztV7wmd4.mp4?_nc_cat=105&_nc_sid=b66105&_nc_ht=video-sin11-1.xx.fbcdn.net&_nc_ohc=16I3QSyNuKgQ7kNvwHr6qW-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMDc0NTg5ODA4MzIyNzU0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjUsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=2a58791a8a49c4ce&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC8zQjRBMDVDRDRCQzU1Njg4OENCNTE2QjM5MzgxODI4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmhKPv_K3V6AMVAigCQzMsF0AUVP3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=4ZujLLKU1HsvOyGqPWBMvw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFlwVGKUdzNuwL2QZRgCS4dXnED9lmKqQCN-Te8DPbflw&oe=6A7824F6\",\"directGeneration\":true,\"sourceContentItemIds\":[{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0\",\"source\":\"extend_video\"}]}}],\"config\":{\"metadata\":{\"dimensions\":{\"width\":720,\"height\":1280},\"aspectRatio\":\"9:16\"},\"videoModel\":\"midjen-extend\",\"imageModel\":\"midjen-base\",\"generationType\":\"extend\",\"sourceVideoUrl\":\"https://video-sin11-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQN-Jlhpj_d96MD5zXFO3rJ03RXpCLujAU6Veg9edrWOKojunH_8fp9ELuax01AZXYr9RWLTGDGSxkonNzV5HUG47kYy8WeztV7wmd4.mp4?_nc_cat=105&_nc_sid=b66105&_nc_ht=video-sin11-1.xx.fbcdn.net&_nc_ohc=16I3QSyNuKgQ7kNvwHr6qW-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMDc0NTg5ODA4MzIyNzU0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjUsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=2a58791a8a49c4ce&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC8zQjRBMDVDRDRCQzU1Njg4OENCNTE2QjM5MzgxODI4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmhKPv_K3V6AMVAigCQzMsF0AUVP3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=4ZujLLKU1HsvOyGqPWBMvw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFlwVGKUdzNuwL2QZRgCS4dXnED9lmKqQCN-Te8DPbflw&oe=6A7824F6\",\"audioSourceUrl\":\"https://video-sin11-1.xx.fbcdn.net/o1/v/t2/f2/m412/AQN-Jlhpj_d96MD5zXFO3rJ03RXpCLujAU6Veg9edrWOKojunH_8fp9ELuax01AZXYr9RWLTGDGSxkonNzV5HUG47kYy8WeztV7wmd4.mp4?_nc_cat=105&_nc_sid=b66105&_nc_ht=video-sin11-1.xx.fbcdn.net&_nc_ohc=16I3QSyNuKgQ7kNvwHr6qW-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMDc0NTg5ODA4MzIyNzU0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjUsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=2a58791a8a49c4ce&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC8zQjRBMDVDRDRCQzU1Njg4OENCNTE2QjM5MzgxODI4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmhKPv_K3V6AMVAigCQzMsF0AUVP3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=4ZujLLKU1HsvOyGqPWBMvw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFlwVGKUdzNuwL2QZRgCS4dXnED9lmKqQCN-Te8DPbflw&oe=6A7824F6\",\"directGeneration\":true,\"sourceContentItemIds\":[{\"id\":\"batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0\",\"source\":\"extend_video\"}]},\"batchId\":\"extend-1785870410928-ebb7dc5b\",\"mg_request_id\":\"www-019fce2b-e4b4-749c-9836-219eb317c650\",\"projectId\":\"7a0f777a-d069-4b4b-8aa2-7560fe351c4b\"}",
"method": "POST"
});

## Responce

{
"success": true,
"batchId": "extend-1785870410928-ebb7dc5b",
"videoGenEntIds": [
"1166411906565328"
],
"needsPolling": true,
"hasPartialErrors": false,
"items": [
{
"id": "extend-1785870410928-ebb7dc5b-content-0-1785870419417",
"imageUrl": null,
"isLoading": true,
"error": null
}
]
}
