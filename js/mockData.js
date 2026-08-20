/**
 * OmniVision AI Dashboard - Snapshot Mock Data
 * Contains representative data payloads for ANPR and Object Detection.
 */

export const MOCK_DASHBOARD_DATA = {
    "message": "Success",
    "status": "success",
    "data": {
        "tiles": [
            {
                "severity": "medium",
                "total": 1620,
                "use_cases": [
                    {
                        "use_case_id": "ca6503cf-f881-4773-ab46-f6f22289d1bf",
                        "use_case_name": "Object Detection",
                        "count": 1620
                    }
                ]
            },
            {
                "severity": "high",
                "total": 374,
                "use_cases": [
                    {
                        "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                        "use_case_name": "ANPR Detection",
                        "count": 374
                    }
                ]
            }
        ],
        "grand_total": 1994
    }
};

export const MOCK_CAMERA_CONFIGS = {
    "message": "Success",
    "status": "success",
    "data": [
        {
            "id": "1e5da83f-817f-4f74-a7c7-fcff635417b9",
            "sr_id": 7,
            "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
            "camera_name": "Terrace-Cam-23",
            "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
            "zone_name": "Zone 02",
            "is_active": true,
            "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
            "use_case_name": "ANPR Detection",
            "zone_profile_id": null,
            "severity": "high",
            "detection_cooldown_interval": 0,
            "deleted_at": null,
            "profile_count": null
        },
        {
            "id": "d9b82d35-f2c6-437d-9681-2c872db8de2c",
            "sr_id": 8,
            "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
            "camera_name": "Terrace-Cam-23",
            "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
            "zone_name": "Zone 02",
            "is_active": true,
            "use_case_id": "ca6503cf-f881-4773-ab46-f6f22289d1bf",
            "use_case_name": "Object Detection",
            "zone_profile_id": "92d6eace-b722-4684-a7ad-3308c4c43249",
            "severity": "medium",
            "detection_cooldown_interval": 0,
            "deleted_at": null,
            "profile_count": 80
        },
        {
            "id": "7b2e1a44-48f1-4c92-91ef-88c9d19a2e31",
            "sr_id": 9,
            "camera_id": "83a901ff-32b0-4e12-b912-881a293c0119",
            "camera_name": "Gate-01-Inbound",
            "zone_id": "4d128892-71aa-4921-b021-998ca01b2231",
            "zone_name": "Main Entrance Gate",
            "is_active": true,
            "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
            "use_case_name": "ANPR Detection",
            "zone_profile_id": null,
            "severity": "high",
            "detection_cooldown_interval": 2,
            "deleted_at": null,
            "profile_count": 120
        },
        {
            "id": "fa91823c-91bc-4012-ba29-873918201cd3",
            "sr_id": 10,
            "camera_id": "319ca012-98ba-4812-990a-1192809bc001",
            "camera_name": "Perimeter-North-04",
            "zone_id": "38da0192-88ba-4109-87aa-291820ba8192",
            "zone_name": "North Perimeter Fence",
            "is_active": true,
            "use_case_id": "ca6503cf-f881-4773-ab46-f6f22289d1bf",
            "use_case_name": "Object Detection",
            "zone_profile_id": "81ab9021-99ab-4882-99ca-291820ba9911",
            "severity": "medium",
            "detection_cooldown_interval": 5,
            "deleted_at": null,
            "profile_count": 45
        }
    ]
};

export const MOCK_DETECTIONS = {
    "message": "Success",
    "status": "success",
    "data": {
        "items": [
            {
                "id": "96ab638f-4d72-4634-8599-0d357a9e2a6b",
                "sr_id": 48707,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T15:18:39+05:30",
                "detections": [
                    {
                        "bbox": [431, 1299, 584, 1365],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "2001",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.9985
                    }
                ],
                "photo_url": "/ai/detections/96ab638f-4d72-4634-8599-0d357a9e2a6b/photo",
                "thumbnail_url": "/ai/detections/96ab638f-4d72-4634-8599-0d357a9e2a6b/thumbnail",
                "video_url": "/ai/detections/96ab638f-4d72-4634-8599-0d357a9e2a6b/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "9b9f813e-e7e4-4e2a-9d0f-fa34919bc212",
                "sr_id": 48706,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T15:15:58+05:30",
                "detections": [
                    {
                        "bbox": [538, 1213, 677, 1359],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "1000",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.587
                    }
                ],
                "photo_url": "/ai/detections/9b9f813e-e7e4-4e2a-9d0f-fa34919bc212/photo",
                "thumbnail_url": "/ai/detections/9b9f813e-e7e4-4e2a-9d0f-fa34919bc212/thumbnail",
                "video_url": "/ai/detections/9b9f813e-e7e4-4e2a-9d0f-fa34919bc212/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "322d5a0a-2339-48cb-8804-ae336e2b7ad1",
                "sr_id": 48705,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T15:09:54+05:30",
                "detections": [
                    {
                        "bbox": [431, 1296, 585, 1369],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "T0OZ",
                            "plate_origin": "Unknown"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.6934
                    }
                ],
                "photo_url": "/ai/detections/322d5a0a-2339-48cb-8804-ae336e2b7ad1/photo",
                "thumbnail_url": "/ai/detections/322d5a0a-2339-48cb-8804-ae336e2b7ad1/thumbnail",
                "video_url": "/ai/detections/322d5a0a-2339-48cb-8804-ae336e2b7ad1/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "b84f8164-1e13-4cbd-be89-7671cdce7e08",
                "sr_id": 48704,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T15:06:17+05:30",
                "detections": [
                    {
                        "bbox": [432, 1288, 584, 1361],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "L00Z",
                            "plate_origin": "Unknown"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.6916
                    }
                ],
                "photo_url": "/ai/detections/b84f8164-1e13-4cbd-be89-7671cdce7e08/photo",
                "thumbnail_url": "/ai/detections/b84f8164-1e13-4cbd-be89-7671cdce7e08/thumbnail",
                "video_url": "/ai/detections/b84f8164-1e13-4cbd-be89-7671cdce7e08/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "eea9af16-29b1-4df7-be1c-c393e01f5e8a",
                "sr_id": 48703,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T15:00:32+05:30",
                "detections": [
                    {
                        "bbox": [429, 1287, 584, 1360],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "2001",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.987
                    }
                ],
                "photo_url": "/ai/detections/eea9af16-29b1-4df7-be1c-c393e01f5e8a/photo",
                "thumbnail_url": "/ai/detections/eea9af16-29b1-4df7-be1c-c393e01f5e8a/thumbnail",
                "video_url": "/ai/detections/eea9af16-29b1-4df7-be1c-c393e01f5e8a/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "f18098a2-9737-484f-bd73-bbe67170557b",
                "sr_id": 48702,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T14:53:04+05:30",
                "detections": [
                    {
                        "bbox": [431, 1294, 585, 1368],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "2001",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.9997
                    }
                ],
                "photo_url": "/ai/detections/f18098a2-9737-484f-bd73-bbe67170557b/photo",
                "thumbnail_url": "/ai/detections/f18098a2-9737-484f-bd73-bbe67170557b/thumbnail",
                "video_url": "/ai/detections/f18098a2-9737-484f-bd73-bbe67170557b/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "5e8908e0-a7f8-409e-a965-e95579177639",
                "sr_id": 48701,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T14:53:01+05:30",
                "detections": [
                    {
                        "bbox": [431, 1295, 584, 1363],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "2001",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.9975
                    }
                ],
                "photo_url": "/ai/detections/5e8908e0-a7f8-409e-a965-e95579177639/photo",
                "thumbnail_url": "/ai/detections/5e8908e0-a7f8-409e-a965-e95579177639/thumbnail",
                "video_url": "/ai/detections/5e8908e0-a7f8-409e-a965-e95579177639/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "df6d727a-dee7-49c4-a32f-81f47e6736f3",
                "sr_id": 48700,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T14:52:51+05:30",
                "detections": [
                    {
                        "bbox": [429, 1296, 584, 1372],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "1002",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.8523
                    }
                ],
                "photo_url": "/ai/detections/df6d727a-dee7-49c4-a32f-81f47e6736f3/photo",
                "thumbnail_url": "/ai/detections/df6d727a-dee7-49c4-a32f-81f47e6736f3/thumbnail",
                "video_url": "/ai/detections/df6d727a-dee7-49c4-a32f-81f47e6736f3/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "536bafdf-3911-4a18-a0de-c94e76ba1423",
                "sr_id": 48699,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T14:51:27+05:30",
                "detections": [
                    {
                        "bbox": [431, 1286, 584, 1362],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "2001",
                            "plate_origin": "UAE"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.9994
                    }
                ],
                "photo_url": "/ai/detections/536bafdf-3911-4a18-a0de-c94e76ba1423/photo",
                "thumbnail_url": "/ai/detections/536bafdf-3911-4a18-a0de-c94e76ba1423/thumbnail",
                "video_url": "/ai/detections/536bafdf-3911-4a18-a0de-c94e76ba1423/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            },
            {
                "id": "9aa1edbf-0d53-4eaf-b0eb-f09cafc31595",
                "sr_id": 48698,
                "camera_id": "29f1cc4b-2180-49f8-81b7-145136f49fa2",
                "camera_name": "Terrace-Cam-23",
                "use_case_id": "e0820c96-a414-4fd1-aaae-4fa3beaaee7f",
                "use_case_name": "ANPR Detection",
                "zone_id": "1e518001-868c-4268-96d9-7b9c002a21cb",
                "zone_name": "Zone 02",
                "detected_at": "2026-08-19T14:50:32+05:30",
                "detections": [
                    {
                        "bbox": [57, 1303, 332, 1427],
                        "class_id": 0,
                        "metadata": {
                            "plate_text": "P2991T03",
                            "plate_origin": "Unknown"
                        },
                        "class_name": "license_plate",
                        "confidence": 0.9849
                    }
                ],
                "photo_url": "/ai/detections/9aa1edbf-0d53-4eaf-b0eb-f09cafc31595/photo",
                "thumbnail_url": "/ai/detections/9aa1edbf-0d53-4eaf-b0eb-f09cafc31595/thumbnail",
                "video_url": "/ai/detections/9aa1edbf-0d53-4eaf-b0eb-f09cafc31595/video",
                "severity": "high",
                "deleted_at": null,
                "alert_id": null,
                "notification_status": null,
                "notified_to": null,
                "notified_by": null
            }
        ],
        "total": 374,
        "page": 1,
        "page_size": 10
    }
};
