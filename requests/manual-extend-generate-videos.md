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
"sentry-trace": "b675ca0c8a2c48af9f9f1025490d0b02-9914b5149088f61a-1",
"cookie": "cookie_ack=true; meta_session=3c4878b0-9862-4315-877b-d8b3779b1f23.68qi4n9QuToiRQE2IouZ3HkdPGE2ypdPXc8nWnJ4sTQ",
"Referer": "https://vibes.ai/projects/7a0f777a-d069-4b4b-8aa2-7560fe351c4b/content/batch-019fce1b-bdce-7881-8057-d3a5347f266d-content-0"
},
"body": "{\"inputs\":[{\"type\":\"extend\",\"mediaEntId\":\"1166411906565328\",\"videoUrl\":\"https://video-sin6-3.xx.fbcdn.net/o1/v/t2/f2/m412/AQMhqz7GSqWSr19-bcLg3Pk-dioF_FCQar9PSknGAwU46mMVjHT_OGPJaX174CzB5KsHmmK9GUDjWz6chFR5y2YhPVTfMCB7DZ_3HOI.mp4?_nc_cat=106&_nc_sid=b66105&_nc_ht=video-sin6-3.xx.fbcdn.net&_nc_ohc=ZKQfSHALoagQ7kNvwHZRMdx&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyMTY2MzU1MTM3MjYyOTgzLCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=4ee6ab7b81f31676&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC83QzQzOTc5RjU1NUVFQ0E0NjcyNDJCNUIxMTg5QzRCNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmjtbPxruS2QcVAigCQzMsF0Ah1P3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=EWiPuQTEZOz9ls3sOiJ3uw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFrYHc7YY9f0K5D_jsNQzDVR-qJPa7yAf1Ok8nLcIh-vA&oe=6A77FEB3\",\"prompt\":\"Fully animated hand-cut documentary paper collage on aged bone-white newsprint and archival map fragments over a charcoal black background. Circa 1660 along the banks of the Krishna River outside a village, wet muddy ground after rain, laborers actively digging, washing, and sifting mud by hand, with horseback guards watching over them. Black and white halftone photograph cutouts with rough scissor-cut edges, amber thread, brass pins, visible print grain and paper fiber, flat documentary lighting with soft cutout drop shadows, desaturated archival palette of bone white, ink black, halftone gray, amber, and muted ochre.\",\"extendDirective\":\"this is example prompt for manual extend\",\"config\":{\"metadata\":{\"dimensions\":{\"width\":1280,\"height\":720},\"aspectRatio\":\"16:9\"},\"videoModel\":\"midjen-extend\",\"imageModel\":\"midjen-base\",\"generationType\":\"extend\",\"sourceVideoUrl\":\"https://video-sin6-3.xx.fbcdn.net/o1/v/t2/f2/m412/AQMhqz7GSqWSr19-bcLg3Pk-dioF_FCQar9PSknGAwU46mMVjHT_OGPJaX174CzB5KsHmmK9GUDjWz6chFR5y2YhPVTfMCB7DZ_3HOI.mp4?_nc_cat=106&_nc_sid=b66105&_nc_ht=video-sin6-3.xx.fbcdn.net&_nc_ohc=ZKQfSHALoagQ7kNvwHZRMdx&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyMTY2MzU1MTM3MjYyOTgzLCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=4ee6ab7b81f31676&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC83QzQzOTc5RjU1NUVFQ0E0NjcyNDJCNUIxMTg5QzRCNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmjtbPxruS2QcVAigCQzMsF0Ah1P3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=EWiPuQTEZOz9ls3sOiJ3uw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFrYHc7YY9f0K5D_jsNQzDVR-qJPa7yAf1Ok8nLcIh-vA&oe=6A77FEB3\",\"audioSourceUrl\":\"https://video-sin6-3.xx.fbcdn.net/o1/v/t2/f2/m412/AQMhqz7GSqWSr19-bcLg3Pk-dioF_FCQar9PSknGAwU46mMVjHT_OGPJaX174CzB5KsHmmK9GUDjWz6chFR5y2YhPVTfMCB7DZ_3HOI.mp4?_nc_cat=106&_nc_sid=b66105&_nc_ht=video-sin6-3.xx.fbcdn.net&_nc_ohc=ZKQfSHALoagQ7kNvwHZRMdx&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyMTY2MzU1MTM3MjYyOTgzLCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=4ee6ab7b81f31676&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC83QzQzOTc5RjU1NUVFQ0E0NjcyNDJCNUIxMTg5QzRCNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmjtbPxruS2QcVAigCQzMsF0Ah1P3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=EWiPuQTEZOz9ls3sOiJ3uw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFrYHc7YY9f0K5D_jsNQzDVR-qJPa7yAf1Ok8nLcIh-vA&oe=6A77FEB3\",\"directGeneration\":true,\"sourceContentItemIds\":[{\"id\":\"extend-1785870410928-ebb7dc5b-content-0-1785870417736\",\"source\":\"extend_video\"}],\"extendDirective\":\"this is example prompt for manual extend\"}}],\"config\":{\"metadata\":{\"dimensions\":{\"width\":1280,\"height\":720},\"aspectRatio\":\"16:9\"},\"videoModel\":\"midjen-extend\",\"imageModel\":\"midjen-base\",\"generationType\":\"extend\",\"sourceVideoUrl\":\"https://video-sin6-3.xx.fbcdn.net/o1/v/t2/f2/m412/AQMhqz7GSqWSr19-bcLg3Pk-dioF_FCQar9PSknGAwU46mMVjHT_OGPJaX174CzB5KsHmmK9GUDjWz6chFR5y2YhPVTfMCB7DZ_3HOI.mp4?_nc_cat=106&_nc_sid=b66105&_nc_ht=video-sin6-3.xx.fbcdn.net&_nc_ohc=ZKQfSHALoagQ7kNvwHZRMdx&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyMTY2MzU1MTM3MjYyOTgzLCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=4ee6ab7b81f31676&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC83QzQzOTc5RjU1NUVFQ0E0NjcyNDJCNUIxMTg5QzRCNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmjtbPxruS2QcVAigCQzMsF0Ah1P3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=EWiPuQTEZOz9ls3sOiJ3uw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFrYHc7YY9f0K5D_jsNQzDVR-qJPa7yAf1Ok8nLcIh-vA&oe=6A77FEB3\",\"audioSourceUrl\":\"https://video-sin6-3.xx.fbcdn.net/o1/v/t2/f2/m412/AQMhqz7GSqWSr19-bcLg3Pk-dioF_FCQar9PSknGAwU46mMVjHT_OGPJaX174CzB5KsHmmK9GUDjWz6chFR5y2YhPVTfMCB7DZ_3HOI.mp4?_nc_cat=106&_nc_sid=b66105&_nc_ht=video-sin6-3.xx.fbcdn.net&_nc_ohc=ZKQfSHALoagQ7kNvwHZRMdx&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5WSV9VU0VDQVNFX1BST0RVQ1RfVFlQRS4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyMTY2MzU1MTM3MjYyOTgzLCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTA5ODAsImR1cmF0aW9uX3MiOjgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=4ee6ab7b81f31676&_nc_vs=HBkcFQIYQGZiX3Blcm1hbmVudC83QzQzOTc5RjU1NUVFQ0E0NjcyNDJCNUIxMTg5QzRCNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAmjtbPxruS2QcVAigCQzMsF0Ah1P3ztkWiGBlkYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwEQB1AGXIqwEA&_nc_gid=EWiPuQTEZOz9ls3sOiJ3uw&_nc_ss=702a8&_nc_zt=28&oh=00_AQFrYHc7YY9f0K5D_jsNQzDVR-qJPa7yAf1Ok8nLcIh-vA&oe=6A77FEB3\",\"directGeneration\":true,\"sourceContentItemIds\":[{\"id\":\"extend-1785870410928-ebb7dc5b-content-0-1785870417736\",\"source\":\"extend_video\"}],\"extendDirective\":\"this is example prompt for manual extend\"},\"batchId\":\"extend-1785870909974-3be157e8\",\"mg_request_id\":\"www-019fce33-821b-7274-adc9-2f1d0766f5e7\",\"projectId\":\"7a0f777a-d069-4b4b-8aa2-7560fe351c4b\"}",
"method": "POST"
});

## Responce

{
"success": true,
"batchId": "extend-1785870909974-3be157e8",
"videoGenEntIds": [
"1166421326564386"
],
"needsPolling": true,
"hasPartialErrors": false,
"items": [
{
"id": "extend-1785870909974-3be157e8-content-0-1785870916041",
"imageUrl": null,
"isLoading": true,
"error": null
}
]
}
