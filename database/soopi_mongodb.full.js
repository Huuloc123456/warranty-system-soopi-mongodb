// Soopi MongoDB: complete data and index snapshot
// Source: soopi_mongodb; captured at: 2026-10-30T04:52:25.462Z
// 26 collections; 52 indexes (including _id_).
// Set SOOPI_RESTORE_DB to choose an EMPTY target database.
// No collections or documents are dropped or overwritten.
// Attachment contents live on disk and must be copied separately.
(() => {
  const targetName = process.env.SOOPI_RESTORE_DB || "soopi_mongodb_restore";
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(targetName) || ["admin", "local", "config", "service_center"].includes(targetName.toLowerCase())) {
    throw new Error("Invalid target database: " + targetName);
  }
  const target = db.getSiblingDB(targetName);
  if (target.getCollectionInfos().length !== 0) {
    throw new Error("Target database already has collections: " + targetName + ". Choose an empty database with SOOPI_RESTORE_DB.");
  }

  // Collection: accounts (8 documents in source).
  target.createCollection("accounts", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("accounts").createIndex(EJSON.deserialize({
  "username": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "account_username_collated",
  "unique": true,
  "collation": {
    "locale": "en",
    "caseLevel": false,
    "caseFirst": "off",
    "strength": {
      "$numberInt": "2"
    },
    "numericOrdering": false,
    "alternate": "non-ignorable",
    "maxVariable": "punct",
    "normalization": false,
    "backwards": false,
    "version": "57.1"
  }
}, { relaxed: false }));
  target.getCollection("accounts").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "1"
    },
    "username": "admin",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "ADMIN"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1792079207453"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "2"
    },
    "username": "receptionist",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "RECEPTIONIST"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1792079251985"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "3"
    },
    "username": "dispatcher",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "DISPATCHER"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1793186932981"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "4"
    },
    "username": "technician",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "TECHNICIAN"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1793185897470"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "5"
    },
    "username": "warehouse",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "WAREHOUSE_KEEPER"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1792079319743"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "6"
    },
    "username": "cashier",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "CASHIER"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1792079335507"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "7"
    },
    "username": "technician2",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "TECHNICIAN"
      }
    ],
    "principalType": "EMPLOYEE",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1791532985543"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "8"
    },
    "username": "0900000001",
    "passwordHash": "{bcrypt}$2a$12$WgY3Rbcjip.H0xVa2qyJR.9daTTF9FfPW0qIlRS93uNKXPtlvUI0K",
    "roleRows": [
      {
        "accountId": {
          "$numberLong": "0"
        },
        "role": "CUSTOMER"
      }
    ],
    "principalType": "CUSTOMER",
    "status": "ACTIVE",
    "failedLoginAttempts": {
      "$numberInt": "0"
    },
    "temporaryLockUntil": null,
    "mustChangePassword": false,
    "securityVersion": {
      "$numberInt": "2"
    },
    "lastLoginAt": {
      "$date": {
        "$numberLong": "1793186543672"
      }
    },
    "passwordChangedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("accounts").countDocuments({}) !== 8) throw new Error("Count mismatch: accounts");

  // Collection: attachments (15 documents in source).
  target.createCollection("attachments", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("attachments").createIndex(EJSON.deserialize({
  "ownerType": {
    "$numberInt": "1"
  },
  "ownerId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "attachment_owner"
}, { relaxed: false }));
  target.getCollection("attachments").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "1"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00001",
    "fileName": "TN-2026-1009-00001-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/06921e2a-a2a6-4bb1-9cd4-ee9203f50a88",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791528835504"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "2"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00002",
    "fileName": "TN-2026-1009-00002-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/0ac1e115-8e17-4d27-bee0-841cb113b50d",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791528836170"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "3"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00003",
    "fileName": "TN-2026-1009-00003-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/e4e32470-b2f9-4703-943f-623a2ee0006e",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791528933583"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "4"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00004",
    "fileName": "TN-2026-1009-00004-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/4f5a20bc-67fc-42fa-ba51-18c4aca95be4",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791528933952"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "5"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00005",
    "fileName": "TN-2026-1009-00005-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/5be72a2d-8d7d-48cc-97e1-bf479954d7b6",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529452353"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "6"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00006",
    "fileName": "TN-2026-1009-00006-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/8de4a672-0972-4e07-84de-1220f7b3b57d",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529453159"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "7"
    },
    "ownerType": "WARRANTY_REQUEST",
    "ownerId": "YC-2026-1009-00001",
    "fileName": "demo-device.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/3fb6dc48-306f-489d-85bc-8d50d21acc38",
    "uploadedBy": "PORTAL",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529453774"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "8"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00007",
    "fileName": "TN-2026-1009-00007-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/47ff5230-cc4a-4dfb-a196-66e2ec9f538f",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529575928"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "9"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00008",
    "fileName": "TN-2026-1009-00008-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/2982b29b-ff81-4a7b-af50-166822e826eb",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529576407"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "10"
    },
    "ownerType": "WARRANTY_REQUEST",
    "ownerId": "YC-2026-1009-00002",
    "fileName": "demo-device.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/a9bb3c06-9ad1-4439-a1d9-baa23e20e2c2",
    "uploadedBy": "PORTAL",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791529576731"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "11"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00009",
    "fileName": "TN-2026-1009-00009-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/e7f2029d-d5a7-467e-97bb-062c7f248d68",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791530260740"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "12"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00010",
    "fileName": "TN-2026-1009-00010-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/33ce3c65-18ea-4717-86d8-048812d70d9a",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791530261464"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "13"
    },
    "ownerType": "WARRANTY_REQUEST",
    "ownerId": "YC-2026-1009-00003",
    "fileName": "demo-device.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "68"
    },
    "storageKey": "2026/10/653e4677-832e-435f-a705-f54c7f110fc6",
    "uploadedBy": "PORTAL",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791530261943"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "14"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00011",
    "fileName": "TN-2026-1009-00011-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "10191"
    },
    "storageKey": "2026/10/6a5a1b57-787a-4935-a792-01fa0f6de79a",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791532803687"
      }
    }
  },
  {
    "_id": {
      "$numberLong": "15"
    },
    "ownerType": "HANDOVER_SIGNATURE",
    "ownerId": "TN-2026-1009-00012",
    "fileName": "TN-2026-1009-00012-signature.png",
    "contentType": "image/png",
    "size": {
      "$numberLong": "10191"
    },
    "storageKey": "2026/10/34b866df-bab5-4ffb-a252-aca239ec0bb6",
    "uploadedBy": "NV-006",
    "uploadedAt": {
      "$date": {
        "$numberLong": "1791532986820"
      }
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("attachments").countDocuments({}) !== 15) throw new Error("Count mismatch: attachments");

  // Collection: audit_logs (312 documents in source).
  target.createCollection("audit_logs", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("audit_logs").createIndex(EJSON.deserialize({
  "entityType": {
    "$numberInt": "1"
  },
  "entityId": {
    "$numberInt": "1"
  },
  "at": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "audit_entity_date"
}, { relaxed: false }));
  target.getCollection("audit_logs").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "1"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528500731"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "2"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528501275"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "3"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528501602"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "4"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528501915"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "5"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528502271"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "6"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528502603"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "7"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528502918"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "8"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528541013"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "9"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528541391"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "10"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528541709"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "11"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528671918"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "12"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528672862"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "13"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528673227"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "14"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528673579"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "15"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528673930"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "16"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528674274"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "17"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528674618"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "18"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528707809"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "19"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528832698"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "20"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528833008"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "21"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528833342"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "22"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528833660"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "23"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528833960"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "24"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528834308"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "25"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528834630"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "26"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528834932"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000003",
    "before": null,
    "after": "TB-000003 — MONGO-MV0M0G24-FREE — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "27"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835042"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": null,
    "after": "TN-2026-1009-00001 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "28"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835189"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "29"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835244"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": null,
    "after": "PKT-2026-00001 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "30"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835283"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "31"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835299"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "32"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835320"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "33"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835360"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": "TN-2026-1009-00001 — Đang sửa chữa",
    "after": "TN-2026-1009-00001 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "34"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835437"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": "TN-2026-1009-00001 — Chưa thu tiền",
    "after": "PT-2026-00001 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "35"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835516"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00001",
    "before": "TN-2026-1009-00001 — Hoàn thành",
    "after": "TN-2026-1009-00001 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "36"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835631"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000004",
    "before": null,
    "after": "TB-000004 — MONGO-MV0M0G24-CHARGED — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "37"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835640"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": null,
    "after": "TN-2026-1009-00002 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "38"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835695"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "39"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835706"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": null,
    "after": "PKT-2026-00002 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "40"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835723"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "41"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835730"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "42"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835787"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00001",
    "before": null,
    "after": "TN-2026-1009-00002 — 660000"
  },
  {
    "_id": {
      "$numberLong": "43"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835849"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_LINES_UPDATED",
    "actionLabel": "Cập nhật chi tiết báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00001",
    "before": "660000",
    "after": "660000"
  },
  {
    "_id": {
      "$numberLong": "44"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835886"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00001",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "45"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528835926"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "Khách hàng demo",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00001",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "46"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528836001"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00001",
    "before": null,
    "after": "TN-2026-1009-00002"
  },
  {
    "_id": {
      "$numberLong": "47"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528836069"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00001",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "48"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528836107"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": "TN-2026-1009-00002 — Đang sửa chữa",
    "after": "TN-2026-1009-00002 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "49"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528836152"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": "TN-2026-1009-00002 — Chưa thu tiền",
    "after": "PT-2026-00002 — 660.000 đ"
  },
  {
    "_id": {
      "$numberLong": "50"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528836175"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00002",
    "before": "TN-2026-1009-00002 — Hoàn thành",
    "after": "TN-2026-1009-00002 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "51"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528931713"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "52"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528931952"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "53"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528932195"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "54"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528932448"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "55"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528932686"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "56"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528932955"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "57"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933183"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "58"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933401"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000005",
    "before": null,
    "after": "TB-000005 — MONGO-MV0M2K2A-FREE — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "59"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933423"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": null,
    "after": "TN-2026-1009-00003 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "60"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933468"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "61"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933482"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": null,
    "after": "PKT-2026-00003 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "62"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933495"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "63"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933511"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "64"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933526"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "65"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933541"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": "TN-2026-1009-00003 — Đang sửa chữa",
    "after": "TN-2026-1009-00003 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "66"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933572"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": "TN-2026-1009-00003 — Chưa thu tiền",
    "after": "PT-2026-00003 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "67"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933585"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00003",
    "before": "TN-2026-1009-00003 — Hoàn thành",
    "after": "TN-2026-1009-00003 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "68"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933632"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000006",
    "before": null,
    "after": "TB-000006 — MONGO-MV0M2K2A-CHARGED — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "69"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933648"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": null,
    "after": "TN-2026-1009-00004 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "70"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933696"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "71"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933711"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": null,
    "after": "PKT-2026-00004 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "72"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933725"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "73"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933743"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "74"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933758"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00002",
    "before": null,
    "after": "TN-2026-1009-00004 — 660000"
  },
  {
    "_id": {
      "$numberLong": "75"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933772"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_LINES_UPDATED",
    "actionLabel": "Cập nhật chi tiết báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00002",
    "before": "660000",
    "after": "660000"
  },
  {
    "_id": {
      "$numberLong": "76"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933789"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00002",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "77"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933804"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "Khách hàng demo",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00002",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "78"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933842"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00002",
    "before": null,
    "after": "TN-2026-1009-00004"
  },
  {
    "_id": {
      "$numberLong": "79"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933886"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00002",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "80"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933912"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": "TN-2026-1009-00004 — Đang sửa chữa",
    "after": "TN-2026-1009-00004 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "81"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933943"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": "TN-2026-1009-00004 — Chưa thu tiền",
    "after": "PT-2026-00004 — 660.000 đ"
  },
  {
    "_id": {
      "$numberLong": "82"
    },
    "at": {
      "$date": {
        "$numberLong": "1791528933956"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00004",
    "before": "TN-2026-1009-00004 — Hoàn thành",
    "after": "TN-2026-1009-00004 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "83"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529448709"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "84"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529449262"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "85"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529449648"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "86"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529450024"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "87"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529450383"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "88"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529450710"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "89"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529451033"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "90"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529451779"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000007",
    "before": null,
    "after": "TB-000007 — MONGO-MV0MDO0D-FREE — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "91"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529451871"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": null,
    "after": "TN-2026-1009-00005 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "92"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452016"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "93"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452059"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": null,
    "after": "PKT-2026-00005 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "94"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452094"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "95"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452120"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "96"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452153"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "97"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452194"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": "TN-2026-1009-00005 — Đang sửa chữa",
    "after": "TN-2026-1009-00005 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "98"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452284"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": "TN-2026-1009-00005 — Chưa thu tiền",
    "after": "PT-2026-00005 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "99"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452367"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00005",
    "before": "TN-2026-1009-00005 — Hoàn thành",
    "after": "TN-2026-1009-00005 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "100"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452482"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000008",
    "before": null,
    "after": "TB-000008 — MONGO-MV0MDO0D-CHARGED — KH-000001"
  }
], { relaxed: false }), { ordered: true });
  target.getCollection("audit_logs").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "101"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452500"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": null,
    "after": "TN-2026-1009-00006 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "102"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452562"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "103"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452593"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": null,
    "after": "PKT-2026-00006 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "104"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452605"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "105"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452626"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "106"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452699"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00003",
    "before": null,
    "after": "TN-2026-1009-00006 — 660000"
  },
  {
    "_id": {
      "$numberLong": "107"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452746"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_LINES_UPDATED",
    "actionLabel": "Cập nhật chi tiết báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00003",
    "before": "660000",
    "after": "660000"
  },
  {
    "_id": {
      "$numberLong": "108"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452781"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00003",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "109"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452845"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "Khách hàng demo",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00003",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "110"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529452936"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00003",
    "before": null,
    "after": "TN-2026-1009-00006"
  },
  {
    "_id": {
      "$numberLong": "111"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453020"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00003",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "112"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453064"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": "TN-2026-1009-00006 — Đang sửa chữa",
    "after": "TN-2026-1009-00006 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "113"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453125"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": "TN-2026-1009-00006 — Chưa thu tiền",
    "after": "PT-2026-00006 — 660.000 đ"
  },
  {
    "_id": {
      "$numberLong": "114"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453167"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00006",
    "before": "TN-2026-1009-00006 — Hoàn thành",
    "after": "TN-2026-1009-00006 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "115"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453541"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_CREATED",
    "actionLabel": "Tạo phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00001",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "116"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453590"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_UPDATED",
    "actionLabel": "Cập nhật phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00001",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "117"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453615"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_APPROVED",
    "actionLabel": "Duyệt và thực nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00001",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "118"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453656"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_CREATED",
    "actionLabel": "Tạo phiếu điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00001",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "119"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453700"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_APPROVED",
    "actionLabel": "Duyệt điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00001",
    "before": "PENDING",
    "after": "COMPLETED"
  },
  {
    "_id": {
      "$numberLong": "120"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529453943"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "WARRANTY_REQUEST_CANCELLED",
    "actionLabel": "Hủy yêu cầu bảo hành",
    "entityType": "WARRANTY_REQUEST",
    "entityId": "YC-2026-1009-00001",
    "before": "PENDING_INTAKE",
    "after": "CANCELLED"
  },
  {
    "_id": {
      "$numberLong": "121"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529573929"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "122"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529574171"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "123"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529574457"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "124"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529574716"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "125"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529574983"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "126"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575225"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "127"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575494"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "128"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575742"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000009",
    "before": null,
    "after": "TB-000009 — MONGO-MV0MGBP2-FREE — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "129"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575757"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": null,
    "after": "TN-2026-1009-00007 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "130"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575789"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "131"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575805"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": null,
    "after": "PKT-2026-00007 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "132"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575819"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "133"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575834"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "134"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575850"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "135"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575867"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": "TN-2026-1009-00007 — Đang sửa chữa",
    "after": "TN-2026-1009-00007 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "136"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575914"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": "TN-2026-1009-00007 — Chưa thu tiền",
    "after": "PT-2026-00007 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "137"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529575931"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00007",
    "before": "TN-2026-1009-00007 — Hoàn thành",
    "after": "TN-2026-1009-00007 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "138"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576003"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000010",
    "before": null,
    "after": "TB-000010 — MONGO-MV0MGBP2-CHARGED — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "139"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576016"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": null,
    "after": "TN-2026-1009-00008 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "140"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576061"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "141"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576084"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": null,
    "after": "PKT-2026-00008 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "142"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576099"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "143"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576114"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "144"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576131"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00004",
    "before": null,
    "after": "TN-2026-1009-00008 — 660000"
  },
  {
    "_id": {
      "$numberLong": "145"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576159"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_LINES_UPDATED",
    "actionLabel": "Cập nhật chi tiết báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00004",
    "before": "660000",
    "after": "660000"
  },
  {
    "_id": {
      "$numberLong": "146"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576178"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00004",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "147"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576215"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "Khách hàng demo",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00004",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "148"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576259"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00004",
    "before": null,
    "after": "TN-2026-1009-00008"
  },
  {
    "_id": {
      "$numberLong": "149"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576304"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00004",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "150"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576347"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": "TN-2026-1009-00008 — Đang sửa chữa",
    "after": "TN-2026-1009-00008 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "151"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576393"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": "TN-2026-1009-00008 — Chưa thu tiền",
    "after": "PT-2026-00008 — 660.000 đ"
  },
  {
    "_id": {
      "$numberLong": "152"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576410"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00008",
    "before": "TN-2026-1009-00008 — Hoàn thành",
    "after": "TN-2026-1009-00008 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "153"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576622"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_CREATED",
    "actionLabel": "Tạo phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00002",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "154"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576638"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_UPDATED",
    "actionLabel": "Cập nhật phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00002",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "155"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576655"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_APPROVED",
    "actionLabel": "Duyệt và thực nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00002",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "156"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576670"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_CREATED",
    "actionLabel": "Tạo phiếu điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00002",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "157"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576687"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_APPROVED",
    "actionLabel": "Duyệt điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00002",
    "before": "PENDING",
    "after": "COMPLETED"
  },
  {
    "_id": {
      "$numberLong": "158"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576812"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "WARRANTY_REQUEST_CANCELLED",
    "actionLabel": "Hủy yêu cầu bảo hành",
    "entityType": "WARRANTY_REQUEST",
    "entityId": "YC-2026-1009-00002",
    "before": "PENDING_INTAKE",
    "after": "CANCELLED"
  },
  {
    "_id": {
      "$numberLong": "159"
    },
    "at": {
      "$date": {
        "$numberLong": "1791529576908"
      }
    },
    "actorId": "1",
    "actorName": "1",
    "actorRoles": [
      "UNKNOWN"
    ],
    "action": "AUTH_REFRESH_REUSE_DETECTED",
    "actionLabel": "Phát hiện dùng lại refresh token",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "160"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530257528"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "161"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530257853"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "162"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530258172"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "163"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530258537"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "164"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530258885"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "165"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530259285"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "166"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530259625"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "167"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260147"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000011",
    "before": null,
    "after": "TB-000011 — MONGO-MV0MUZRC-FREE — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "168"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260286"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": null,
    "after": "TN-2026-1009-00009 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "169"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260418"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "170"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260461"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": null,
    "after": "PKT-2026-00009 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "171"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260492"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "172"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260516"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "173"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260548"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "174"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260589"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": "TN-2026-1009-00009 — Đang sửa chữa",
    "after": "TN-2026-1009-00009 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "175"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260681"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": "TN-2026-1009-00009 — Chưa thu tiền",
    "after": "PT-2026-00009 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "176"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260750"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00009",
    "before": "TN-2026-1009-00009 — Hoàn thành",
    "after": "TN-2026-1009-00009 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "177"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260888"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000012",
    "before": null,
    "after": "TB-000012 — MONGO-MV0MUZRC-CHARGED — KH-000001"
  },
  {
    "_id": {
      "$numberLong": "178"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260928"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": null,
    "after": "TN-2026-1009-00010 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "179"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530260977"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "180"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261001"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": null,
    "after": "PKT-2026-00010 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "181"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261013"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_CUSTOMER_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú cho khách",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": null,
    "after": "Đã kiểm tra thiết bị — dữ liệu demo"
  },
  {
    "_id": {
      "$numberLong": "182"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261030"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "TICKET_INTERNAL_NOTE_ADDED",
    "actionLabel": "Thêm ghi chú nội bộ",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": null,
    "after": "Ghi chú nội bộ kiểm thử MongoDB"
  },
  {
    "_id": {
      "$numberLong": "183"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261075"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00005",
    "before": null,
    "after": "TN-2026-1009-00010 — 660000"
  },
  {
    "_id": {
      "$numberLong": "184"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261119"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_LINES_UPDATED",
    "actionLabel": "Cập nhật chi tiết báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00005",
    "before": "660000",
    "after": "660000"
  },
  {
    "_id": {
      "$numberLong": "185"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261148"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00005",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "186"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261198"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "Khách hàng demo",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00005",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "187"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261294"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00005",
    "before": null,
    "after": "TN-2026-1009-00010"
  },
  {
    "_id": {
      "$numberLong": "188"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261346"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00005",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "189"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261386"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": "TN-2026-1009-00010 — Đang sửa chữa",
    "after": "TN-2026-1009-00010 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "190"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261444"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": "TN-2026-1009-00010 — Chưa thu tiền",
    "after": "PT-2026-00010 — 660.000 đ"
  },
  {
    "_id": {
      "$numberLong": "191"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261473"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00010",
    "before": "TN-2026-1009-00010 — Hoàn thành",
    "after": "TN-2026-1009-00010 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "192"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261750"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_CREATED",
    "actionLabel": "Tạo phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00003",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "193"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261783"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_UPDATED",
    "actionLabel": "Cập nhật phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00003",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "194"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261811"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_APPROVED",
    "actionLabel": "Duyệt và thực nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00003",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "195"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261850"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_CREATED",
    "actionLabel": "Tạo phiếu điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00003",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "196"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530261877"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_TRANSFER_APPROVED",
    "actionLabel": "Duyệt điều chuyển",
    "entityType": "STOCK_TRANSFER",
    "entityId": "DC-2026-00003",
    "before": "PENDING",
    "after": "COMPLETED"
  },
  {
    "_id": {
      "$numberLong": "197"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530262122"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "WARRANTY_REQUEST_CANCELLED",
    "actionLabel": "Hủy yêu cầu bảo hành",
    "entityType": "WARRANTY_REQUEST",
    "entityId": "YC-2026-1009-00003",
    "before": "PENDING_INTAKE",
    "after": "CANCELLED"
  },
  {
    "_id": {
      "$numberLong": "198"
    },
    "at": {
      "$date": {
        "$numberLong": "1791530262226"
      }
    },
    "actorId": "1",
    "actorName": "1",
    "actorRoles": [
      "UNKNOWN"
    ],
    "action": "AUTH_REFRESH_REUSE_DETECTED",
    "actionLabel": "Phát hiện dùng lại refresh token",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "199"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531515710"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "200"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531583410"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  }
], { relaxed: false }), { ordered: true });
  target.getCollection("audit_logs").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "201"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531585486"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "202"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531656518"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "203"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531677477"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "204"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531677737"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "205"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531678069"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "206"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531678313"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "207"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531678561"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "208"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531678781"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "209"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531679018"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "210"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531679251"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "211"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531679483"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "212"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531719937"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "213"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531761658"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "214"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531761957"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "215"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531762316"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "216"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531762649"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "217"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531762998"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "218"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531763332"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "219"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531763660"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "220"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531763960"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "221"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531780317"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "222"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531784622"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "223"
    },
    "at": {
      "$date": {
        "$numberLong": "1791531984609"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "224"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532030767"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "225"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532282694"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "226"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532800243"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_FAILED",
    "actionLabel": "Đăng nhập thất bại",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "227"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532800535"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "228"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532800856"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "229"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532801210"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "230"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532801528"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "231"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532801853"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "232"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802157"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "233"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802510"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "234"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802825"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "235"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802876"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "CUSTOMER_CREATED",
    "actionLabel": "Thêm khách hàng",
    "entityType": "CUSTOMER",
    "entityId": "KH-000002",
    "before": null,
    "after": "Nguyễn Minh Anh"
  },
  {
    "_id": {
      "$numberLong": "236"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802902"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "CUSTOMER_CREATED",
    "actionLabel": "Thêm khách hàng",
    "entityType": "CUSTOMER",
    "entityId": "KH-000003",
    "before": null,
    "after": "Trần Hoàng Nam"
  },
  {
    "_id": {
      "$numberLong": "237"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802917"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "CUSTOMER_CREATED",
    "actionLabel": "Thêm khách hàng",
    "entityType": "CUSTOMER",
    "entityId": "KH-000004",
    "before": null,
    "after": "Lê Ngọc Linh"
  },
  {
    "_id": {
      "$numberLong": "238"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532802995"
      }
    },
    "actorId": "NV-001",
    "actorName": "Quản trị demo",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "CATALOG_CREATED",
    "actionLabel": "Thêm danh mục",
    "entityType": "CATALOG:products",
    "entityId": "SP-0004",
    "before": null,
    "after": "SP-0004 — Dell Latitude 5420"
  },
  {
    "_id": {
      "$numberLong": "239"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803004"
      }
    },
    "actorId": "NV-001",
    "actorName": "Quản trị demo",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "CATALOG_CREATED",
    "actionLabel": "Thêm danh mục",
    "entityType": "CATALOG:products",
    "entityId": "SP-0005",
    "before": null,
    "after": "SP-0005 — Apple iPhone 13 128GB"
  },
  {
    "_id": {
      "$numberLong": "240"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803025"
      }
    },
    "actorId": "NV-001",
    "actorName": "Quản trị demo",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "CATALOG_CREATED",
    "actionLabel": "Thêm danh mục",
    "entityType": "CATALOG:products",
    "entityId": "SP-0006",
    "before": null,
    "after": "SP-0006 — Samsung Galaxy S23 256GB"
  },
  {
    "_id": {
      "$numberLong": "241"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803044"
      }
    },
    "actorId": "NV-001",
    "actorName": "Quản trị demo",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "CATALOG_CREATED",
    "actionLabel": "Thêm danh mục",
    "entityType": "CATALOG:parts",
    "entityId": "P3-MV0ODFHB-1",
    "before": null,
    "after": "P3-MV0ODFHB-1 — Pin Dell Latitude 5420 63Wh"
  },
  {
    "_id": {
      "$numberLong": "242"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803056"
      }
    },
    "actorId": "NV-001",
    "actorName": "Quản trị demo",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "CATALOG_CREATED",
    "actionLabel": "Thêm danh mục",
    "entityType": "CATALOG:parts",
    "entityId": "P3-MV0ODFHB-2",
    "before": null,
    "after": "P3-MV0ODFHB-2 — Màn hình Apple iPhone 13 OLED"
  },
  {
    "_id": {
      "$numberLong": "243"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803125"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_CREATED",
    "actionLabel": "Tạo phiếu nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00004",
    "before": null,
    "after": "PENDING"
  },
  {
    "_id": {
      "$numberLong": "244"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803155"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_RECEIPT_APPROVED",
    "actionLabel": "Duyệt và thực nhập kho",
    "entityType": "STOCK_RECEIPT",
    "entityId": "PN-2026-00004",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "245"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803258"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000013",
    "before": null,
    "after": "TB-000013 — DL5420-P3-MV0ODFHB — KH-000002"
  },
  {
    "_id": {
      "$numberLong": "246"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803332"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": null,
    "after": "TN-2026-1009-00011 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "247"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803423"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "248"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803477"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": null,
    "after": "PKT-2026-00011 — FREE_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "249"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803508"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_STARTED",
    "actionLabel": "Bắt đầu sửa chữa miễn phí",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "DIAGNOSED",
    "after": "REPAIRING"
  },
  {
    "_id": {
      "$numberLong": "250"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803547"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "TN-2026-1009-00011 — Đang sửa chữa",
    "after": "TN-2026-1009-00011 — Đang sửa chữa (KCS FAIL)"
  },
  {
    "_id": {
      "$numberLong": "251"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803564"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "TN-2026-1009-00011 — Đang sửa chữa",
    "after": "TN-2026-1009-00011 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "252"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803631"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_FREE_WARRANTY",
    "actionLabel": "Xác nhận miễn phí bảo hành",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "TN-2026-1009-00011 — Chưa thu tiền",
    "after": "PT-2026-00011 — 0 đ"
  },
  {
    "_id": {
      "$numberLong": "253"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532803697"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00011",
    "before": "TN-2026-1009-00011 — Hoàn thành",
    "after": "TN-2026-1009-00011 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "254"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532880812"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "255"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532881141"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "256"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532881463"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "257"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532881788"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "258"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532882156"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "259"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532882473"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "260"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532882812"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "261"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883114"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "262"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883139"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000014",
    "before": null,
    "after": "TB-000014 — 359915328831249 — KH-000003"
  },
  {
    "_id": {
      "$numberLong": "263"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883157"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": null,
    "after": "TN-2026-1009-00012 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "264"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883193"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "TICKET_ASSIGNED",
    "actionLabel": "Phân công kỹ thuật viên",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": "Chưa phân công",
    "after": "Kỹ thuật viên demo"
  },
  {
    "_id": {
      "$numberLong": "265"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883236"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "INSPECTION_RECORDED",
    "actionLabel": "Lưu kết quả kiểm tra",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": null,
    "after": "PKT-2026-00012 — OUT_OF_WARRANTY"
  },
  {
    "_id": {
      "$numberLong": "266"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883294"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "QUOTATION_CREATED",
    "actionLabel": "Lập báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00006",
    "before": null,
    "after": "TN-2026-1009-00012 — 1595000"
  },
  {
    "_id": {
      "$numberLong": "267"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532883338"
      }
    },
    "actorId": "NV-003",
    "actorName": "Điều phối demo",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "QUOTATION_APPROVED",
    "actionLabel": "Phê duyệt báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00006",
    "before": "PENDING",
    "after": "APPROVED"
  },
  {
    "_id": {
      "$numberLong": "268"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532936127"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "269"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532936421"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "270"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532984162"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "271"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532984488"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "272"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532984853"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "273"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532985217"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "274"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532985584"
      }
    },
    "actorId": "NV-007",
    "actorName": "technician2",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "7",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "275"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532985920"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "276"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986225"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "277"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986573"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "278"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986639"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "QUOTATION_ACCEPTED",
    "actionLabel": "Khách đồng ý báo giá",
    "entityType": "QUOTATION",
    "entityId": "BG-2026-1009-00006",
    "before": "PENDING",
    "after": "ACCEPT"
  },
  {
    "_id": {
      "$numberLong": "279"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986686"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "STOCK_ISSUE_REQUESTED",
    "actionLabel": "Gửi yêu cầu xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00006",
    "before": null,
    "after": "TN-2026-1009-00012"
  },
  {
    "_id": {
      "$numberLong": "280"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986737"
      }
    },
    "actorId": "NV-005",
    "actorName": "Thủ kho demo",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "STOCK_ISSUE_APPROVED",
    "actionLabel": "Duyệt và thực xuất kho",
    "entityType": "STOCK_ISSUE",
    "entityId": "PX-2026-00006",
    "before": "PENDING",
    "after": "ISSUED"
  },
  {
    "_id": {
      "$numberLong": "281"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986758"
      }
    },
    "actorId": "NV-004",
    "actorName": "Kỹ thuật viên demo",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "REPAIR_RESULT_RECORDED",
    "actionLabel": "Ghi kết quả sửa chữa và KCS",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": "TN-2026-1009-00012 — Đang sửa chữa",
    "after": "TN-2026-1009-00012 — Hoàn thành (KCS PASS)"
  },
  {
    "_id": {
      "$numberLong": "282"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986801"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "PAYMENT_COLLECTED",
    "actionLabel": "Thu tiền",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": "TN-2026-1009-00012 — Chưa thu tiền",
    "after": "PT-2026-00012 — 1.595.000 đ"
  },
  {
    "_id": {
      "$numberLong": "283"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986827"
      }
    },
    "actorId": "NV-006",
    "actorName": "Thu ngân demo",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "TICKET_HANDED_OVER",
    "actionLabel": "Bàn giao thiết bị",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00012",
    "before": "TN-2026-1009-00012 — Hoàn thành",
    "after": "TN-2026-1009-00012 — Đã bàn giao"
  },
  {
    "_id": {
      "$numberLong": "284"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986893"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "DEVICE_REGISTERED",
    "actionLabel": "Đăng ký thiết bị",
    "entityType": "DEVICE",
    "entityId": "TB-000015",
    "before": null,
    "after": "TB-000015 — 358915329868829 — KH-000004"
  },
  {
    "_id": {
      "$numberLong": "285"
    },
    "at": {
      "$date": {
        "$numberLong": "1791532986911"
      }
    },
    "actorId": "NV-002",
    "actorName": "Lễ tân demo",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "TICKET_CREATED",
    "actionLabel": "Tạo phiếu tiếp nhận",
    "entityType": "TICKET",
    "entityId": "TN-2026-1009-00013",
    "before": null,
    "after": "TN-2026-1009-00013 — Chưa phân công"
  },
  {
    "_id": {
      "$numberLong": "286"
    },
    "at": {
      "$date": {
        "$numberLong": "1791533025359"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "287"
    },
    "at": {
      "$date": {
        "$numberLong": "1791533141382"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "288"
    },
    "at": {
      "$date": {
        "$numberLong": "1791533393334"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "289"
    },
    "at": {
      "$date": {
        "$numberLong": "1792078756651"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "290"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079048430"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "291"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079051751"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "292"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079055134"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "293"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079058573"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "294"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079061919"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "295"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079065332"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "296"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079088099"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "297"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079096799"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "298"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079102349"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "299"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079114810"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "300"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079120287"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  }
], { relaxed: false }), { ordered: true });
  target.getCollection("audit_logs").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "301"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079128794"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "302"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079207459"
      }
    },
    "actorId": "NV-001",
    "actorName": "admin",
    "actorRoles": [
      "ADMIN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "1",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "303"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079251991"
      }
    },
    "actorId": "NV-002",
    "actorName": "receptionist",
    "actorRoles": [
      "RECEPTIONIST"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "2",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "304"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079290667"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "305"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079310214"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "306"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079319749"
      }
    },
    "actorId": "NV-005",
    "actorName": "warehouse",
    "actorRoles": [
      "WAREHOUSE_KEEPER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "5",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "307"
    },
    "at": {
      "$date": {
        "$numberLong": "1792079335513"
      }
    },
    "actorId": "NV-006",
    "actorName": "cashier",
    "actorRoles": [
      "CASHIER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "6",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "308"
    },
    "at": {
      "$date": {
        "$numberLong": "1793185855423"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "309"
    },
    "at": {
      "$date": {
        "$numberLong": "1793185897513"
      }
    },
    "actorId": "NV-004",
    "actorName": "technician",
    "actorRoles": [
      "TECHNICIAN"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "4",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "310"
    },
    "at": {
      "$date": {
        "$numberLong": "1793185923161"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "311"
    },
    "at": {
      "$date": {
        "$numberLong": "1793186543786"
      }
    },
    "actorId": "KH:KH-000001",
    "actorName": "0900000001",
    "actorRoles": [
      "CUSTOMER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "8",
    "before": null,
    "after": null
  },
  {
    "_id": {
      "$numberLong": "312"
    },
    "at": {
      "$date": {
        "$numberLong": "1793186933032"
      }
    },
    "actorId": "NV-003",
    "actorName": "dispatcher",
    "actorRoles": [
      "DISPATCHER"
    ],
    "action": "AUTH_LOGIN_SUCCESS",
    "actionLabel": "Đăng nhập thành công",
    "entityType": "ACCOUNT",
    "entityId": "3",
    "before": null,
    "after": null
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("audit_logs").countDocuments({}) !== 312) throw new Error("Count mismatch: audit_logs");

  // Collection: brands (3 documents in source).
  target.createCollection("brands", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("brands").insertMany(EJSON.deserialize([
  {
    "_id": "APPLE",
    "name": "Apple",
    "active": true,
    "categoryCodes": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ]
  },
  {
    "_id": "DELL",
    "name": "Dell",
    "active": true,
    "categoryCodes": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ]
  },
  {
    "_id": "SAMSUNG",
    "name": "Samsung",
    "active": true,
    "categoryCodes": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ]
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("brands").countDocuments({}) !== 3) throw new Error("Count mismatch: brands");

  // Collection: counters (23 documents in source).
  target.createCollection("counters", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("counters").insertMany(EJSON.deserialize([
  {
    "_id": "BG-2026-1009",
    "value": {
      "$numberLong": "6"
    }
  },
  {
    "_id": "CS",
    "value": {
      "$numberLong": "1"
    }
  },
  {
    "_id": "DC-2026",
    "value": {
      "$numberLong": "3"
    }
  },
  {
    "_id": "KH",
    "value": {
      "$numberLong": "4"
    }
  },
  {
    "_id": "KQ-2026",
    "value": {
      "$numberLong": "13"
    }
  },
  {
    "_id": "NCC",
    "value": {
      "$numberLong": "1"
    }
  },
  {
    "_id": "NV",
    "value": {
      "$numberLong": "7"
    }
  },
  {
    "_id": "PBG-2026",
    "value": {
      "$numberLong": "12"
    }
  },
  {
    "_id": "PC-2026",
    "value": {
      "$numberLong": "12"
    }
  },
  {
    "_id": "PKT-2026",
    "value": {
      "$numberLong": "12"
    }
  },
  {
    "_id": "PN-2026",
    "value": {
      "$numberLong": "4"
    }
  },
  {
    "_id": "PSC-2026",
    "value": {
      "$numberLong": "12"
    }
  },
  {
    "_id": "PT-2026",
    "value": {
      "$numberLong": "12"
    }
  },
  {
    "_id": "PX-2026",
    "value": {
      "$numberLong": "6"
    }
  },
  {
    "_id": "SP",
    "value": {
      "$numberLong": "6"
    }
  },
  {
    "_id": "TB",
    "value": {
      "$numberLong": "15"
    }
  },
  {
    "_id": "TN-2026-1009",
    "value": {
      "$numberLong": "13"
    }
  },
  {
    "_id": "YC-2026-1009",
    "value": {
      "$numberLong": "3"
    }
  },
  {
    "_id": "accounts",
    "value": {
      "$numberLong": "8"
    }
  },
  {
    "_id": "attachments",
    "value": {
      "$numberLong": "15"
    }
  },
  {
    "_id": "audit_logs",
    "value": {
      "$numberLong": "312"
    }
  },
  {
    "_id": "notifications",
    "value": {
      "$numberLong": "120"
    }
  },
  {
    "_id": "refresh_tokens",
    "value": {
      "$numberLong": "125"
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("counters").countDocuments({}) !== 23) throw new Error("Count mismatch: counters");

  // Collection: customers (4 documents in source).
  target.createCollection("customers", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("customers").createIndex(EJSON.deserialize({
  "accountId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "customer_account",
  "unique": true,
  "partialFilterExpression": {
    "accountId": {
      "$type": "long"
    }
  }
}, { relaxed: false }));
  target.getCollection("customers").createIndex(EJSON.deserialize({
  "phone": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "customer_phone",
  "unique": true,
  "partialFilterExpression": {
    "status": "ACTIVE"
  }
}, { relaxed: false }));
  target.getCollection("customers").insertMany(EJSON.deserialize([
  {
    "_id": "KH-000001",
    "fullName": "Khách hàng demo",
    "phone": "0900000001",
    "email": "customer@example.invalid",
    "address": "Dữ liệu mẫu phát triển",
    "accountId": {
      "$numberLong": "8"
    },
    "status": "ACTIVE",
    "mergedInto": null,
    "createdAt": {
      "$date": {
        "$numberLong": "1791528393385"
      }
    }
  },
  {
    "_id": "KH-000002",
    "fullName": "Nguyễn Minh Anh",
    "phone": "0909028431",
    "email": "phase3.mv0odfhb.1@example.invalid",
    "address": "12 đường Nguyễn Văn Cừ, Quận 5, TP.HCM (kiểm thử)",
    "accountId": null,
    "status": "ACTIVE",
    "mergedInto": null,
    "createdAt": {
      "$date": {
        "$numberLong": "1791532802871"
      }
    }
  },
  {
    "_id": "KH-000003",
    "fullName": "Trần Hoàng Nam",
    "phone": "0909028432",
    "email": "phase3.mv0odfhb.2@example.invalid",
    "address": "45 đường Lê Văn Sỹ, Quận 3, TP.HCM (kiểm thử)",
    "accountId": null,
    "status": "ACTIVE",
    "mergedInto": null,
    "createdAt": {
      "$date": {
        "$numberLong": "1791532802901"
      }
    }
  },
  {
    "_id": "KH-000004",
    "fullName": "Lê Ngọc Linh",
    "phone": "0909028433",
    "email": "phase3.mv0odfhb.3@example.invalid",
    "address": "28 đường Võ Văn Ngân, TP. Thủ Đức, TP.HCM (kiểm thử)",
    "accountId": null,
    "status": "ACTIVE",
    "mergedInto": null,
    "createdAt": {
      "$date": {
        "$numberLong": "1791532802916"
      }
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("customers").countDocuments({}) !== 4) throw new Error("Count mismatch: customers");

  // Collection: device_categories (6 documents in source).
  target.createCollection("device_categories", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("device_categories").createIndex(EJSON.deserialize({
  "deviceTypes.code": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "device_type_code",
  "unique": true,
  "partialFilterExpression": {
    "deviceTypes.code": {
      "$type": "string"
    }
  }
}, { relaxed: false }));
  target.getCollection("device_categories").insertMany(EJSON.deserialize([
  {
    "_id": "AUDIO",
    "name": "Âm thanh",
    "sortOrder": {
      "$numberInt": "5"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "AUDIO_SERIAL",
        "name": "Âm thanh",
        "identifierType": "SERIAL",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  },
  {
    "_id": "HOME",
    "name": "Gia dụng",
    "sortOrder": {
      "$numberInt": "6"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "HOME_SERIAL",
        "name": "Gia dụng",
        "identifierType": "SERIAL",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  },
  {
    "_id": "LAPTOP",
    "name": "Laptop",
    "sortOrder": {
      "$numberInt": "2"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "LAPTOP_SERIAL",
        "name": "Laptop",
        "identifierType": "SERIAL",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  },
  {
    "_id": "PHONE",
    "name": "Điện thoại",
    "sortOrder": {
      "$numberInt": "1"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "PHONE_IMEI",
        "name": "Điện thoại",
        "identifierType": "IMEI",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  },
  {
    "_id": "TABLET",
    "name": "Máy tính bảng",
    "sortOrder": {
      "$numberInt": "3"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "TABLET_SERIAL",
        "name": "Máy tính bảng",
        "identifierType": "SERIAL",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  },
  {
    "_id": "TV",
    "name": "Tivi",
    "sortOrder": {
      "$numberInt": "4"
    },
    "active": true,
    "deviceTypes": [
      {
        "code": "TV_SERIAL",
        "name": "Tivi",
        "identifierType": "SERIAL",
        "diagnosticChecklist": [
          "Ngoại quan",
          "Nguồn",
          "Chức năng chính"
        ]
      }
    ]
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("device_categories").countDocuments({}) !== 6) throw new Error("Count mismatch: device_categories");

  // Collection: devices (15 documents in source).
  target.createCollection("devices", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("devices").createIndex(EJSON.deserialize({
  "customerId": {
    "$numberInt": "1"
  },
  "createdAt": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "device_customer"
}, { relaxed: false }));
  target.getCollection("devices").createIndex(EJSON.deserialize({
  "serialNormalized": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "device_serial",
  "unique": true
}, { relaxed: false }));
  target.getCollection("devices").insertMany(EJSON.deserialize([
  {
    "_id": "TB-000001",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "SOOPI-DEMO-001",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-09-09",
    "warrantyExpiresOn": "2027-09-09",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528393385"
      }
    }
  },
  {
    "_id": "TB-000002",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "SOOPI-DEMO-002",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2024-10-09",
    "warrantyExpiresOn": "2025-10-09",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528393385"
      }
    }
  },
  {
    "_id": "TB-000003",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0M0G24-FREE",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-10-09",
    "warrantyExpiresOn": "2030-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528834929"
      }
    }
  },
  {
    "_id": "TB-000004",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0M0G24-CHARGED",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2020-01-01",
    "warrantyExpiresOn": "2021-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835630"
      }
    }
  },
  {
    "_id": "TB-000005",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0M2K2A-FREE",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-10-09",
    "warrantyExpiresOn": "2030-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933400"
      }
    }
  },
  {
    "_id": "TB-000006",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0M2K2A-CHARGED",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2020-01-01",
    "warrantyExpiresOn": "2021-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933631"
      }
    }
  },
  {
    "_id": "TB-000007",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MDO0D-FREE",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-10-09",
    "warrantyExpiresOn": "2030-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529451772"
      }
    }
  },
  {
    "_id": "TB-000008",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MDO0D-CHARGED",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2020-01-01",
    "warrantyExpiresOn": "2021-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452481"
      }
    }
  },
  {
    "_id": "TB-000009",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MGBP2-FREE",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-10-09",
    "warrantyExpiresOn": "2030-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575741"
      }
    }
  },
  {
    "_id": "TB-000010",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MGBP2-CHARGED",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2020-01-01",
    "warrantyExpiresOn": "2021-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576002"
      }
    }
  },
  {
    "_id": "TB-000011",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MUZRC-FREE",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2026-10-09",
    "warrantyExpiresOn": "2030-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260144"
      }
    }
  },
  {
    "_id": "TB-000012",
    "productId": "SP-0003",
    "identifierType": "SERIAL",
    "serialNormalized": "MONGO-MV0MUZRC-CHARGED",
    "customerId": "KH-000001",
    "warrantyActivatedOn": "2020-01-01",
    "warrantyExpiresOn": "2021-01-01",
    "distributor": "Soopi demo",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260887"
      }
    }
  },
  {
    "_id": "TB-000013",
    "productId": "SP-0004",
    "identifierType": "SERIAL",
    "serialNormalized": "DL5420-P3-MV0ODFHB",
    "customerId": "KH-000002",
    "warrantyActivatedOn": "2026-05-20",
    "warrantyExpiresOn": "2027-05-20",
    "distributor": "Soopi kiểm thử",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532803255"
      }
    }
  },
  {
    "_id": "TB-000014",
    "productId": "SP-0005",
    "identifierType": "IMEI",
    "serialNormalized": "359915328831249",
    "customerId": "KH-000003",
    "warrantyActivatedOn": "2024-06-15",
    "warrantyExpiresOn": "2025-06-15",
    "distributor": "Soopi kiểm thử",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883138"
      }
    }
  },
  {
    "_id": "TB-000015",
    "productId": "SP-0006",
    "identifierType": "IMEI",
    "serialNormalized": "358915329868829",
    "customerId": "KH-000004",
    "warrantyActivatedOn": "2026-03-10",
    "warrantyExpiresOn": "2027-03-10",
    "distributor": null,
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986892"
      }
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("devices").countDocuments({}) !== 15) throw new Error("Count mismatch: devices");

  // Collection: employees (7 documents in source).
  target.createCollection("employees", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("employees").createIndex(EJSON.deserialize({
  "accountId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "employee_account",
  "unique": true,
  "partialFilterExpression": {
    "accountId": {
      "$type": "long"
    }
  }
}, { relaxed: false }));
  target.getCollection("employees").insertMany(EJSON.deserialize([
  {
    "_id": "NV-001",
    "fullName": "Quản trị demo",
    "phone": "0900000101",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "1"
    }
  },
  {
    "_id": "NV-002",
    "fullName": "Lễ tân demo",
    "phone": "0900000102",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "2"
    }
  },
  {
    "_id": "NV-003",
    "fullName": "Điều phối demo",
    "phone": "0900000103",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "3"
    }
  },
  {
    "_id": "NV-004",
    "fullName": "Kỹ thuật viên demo",
    "phone": "0900000104",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "4"
    }
  },
  {
    "_id": "NV-005",
    "fullName": "Thủ kho demo",
    "phone": "0900000105",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "5"
    }
  },
  {
    "_id": "NV-006",
    "fullName": "Thu ngân demo",
    "phone": "0900000106",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "6"
    }
  },
  {
    "_id": "NV-007",
    "fullName": "Kỹ thuật viên 2 demo",
    "phone": "0900000107",
    "email": null,
    "specialty": "Demo",
    "skills": [
      "PHONE",
      "LAPTOP",
      "TABLET",
      "TV",
      "AUDIO",
      "HOME"
    ],
    "maxActiveTickets": {
      "$numberInt": "10"
    },
    "onSite": true,
    "workStatus": "ACTIVE",
    "stationCode": "TRAM-01",
    "accountId": {
      "$numberLong": "7"
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("employees").countDocuments({}) !== 7) throw new Error("Count mismatch: employees");

  // Collection: notifications (120 documents in source).
  target.createCollection("notifications", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("notifications").createIndex(EJSON.deserialize({
  "accountId": {
    "$numberInt": "1"
  },
  "createdAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "notification_account"
}, { relaxed: false }));
  target.getCollection("notifications").createIndex(EJSON.deserialize({
  "role": {
    "$numberInt": "1"
  },
  "createdAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "notification_role"
}, { relaxed: false }));
  target.getCollection("notifications").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "1"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00001 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835044"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "2"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00001.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835055"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "3"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00001.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835190"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "4"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00001 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00001",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835360"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "5"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00001 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00001",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835361"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "6"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00001 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835363"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "7"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00001. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835518"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "8"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00002 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835640"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "9"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00002.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835642"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "10"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00002.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835695"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "11"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00001 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835787"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "12"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00001 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835887"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "13"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "QUOTATION_AWAITING_CUSTOMER",
    "message": "Báo giá BG-2026-1009-00001 cho phiếu TN-2026-1009-00002 đang chờ xác nhận.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835889"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "14"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00001.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835928"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "15"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00001 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836002"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "16"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00001 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00002",
    "entityId": "PX-2026-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836071"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "17"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00002 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00002",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836108"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "18"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00002 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00002",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836109"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "19"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00002 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836111"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "20"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00002. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528836177"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "21"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00003 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933423"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "22"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00003.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933426"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "23"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00003.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933469"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "24"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00003 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00003",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933542"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "25"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00003 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00003",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933543"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "26"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00003 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933544"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "27"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00003. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933587"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "28"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00004 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933649"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "29"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00004.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933650"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "30"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00004.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933696"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "31"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00002 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933759"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "32"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00002 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933790"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "33"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "QUOTATION_AWAITING_CUSTOMER",
    "message": "Báo giá BG-2026-1009-00002 cho phiếu TN-2026-1009-00004 đang chờ xác nhận.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933792"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "34"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00002.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933805"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "35"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00002 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933843"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "36"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00002 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00004",
    "entityId": "PX-2026-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933887"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "37"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00004 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00004",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933913"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "38"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00004 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00004",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933913"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "39"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00004 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933916"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "40"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00004. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933958"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "41"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00005 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529451874"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "42"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00005.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529451887"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "43"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00005.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452017"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "44"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00005 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00005",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452195"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "45"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00005 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00005",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452196"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "46"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00005 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452199"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "47"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00005. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452371"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "48"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00006 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452501"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "49"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00006.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452503"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "50"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00006.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452563"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "51"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00003 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452700"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "52"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00003 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452782"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "53"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "QUOTATION_AWAITING_CUSTOMER",
    "message": "Báo giá BG-2026-1009-00003 cho phiếu TN-2026-1009-00006 đang chờ xác nhận.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452785"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "54"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00003.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452847"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "55"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00003 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452937"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "56"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00003 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00006",
    "entityId": "PX-2026-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453021"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "57"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00006 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00006",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453065"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "58"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00006 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00006",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453066"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "59"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00006 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453068"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "60"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00006. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453169"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "61"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "WARRANTY_REQUEST_NEW",
    "message": "Có yêu cầu bảo hành trực tuyến mới YC-2026-1009-00001.",
    "link": "/receptionist#YC-2026-1009-00001",
    "entityId": "YC-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453780"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "62"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "WARRANTY_REQUEST_CANCELLED",
    "message": "Yêu cầu bảo hành YC-2026-1009-00001 đã bị hủy: Hoàn tất kiểm thử demo",
    "link": "/portal",
    "entityId": "YC-2026-1009-00001",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453949"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "63"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00007 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575758"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "64"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00007.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575760"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "65"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00007.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575790"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "66"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00007 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00007",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575867"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "67"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00007 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00007",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575868"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "68"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00007 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575870"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "69"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00007. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00007",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529575933"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "70"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00008 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576017"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "71"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00008.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576019"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "72"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00008.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576062"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "73"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00004 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576132"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "74"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00004 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576178"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "75"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "QUOTATION_AWAITING_CUSTOMER",
    "message": "Báo giá BG-2026-1009-00004 cho phiếu TN-2026-1009-00008 đang chờ xác nhận.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576180"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "76"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00004.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576216"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "77"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00004 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576260"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "78"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00004 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00008",
    "entityId": "PX-2026-00004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576305"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "79"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00008 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00008",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576347"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "80"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00008 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00008",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576348"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "81"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00008 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576350"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "82"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00008. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00008",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576412"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "83"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "WARRANTY_REQUEST_NEW",
    "message": "Có yêu cầu bảo hành trực tuyến mới YC-2026-1009-00002.",
    "link": "/receptionist#YC-2026-1009-00002",
    "entityId": "YC-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576733"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "84"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "WARRANTY_REQUEST_CANCELLED",
    "message": "Yêu cầu bảo hành YC-2026-1009-00002 đã bị hủy: Hoàn tất kiểm thử demo",
    "link": "/portal",
    "entityId": "YC-2026-1009-00002",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576815"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "85"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00009 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260288"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "86"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00009.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260303"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "87"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00009.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260419"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "88"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00009 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00009",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260590"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "89"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00009 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00009",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260591"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "90"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00009 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260594"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "91"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00009. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00009",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260752"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "92"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00010 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260929"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "93"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_RECEIVED",
    "message": "Đã tiếp nhận thiết bị. Mã phiếu TN-2026-1009-00010.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260931"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "94"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00010.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530260978"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "95"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00005 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261075"
      }
    },
    "readBy": [
      {
        "$numberLong": "3"
      }
    ]
  },
  {
    "_id": {
      "$numberLong": "96"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00005 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261149"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "97"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "QUOTATION_AWAITING_CUSTOMER",
    "message": "Báo giá BG-2026-1009-00005 cho phiếu TN-2026-1009-00010 đang chờ xác nhận.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261151"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "98"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00005.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261201"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "99"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00005 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261294"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "100"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00005 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00010",
    "entityId": "PX-2026-00005",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261347"
      }
    },
    "readBy": []
  }
], { relaxed: false }), { ordered: true });
  target.getCollection("notifications").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "101"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00010 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00010",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261387"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "102"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00010 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00010",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261387"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "103"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_COMPLETED",
    "message": "Thiết bị của phiếu TN-2026-1009-00010 đã sửa xong, sẵn sàng nhận máy tại trung tâm.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261389"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "104"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "TICKET_HANDED_OVER",
    "message": "Đã bàn giao thiết bị của phiếu TN-2026-1009-00010. Cảm ơn đã tin dùng dịch vụ.",
    "link": "/portal",
    "entityId": "TN-2026-1009-00010",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261475"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "105"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "WARRANTY_REQUEST_NEW",
    "message": "Có yêu cầu bảo hành trực tuyến mới YC-2026-1009-00003.",
    "link": "/receptionist#YC-2026-1009-00003",
    "entityId": "YC-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261947"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "106"
    },
    "role": null,
    "accountId": {
      "$numberLong": "8"
    },
    "type": "WARRANTY_REQUEST_CANCELLED",
    "message": "Yêu cầu bảo hành YC-2026-1009-00003 đã bị hủy: Hoàn tất kiểm thử demo",
    "link": "/portal",
    "entityId": "YC-2026-1009-00003",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530262127"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "107"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00011 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00011",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532803334"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "108"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00011.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00011",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532803423"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "109"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00011 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00011",
    "entityId": "TN-2026-1009-00011",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532803565"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "110"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00011 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00011",
    "entityId": "TN-2026-1009-00011",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532803565"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "111"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00012 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00012",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883157"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "112"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "TICKET_ASSIGNED",
    "message": "Bạn được giao phiếu TN-2026-1009-00012.",
    "link": "/technician",
    "entityId": "TN-2026-1009-00012",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883193"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "113"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "QUOTATION_PENDING",
    "message": "Báo giá BG-2026-1009-00006 đang chờ phê duyệt.",
    "link": "/dispatch#quotes",
    "entityId": "BG-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883295"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "114"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "QUOTATION_APPROVED",
    "message": "Báo giá BG-2026-1009-00006 đã được duyệt, chờ khách xác nhận.",
    "link": "/receptionist",
    "entityId": "BG-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883338"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "115"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "QUOTATION_ACCEPTED",
    "message": "Khách đã đồng ý báo giá BG-2026-1009-00006.",
    "link": "/technician",
    "entityId": "BG-2026-1009-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986641"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "116"
    },
    "role": "WAREHOUSE_KEEPER",
    "accountId": null,
    "type": "STOCK_ISSUE_PENDING",
    "message": "Yêu cầu xuất kho PX-2026-00006 đang chờ xử lý.",
    "link": "/warehouse#stockout",
    "entityId": "PX-2026-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986687"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "117"
    },
    "role": null,
    "accountId": {
      "$numberLong": "4"
    },
    "type": "STOCK_ISSUE_APPROVED",
    "message": "Yêu cầu xuất kho PX-2026-00006 đã được duyệt.",
    "link": "/technician#TN-2026-1009-00012",
    "entityId": "PX-2026-00006",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986738"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "118"
    },
    "role": "CASHIER",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00012 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00012",
    "entityId": "TN-2026-1009-00012",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986759"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "119"
    },
    "role": "RECEPTIONIST",
    "accountId": null,
    "type": "TICKET_COMPLETED",
    "message": "Phiếu TN-2026-1009-00012 đã hoàn tất sửa chữa, sẵn sàng bàn giao.",
    "link": "/cashier#TN-2026-1009-00012",
    "entityId": "TN-2026-1009-00012",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986759"
      }
    },
    "readBy": []
  },
  {
    "_id": {
      "$numberLong": "120"
    },
    "role": "DISPATCHER",
    "accountId": null,
    "type": "TICKET_RECEIVED",
    "message": "Phiếu TN-2026-1009-00013 mới tiếp nhận, chờ phân công.",
    "link": "/dispatch",
    "entityId": "TN-2026-1009-00013",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532986911"
      }
    },
    "readBy": []
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("notifications").countDocuments({}) !== 120) throw new Error("Count mismatch: notifications");

  // Collection: otp_codes (0 documents in source).
  target.createCollection("otp_codes", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("otp_codes").createIndex(EJSON.deserialize({
  "phone": {
    "$numberInt": "1"
  },
  "purpose": {
    "$numberInt": "1"
  },
  "createdAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "otp_pending"
}, { relaxed: false }));
  if (target.getCollection("otp_codes").countDocuments({}) !== 0) throw new Error("Count mismatch: otp_codes");

  // Collection: parts (5 documents in source).
  target.createCollection("parts", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("parts").insertMany(EJSON.deserialize([
  {
    "_id": "LK-CABLE",
    "name": "Cáp sạc — demo",
    "unit": "Cái",
    "categoryCode": "PHONE",
    "brandName": "Demo",
    "costPrice": {
      "$numberDecimal": "50000"
    },
    "servicePrice": {
      "$numberDecimal": "100000"
    },
    "onHand": {
      "$numberInt": "29"
    },
    "reserved": {
      "$numberInt": "0"
    },
    "minLevel": {
      "$numberInt": "5"
    },
    "primaryBin": "A3",
    "bins": [
      {
        "binCode": "A3",
        "qty": {
          "$numberInt": "26"
        }
      },
      {
        "binCode": "DEMO-MV0MDO0D",
        "qty": {
          "$numberInt": "1"
        }
      },
      {
        "binCode": "DEMO-MV0MGBP2",
        "qty": {
          "$numberInt": "1"
        }
      },
      {
        "binCode": "DEMO-MV0MUZRC",
        "qty": {
          "$numberInt": "1"
        }
      }
    ],
    "warrantyMonths": {
      "$numberInt": "6"
    },
    "supplierId": "NCC-001",
    "active": true,
    "version": {
      "$numberInt": "6"
    }
  },
  {
    "_id": "LK-PIN",
    "name": "Pin laptop — demo",
    "unit": "Cái",
    "categoryCode": "LAPTOP",
    "brandName": "Demo",
    "costPrice": {
      "$numberDecimal": "300000"
    },
    "servicePrice": {
      "$numberDecimal": "450000"
    },
    "onHand": {
      "$numberInt": "15"
    },
    "reserved": {
      "$numberInt": "0"
    },
    "minLevel": {
      "$numberInt": "5"
    },
    "primaryBin": "A1",
    "bins": [
      {
        "binCode": "A1",
        "qty": {
          "$numberInt": "15"
        }
      }
    ],
    "warrantyMonths": {
      "$numberInt": "6"
    },
    "supplierId": "NCC-001",
    "active": true,
    "version": {
      "$numberInt": "10"
    }
  },
  {
    "_id": "LK-SCREEN",
    "name": "Màn hình — demo",
    "unit": "Cái",
    "categoryCode": "PHONE",
    "brandName": "Demo",
    "costPrice": {
      "$numberDecimal": "700000"
    },
    "servicePrice": {
      "$numberDecimal": "950000"
    },
    "onHand": {
      "$numberInt": "20"
    },
    "reserved": {
      "$numberInt": "0"
    },
    "minLevel": {
      "$numberInt": "5"
    },
    "primaryBin": "A2",
    "bins": [
      {
        "binCode": "A2",
        "qty": {
          "$numberInt": "20"
        }
      }
    ],
    "warrantyMonths": {
      "$numberInt": "6"
    },
    "supplierId": "NCC-001",
    "active": true,
    "version": {
      "$numberInt": "0"
    }
  },
  {
    "_id": "P3-MV0ODFHB-1",
    "active": true,
    "bins": [
      {
        "binCode": "P3-A1",
        "qty": {
          "$numberInt": "5"
        }
      }
    ],
    "brandName": "Dell",
    "categoryCode": "LAPTOP",
    "costPrice": {
      "$numberDecimal": "650000"
    },
    "minLevel": {
      "$numberInt": "2"
    },
    "name": "Pin Dell Latitude 5420 63Wh",
    "onHand": {
      "$numberInt": "5"
    },
    "primaryBin": "P3-A1",
    "reserved": {
      "$numberInt": "0"
    },
    "servicePrice": {
      "$numberDecimal": "900000"
    },
    "supplierId": "NCC-001",
    "unit": "Cái",
    "version": {
      "$numberInt": "1"
    },
    "warrantyMonths": {
      "$numberInt": "6"
    }
  },
  {
    "_id": "P3-MV0ODFHB-2",
    "active": true,
    "bins": [
      {
        "binCode": "P3-A2",
        "qty": {
          "$numberInt": "4"
        }
      }
    ],
    "brandName": "Apple",
    "categoryCode": "PHONE",
    "costPrice": {
      "$numberDecimal": "850000"
    },
    "minLevel": {
      "$numberInt": "2"
    },
    "name": "Màn hình Apple iPhone 13 OLED",
    "onHand": {
      "$numberInt": "4"
    },
    "primaryBin": "P3-A2",
    "reserved": {
      "$numberInt": "0"
    },
    "servicePrice": {
      "$numberDecimal": "1300000"
    },
    "supplierId": "NCC-001",
    "unit": "Cái",
    "version": {
      "$numberInt": "3"
    },
    "warrantyMonths": {
      "$numberInt": "6"
    }
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("parts").countDocuments({}) !== 5) throw new Error("Count mismatch: parts");

  // Collection: payments (12 documents in source).
  target.createCollection("payments", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("payments").createIndex(EJSON.deserialize({
  "paidAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "payment_date"
}, { relaxed: false }));
  target.getCollection("payments").createIndex(EJSON.deserialize({
  "ticketId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "payment_ticket",
  "unique": true
}, { relaxed: false }));
  target.getCollection("payments").insertMany(EJSON.deserialize([
  {
    "_id": "PT-2026-00001",
    "ticketId": "TN-2026-1009-00001",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791528835430"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00002",
    "ticketId": "TN-2026-1009-00002",
    "quotationId": "BG-2026-1009-00001",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791528836151"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "660000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00003",
    "ticketId": "TN-2026-1009-00003",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791528933571"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00004",
    "ticketId": "TN-2026-1009-00004",
    "quotationId": "BG-2026-1009-00002",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791528933942"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "660000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00005",
    "ticketId": "TN-2026-1009-00005",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791529452278"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00006",
    "ticketId": "TN-2026-1009-00006",
    "quotationId": "BG-2026-1009-00003",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791529453124"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "660000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00007",
    "ticketId": "TN-2026-1009-00007",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791529575913"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00008",
    "ticketId": "TN-2026-1009-00008",
    "quotationId": "BG-2026-1009-00004",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791529576392"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "660000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00009",
    "ticketId": "TN-2026-1009-00009",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791530260677"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00010",
    "ticketId": "TN-2026-1009-00010",
    "quotationId": "BG-2026-1009-00005",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791530261443"
      }
    },
    "payerName": "Khách hàng demo",
    "amount": {
      "$numberDecimal": "660000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00011",
    "ticketId": "TN-2026-1009-00011",
    "quotationId": null,
    "type": "FREE_WARRANTY",
    "paidAt": {
      "$date": {
        "$numberLong": "1791532803627"
      }
    },
    "payerName": "Nguyễn Minh Anh",
    "amount": {
      "$numberDecimal": "0"
    },
    "method": "NONE",
    "cashierId": "NV-006",
    "note": null
  },
  {
    "_id": "PT-2026-00012",
    "ticketId": "TN-2026-1009-00012",
    "quotationId": "BG-2026-1009-00006",
    "type": "CHARGED",
    "paidAt": {
      "$date": {
        "$numberLong": "1791532986801"
      }
    },
    "payerName": "Trần Hoàng Nam",
    "amount": {
      "$numberDecimal": "1595000"
    },
    "method": "CASH",
    "cashierId": "NV-006",
    "note": null
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("payments").countDocuments({}) !== 12) throw new Error("Count mismatch: payments");

  // Collection: products (6 documents in source).
  target.createCollection("products", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("products").insertMany(EJSON.deserialize([
  {
    "_id": "SP-0001",
    "name": "iPhone — demo",
    "brandId": "APPLE",
    "deviceTypeCode": "PHONE_IMEI",
    "productLine": "Demo",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "active": true
  },
  {
    "_id": "SP-0002",
    "name": "Galaxy — demo",
    "brandId": "SAMSUNG",
    "deviceTypeCode": "PHONE_IMEI",
    "productLine": "Demo",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "active": true
  },
  {
    "_id": "SP-0003",
    "name": "Laptop Dell — demo",
    "brandId": "DELL",
    "deviceTypeCode": "LAPTOP_SERIAL",
    "productLine": "Demo",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "active": true
  },
  {
    "_id": "SP-0004",
    "active": true,
    "brandId": "DELL",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "deviceTypeCode": "LAPTOP_SERIAL",
    "name": "Dell Latitude 5420",
    "productLine": "Phase 3 kiểm thử"
  },
  {
    "_id": "SP-0005",
    "active": true,
    "brandId": "APPLE",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "deviceTypeCode": "PHONE_IMEI",
    "name": "Apple iPhone 13 128GB",
    "productLine": "Phase 3 kiểm thử"
  },
  {
    "_id": "SP-0006",
    "active": true,
    "brandId": "SAMSUNG",
    "defaultWarrantyMonths": {
      "$numberInt": "12"
    },
    "deviceTypeCode": "PHONE_IMEI",
    "name": "Samsung Galaxy S23 256GB",
    "productLine": "Phase 3 kiểm thử"
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("products").countDocuments({}) !== 6) throw new Error("Count mismatch: products");

  // Collection: push_devices (0 documents in source).
  target.createCollection("push_devices", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("push_devices").createIndex(EJSON.deserialize({
  "pushToken": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "push_token",
  "unique": true
}, { relaxed: false }));
  if (target.getCollection("push_devices").countDocuments({}) !== 0) throw new Error("Count mismatch: push_devices");

  // Collection: quotations (6 documents in source).
  target.createCollection("quotations", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("quotations").createIndex(EJSON.deserialize({
  "ticketId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "quote_active_ticket",
  "unique": true,
  "partialFilterExpression": {
    "approval.status": {
      "$in": [
        "PENDING",
        "APPROVED"
      ]
    }
  }
}, { relaxed: false }));
  target.getCollection("quotations").insertMany(EJSON.deserialize([
  {
    "_id": "BG-2026-1009-00001",
    "ticketId": "TN-2026-1009-00002",
    "inspectionCode": "PKT-2026-00002",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528835770"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "LK-PIN",
        "description": "Pin laptop — demo",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "450000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "450000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "660000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791528835883"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791528835923"
        }
      },
      "reason": null,
      "channel": "PORTAL",
      "recordedBy": "KH:KH-000001"
    },
    "Persisted": true
  },
  {
    "_id": "BG-2026-1009-00002",
    "ticketId": "TN-2026-1009-00004",
    "inspectionCode": "PKT-2026-00004",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791528933756"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "LK-PIN",
        "description": "Pin laptop — demo",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "450000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "450000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "660000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791528933788"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791528933802"
        }
      },
      "reason": null,
      "channel": "PORTAL",
      "recordedBy": "KH:KH-000001"
    },
    "Persisted": true
  },
  {
    "_id": "BG-2026-1009-00003",
    "ticketId": "TN-2026-1009-00006",
    "inspectionCode": "PKT-2026-00006",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529452683"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "LK-PIN",
        "description": "Pin laptop — demo",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "450000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "450000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "660000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791529452778"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791529452842"
        }
      },
      "reason": null,
      "channel": "PORTAL",
      "recordedBy": "KH:KH-000001"
    },
    "Persisted": true
  },
  {
    "_id": "BG-2026-1009-00004",
    "ticketId": "TN-2026-1009-00008",
    "inspectionCode": "PKT-2026-00008",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576128"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "LK-PIN",
        "description": "Pin laptop — demo",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "450000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "450000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "660000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791529576176"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791529576213"
        }
      },
      "reason": null,
      "channel": "PORTAL",
      "recordedBy": "KH:KH-000001"
    },
    "Persisted": true
  },
  {
    "_id": "BG-2026-1009-00005",
    "ticketId": "TN-2026-1009-00010",
    "inspectionCode": "PKT-2026-00010",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261060"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "LK-PIN",
        "description": "Pin laptop — demo",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "450000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "450000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "660000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791530261146"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791530261195"
        }
      },
      "reason": null,
      "channel": "PORTAL",
      "recordedBy": "KH:KH-000001"
    },
    "Persisted": true
  },
  {
    "_id": "BG-2026-1009-00006",
    "ticketId": "TN-2026-1009-00012",
    "inspectionCode": "PKT-2026-00012",
    "createdBy": "NV-004",
    "createdAt": {
      "$date": {
        "$numberLong": "1791532883281"
      }
    },
    "validUntil": null,
    "vatRate": {
      "$numberDecimal": "10"
    },
    "serviceFeeCode": null,
    "lines": [
      {
        "lineNo": {
          "$numberInt": "1"
        },
        "sku": "P3-MV0ODFHB-2",
        "description": "Màn hình Apple iPhone 13 OLED",
        "quantity": {
          "$numberInt": "1"
        },
        "unitPrice": {
          "$numberDecimal": "1300000"
        },
        "laborFee": {
          "$numberDecimal": "150000"
        }
      }
    ],
    "partsTotal": {
      "$numberDecimal": "1300000"
    },
    "laborTotal": {
      "$numberDecimal": "150000"
    },
    "grandTotal": {
      "$numberDecimal": "1595000"
    },
    "approval": {
      "status": "APPROVED",
      "reviewedBy": "NV-003",
      "reviewedAt": {
        "$date": {
          "$numberLong": "1791532883335"
        }
      },
      "note": null
    },
    "customerDecision": {
      "status": "ACCEPTED",
      "decidedAt": {
        "$date": {
          "$numberLong": "1791532986636"
        }
      },
      "reason": null,
      "channel": "COUNTER",
      "recordedBy": "NV-002"
    },
    "Persisted": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("quotations").countDocuments({}) !== 6) throw new Error("Count mismatch: quotations");

  // Collection: refresh_tokens (125 documents in source).
  target.createCollection("refresh_tokens", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("refresh_tokens").createIndex(EJSON.deserialize({
  "accountId": {
    "$numberInt": "1"
  },
  "revokedAt": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "refresh_account"
}, { relaxed: false }));
  target.getCollection("refresh_tokens").createIndex(EJSON.deserialize({
  "expiresAt": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "refresh_expiry"
}, { relaxed: false }));
  target.getCollection("refresh_tokens").createIndex(EJSON.deserialize({
  "familyId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "refresh_family"
}, { relaxed: false }));
  target.getCollection("refresh_tokens").createIndex(EJSON.deserialize({
  "tokenHash": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "refresh_hash",
  "unique": true
}, { relaxed: false }));
  target.getCollection("refresh_tokens").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "1"
    },
    "tokenHash": "79f3e8ee44830ed4da993ecbcd7a8cf507a1abe01d50fd182d25fd105a931d0a",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "00bc5d3c-b35c-4712-9316-fa9374263d7f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528500744"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571700744"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "2"
    },
    "tokenHash": "9f71a675177bd0f6bd4cebcbe75ccaeafbcef8ae8ab34a186c1bd21b3b0b40c6",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "f3411deb-1777-4986-8256-a9317be5a411",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528501279"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571701279"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "3"
    },
    "tokenHash": "cbfd32ef8b44c89f4976ed84a9464ec40fb48c8d023f44e43a9a95797b3ad902",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "5cb8edbe-3fc7-4d78-aa7e-b57cf6f02049",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528501604"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571701604"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "4"
    },
    "tokenHash": "0dd48b81c3a01ef0c1e898f9251f20d53b4bf16b6b6148aaff53b08f80f1aa34",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "dd8ae779-1dc9-4a8b-b2a8-a28cc8332fa8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528501918"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571701918"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "5"
    },
    "tokenHash": "0b4012ae10933debd9ba7b4dbf5ede9403f27778f12a8354712f013e7d0a2f37",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "a1926d40-045f-48c1-a672-ac28e65ced84",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528502274"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571702274"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "6"
    },
    "tokenHash": "02a20f25a4f1bc05b771e9b27e019220a6eb960605b98392e455ab767bb70ce3",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "a87d6a45-cd23-4031-bf37-c59f3e8dd010",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528502606"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571702606"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "7"
    },
    "tokenHash": "8e08ab08bdc3e4b55a0a7e28ea4f67b4c108ef58e142e7ad863edb0dcce99dcd",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "c543c762-74f9-4c41-b39a-9e5ef08fa978",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528502919"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571702919"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "8"
    },
    "tokenHash": "e9350b57d9f5d774742d511e1073dbb832b80f6e4c30f101eb615c0ef354cf7d",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "655d7b12-9a1e-40c7-8e3b-09b923e5d602",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528541016"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571741016"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "9"
    },
    "tokenHash": "99f2d631b887198424845db3114129b5f14311c7acbaba23ac09dd56e787c43f",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "ea71be11-4af2-4b94-afed-e8b807bfc7a7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528541392"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571741392"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "10"
    },
    "tokenHash": "4ddb173eada19d135ad75f5422f37785e6c7e13f72c4ec2d6dfa9ac0ae2fa9b6",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "ed630dc6-a945-4328-ba34-2a4c29b82d9e",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528541711"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571741711"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "11"
    },
    "tokenHash": "d87f00d59d44a693b7cd11dbe789405907dafd5771cd13061876f3f8fded22ba",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "3153dec7-6776-4be5-b7a9-6c86c3e289a1",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528671930"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571871930"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "12"
    },
    "tokenHash": "9bb96102d990469c18775aa095d9315bac75e22b6c48ee01fe966ab2b2fdca23",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "dccaca26-b2ab-4a7c-aac3-5b9e9837cfc9",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528672864"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571872864"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "13"
    },
    "tokenHash": "352768fe100febf2d117f62da66b75c44ef19c78cf8ab70f40a75227d437a52a",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "2de4e623-b2ae-4e6f-bfc0-4bc4366f2175",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528673230"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571873230"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "14"
    },
    "tokenHash": "7420481db5ccc943219d61d304ecf6b1b86354ff575c8471147fd36c8693ceb2",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "cfa4d21a-1255-488f-8d49-0bc70176d908",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528673583"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571873583"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "15"
    },
    "tokenHash": "0e54aea3edcd1f542254bf13848bbbfbee0cc45bfa9ccb07d519198af944888d",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "12ddfc02-5780-40f7-9891-08271a010f99",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528673931"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571873931"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "16"
    },
    "tokenHash": "2ea7d2808840a797d91a93ca464fc3c911d1a53707ede9ccecc261219ef19d7e",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "9dd1eba1-b93a-4a07-8f07-514535f37ad3",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528674276"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571874276"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "17"
    },
    "tokenHash": "582db4674226e0ae38acef681476ab783aea487fbb7217253b1d9441b0c0b898",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "0137c300-daee-4b23-8369-851b548260b9",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528674620"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571874620"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "18"
    },
    "tokenHash": "addfce83677aa03a062acd7773b3209842c1c5e90853519627a5625bdf75a88c",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "ed7c966d-7728-4787-b46d-5846a0018b3f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528707812"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791571907812"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791530241623"
      }
    },
    "replacedByHash": "8f258063e82e61a8d6b1176d8b3f6cba1f1d92df35ad38602aac4cdc8c3619b2",
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "19"
    },
    "tokenHash": "067cb8487f46a79d029d237f50c8756769214036671c01de973d63d216fe3c76",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "fba980e1-c502-40c9-92b8-9fd8b859725c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528832700"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572032700"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "20"
    },
    "tokenHash": "cb1b97e0daa889f6cb0a73255766316d7b041469d59dad534dc860a78b47511d",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "821c1713-371e-4cd9-9d3f-f983e808d198",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528833010"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572033010"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "21"
    },
    "tokenHash": "53f44510961e3f89d941bf2891dfe7705bf287696da249eeb04a43c5922d14b6",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "4d26cdec-2403-479f-8eac-2c81bc54e64f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528833345"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572033345"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "22"
    },
    "tokenHash": "36e4c04b5c425eacbc239f97ce587c0ea1a8ac10eb4090ea0f1b6de3dc209a6a",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "9d672934-bec3-4535-9d81-0a4507a5029d",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528833662"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572033662"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "23"
    },
    "tokenHash": "66c65e41d77625abf9d93977a0dc3aad7bbd61a00a1d3b8ed8434b1a52c34f9e",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "3d02189b-b928-44cc-9952-2608820ee542",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528833962"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572033962"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "24"
    },
    "tokenHash": "86855a99f2994c327bf9d8e17f4bbdddf7b39455ab9f2a321e1f320f37ae89be",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "26779989-6a5e-477a-8992-43a0c518c7fc",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528834311"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572034311"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "25"
    },
    "tokenHash": "cc239dbaedf02d38fb7852aa92655e0c99e7adf335b00be3af824f1a376e6930",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "078537a3-0a3e-44ae-b07b-1bc2db3ba0d8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528834633"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572034633"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "26"
    },
    "tokenHash": "6cefeaba9891f16e0d2957f3e4af7e84b0911f168409797f5d916a460b329c56",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "c1dd16da-b7ab-421e-8a3f-f38c305eef77",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528931715"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572131715"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "27"
    },
    "tokenHash": "8aeb23027299907ae0df424dd41fd73bf55225d3c9652e9fe1cfc70d07608e80",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "bb085233-454e-4af8-8d6f-aa07dfd77bb8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528931954"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572131954"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "28"
    },
    "tokenHash": "26594bf2a3671d5bd22daf50444e073f148f44813a844bcdcce7d7ba15c253b9",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "7d89b10c-aca3-45e8-9d81-77c9788725b4",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528932196"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572132196"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "29"
    },
    "tokenHash": "bf21a6092f6febc5ca2c50bbc22c9587dc4e987a6ff199fd80d92032eb55a1a1",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "0bad037b-3e59-456c-aebd-df16770b2485",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528932451"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572132451"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "30"
    },
    "tokenHash": "e7851aa07c5af50d92c38e2425858787d709c80043cb369c23216ef99e89e256",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "b6eea3e6-f84e-4054-b38c-f303bcf429a2",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528932687"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572132687"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "31"
    },
    "tokenHash": "75b034c3830fb34e17ea1459dc61562043cfbbe175126fbce101b9ae9fbbf067",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "04088075-39e6-420c-af3a-9d1ab0ee4a91",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528932957"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572132957"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "32"
    },
    "tokenHash": "a62c8f25d49d55471e98c36a8782b593bf01b475eb6dd9d3a1b558f51827f65c",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "3b4cbe99-a076-4b0b-b7a2-8827e9a5e66f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791528933184"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572133184"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "33"
    },
    "tokenHash": "b55d62b04e38246aac4104f20b5e4384f1b6e45c6819843eaca7002a2c65bb86",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "47e29390-ef05-47e4-a97f-7cd3ccdf1104",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529448727"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572648727"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "34"
    },
    "tokenHash": "aa216f759403fe1b10f850d967470b013e627540436a4a41280f103d27f9a005",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "6ac97aad-f33d-445d-9544-8cbc0a2adc55",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529449263"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572649263"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "35"
    },
    "tokenHash": "5cb7f8c960ca3b8d895fb82a22835007c82b3826882fa1829945b2dad37bc95d",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "36a7e5cf-e8a8-4c1d-af15-bfd04f21c92b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529449649"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572649649"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "36"
    },
    "tokenHash": "cf264aca11dc6777dab75f431623598b5ac8ac8231d03ed2a0d871dadcdee665",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "5410dc94-0841-40c4-86c9-890f37645d72",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529450026"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572650026"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "37"
    },
    "tokenHash": "dafdcb59b6288609575af5216521da666ea4a16287a4ffed1d2eb2d6e36fc6f6",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "3690a3c4-8354-4884-be2f-720acbe099f3",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529450385"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572650385"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "38"
    },
    "tokenHash": "847edd570d139dc01c8f52c485e0246bb54e75934ba3fca82f651f235aabfd63",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "877599c3-d126-4b9b-ae49-cf3ecb83a440",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529450712"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572650712"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "39"
    },
    "tokenHash": "8dd16d4d587f4e361ff0566b1ddb9ad5b043b97699b8ee44dac4a4a4cc6461d8",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "b5cd189e-52db-4a8c-8684-a8746c205186",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529451034"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572651034"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "40"
    },
    "tokenHash": "9c8c4c664f692d77442c18b5ac2dd00b1e67529af48f87b49d64358cacc76a56",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "644085df-6f09-4598-b1cf-1d9ace1f7ee7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529573932"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572773932"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791529576865"
      }
    },
    "replacedByHash": "70496a0cfff0031fe6aa9062a66ab5b0fe227910b47e8a0efc1195d12ca28b9d",
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "41"
    },
    "tokenHash": "3657fc91626c62c44f0663bb36ac5da764036f4540f7ce434695ad211239bd6d",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "7aa8ec8a-5cb6-4323-8d6e-3af4f55bf8bd",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529574174"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572774174"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "42"
    },
    "tokenHash": "f65371e0bdbbaa2bd37e4d695ef91fe1519965d96d89e3b1774868aafb22c8a9",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "bc0e0131-2a22-447b-a986-b5f7e65ffa16",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529574458"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572774458"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "43"
    },
    "tokenHash": "41fa0eb6d56d101c5046670f783ae678a56b8fb3df8f72effdcad16791110847",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "63b0aa47-8ab8-4a5f-bf0a-be5dc8e9c55c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529574718"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572774718"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "44"
    },
    "tokenHash": "5db9190a4c04fa69b966a39068f826a72e70a489a97686b67e1401e81ac756e7",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "9e3c4240-8b0b-40c0-bbfb-746097b8d87f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529574984"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572774984"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "45"
    },
    "tokenHash": "dee93833682f76e1f01430920bb1dc6f45067e06fdd0e473cdaf77b487ddcdff",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "df6e3667-71ee-481a-bd26-1628146a1b02",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529575228"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572775228"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "46"
    },
    "tokenHash": "a0761f7707bcd1b8e1c24784865931b10106d46510d4230bd35e8f23f0dd1016",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "538ddc84-32de-436d-9941-f8112da94376",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529575496"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572775496"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "47"
    },
    "tokenHash": "70496a0cfff0031fe6aa9062a66ab5b0fe227910b47e8a0efc1195d12ca28b9d",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "644085df-6f09-4598-b1cf-1d9ace1f7ee7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791529576868"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791572776868"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791529576898"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "48"
    },
    "tokenHash": "8f258063e82e61a8d6b1176d8b3f6cba1f1d92df35ad38602aac4cdc8c3619b2",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "ed7c966d-7728-4787-b46d-5846a0018b3f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530241696"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573441696"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791530535811"
      }
    },
    "replacedByHash": "7f2215d6cdbf41e7549046cc14b21174607ead480aa4c790bd1099d0ad2aaa29",
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "49"
    },
    "tokenHash": "6be4a1b569f1f80b9e176d32d2be818b8363ef9d6ec4dd04be437a362a7abcba",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "0bbffbd0-7877-4cfb-9ec2-48f8eeac3dc2",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530257533"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573457533"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791530262187"
      }
    },
    "replacedByHash": "1f1318539152d5f0695f0ab126f62671e5b489d72533cab0d21eb83cc84db3dd",
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "50"
    },
    "tokenHash": "34f5f26969d96412eee3e08e1a026dc8a1ddd52361c189928a52677ae8a61853",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "66e52613-0963-4c71-bfa0-40adeb3548bf",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530257855"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573457855"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "51"
    },
    "tokenHash": "df31b00258eb656af8309d5a32884003232b57109c61016149625f639ffd13ad",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "c2182989-5a6a-42df-99c1-a60fd4220db6",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530258175"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573458175"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "52"
    },
    "tokenHash": "5a82eaaedbb831db2f712af9b87b2d3276d1b8ce89baa300f820c180efe27d2f",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "49998242-3d3c-4acd-bf8f-35cf0deb6b74",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530258539"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573458539"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "53"
    },
    "tokenHash": "fa983345f1f1e1a834179838284989c402f17ab43e9cb66d2567a51c6a010a78",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "81d80a78-2db4-450c-a327-401d96be4eee",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530258887"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573458887"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "54"
    },
    "tokenHash": "8aaf5414c5fd9fe61aa78ea3e3bc762fffa7bcc8119d211836db7f0632f4c104",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "e4335ba8-8d7d-474b-9d99-507f4fba8b5f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530259288"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573459288"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "55"
    },
    "tokenHash": "33ce57867111ddd4079d7f53ae07648f3d02ca25c3bf31f3330a58d74cd9067f",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "390c9211-8354-42c4-933a-45f7c4cf28c6",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530259628"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573459628"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "56"
    },
    "tokenHash": "1f1318539152d5f0695f0ab126f62671e5b489d72533cab0d21eb83cc84db3dd",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "0bbffbd0-7877-4cfb-9ec2-48f8eeac3dc2",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530262190"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573462190"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791530262216"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "57"
    },
    "tokenHash": "7f2215d6cdbf41e7549046cc14b21174607ead480aa4c790bd1099d0ad2aaa29",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "ed7c966d-7728-4787-b46d-5846a0018b3f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791530535880"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791573735880"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531622054"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "58"
    },
    "tokenHash": "b9820b9a4cd71af7de8a98e4b26b2f20837c1c50853a85ccfc0659a9fb12cac5",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "cd35a619-2643-4238-9f71-3e6067f13981",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531656533"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574856533"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "59"
    },
    "tokenHash": "f6d5190376c29f12200d20dcd05f395444e12ed0b5eacbd093d24a5af66d4e7e",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "385f26ac-0c8b-4686-aab5-470c81bfc20e",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531677739"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574877739"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "60"
    },
    "tokenHash": "a4c6881715b93b4cf240a3c6a9534b6a0db8895f37b4252a31c75531836d88da",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "2e75d602-d833-4a09-8a9d-2da4a2f80731",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531678316"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574878316"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "61"
    },
    "tokenHash": "ca42985736e4cf0ce9970cf7f7a0c5dcf1eb73d0119ac8170d643dc5d7e1451a",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "e9761c84-b262-4584-8520-616f7dcda21d",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531678783"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574878783"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "62"
    },
    "tokenHash": "edeeca2ddb16f35dcde286dcf5ba3d5295280f3f258a3d58cccefdab7ded2001",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "1cdd1e88-b4c4-4a7d-a2bd-22739c4a05bc",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531679254"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574879254"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "63"
    },
    "tokenHash": "009c004749b01dd55e7968ccccd0c3d808a89a8c022652235b82b412fb9ec6d2",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "7f8c31d0-a18b-4ec8-9241-a1e40f43d6c8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531719940"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574919940"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791531988986"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "64"
    },
    "tokenHash": "39a7ac180d01518e0f3e7af1bd1ed6bd5868eb32037cba53cce4cee4072415fc",
    "accountId": {
      "$numberLong": "7"
    },
    "familyId": "9be0d0ec-1b81-400c-b72d-53d22f37c5e8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531761959"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574961959"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "65"
    },
    "tokenHash": "f8309785c320456a6beeb349f12f8743f706df9de1fd9aad9c418d8a6fe697a3",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "e3d57e92-9583-4907-a41a-f7b24da70ae9",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531762653"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574962653"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "66"
    },
    "tokenHash": "48fc28bed8ae3048546ba6aaa8b222bb1fdaa7085723ac607370b247d936ca82",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "a9195b85-dbfc-496c-9d2e-5106ac538856",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531763333"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574963333"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "67"
    },
    "tokenHash": "11c6c551eb4d995401f02849c637c11b28e7c5b4bb6344188f1ffb5de6a50546",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "4a599ca3-61f2-419a-8518-36c405a9a283",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531763961"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574963961"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; en-US) PowerShell/7.6.5"
  },
  {
    "_id": {
      "$numberLong": "68"
    },
    "tokenHash": "ebaf49dc77aa4f0d8cb99c848bfc3e2453601bfe816c21cc33e537b73ec85fa2",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "c8f8136e-3b66-455d-920c-bc82c57351ab",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531784624"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791574984624"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "69"
    },
    "tokenHash": "89f90c7ca88e1be13c13b1fb62b1cc6cd92ac785243c7f0a1be648038e928fe9",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "4cf86280-ad3d-4e06-9370-1aabe051bbc9",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791531984612"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791575184612"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791532013420"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "70"
    },
    "tokenHash": "e428352bf660014138cf2f7aa07d845289da234f78a9e9b5849875a90fa29881",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "691d2987-13e7-4b0e-ad98-5d94193bea6b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532030769"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791575230769"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791532053032"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "71"
    },
    "tokenHash": "4ee539ca7d925829f789c4ef542a9f2443e62fbd8ffaeac031217fc07f903b50",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "92d3a0ff-28e2-4c4c-9375-039f8c4ea04f",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532282696"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791575482696"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791533525169"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "72"
    },
    "tokenHash": "7ebecf2798a933269e55a00027e4c78e81d77739ccd1ae34c9a1a9b4ea53a272",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "777d223c-21e5-4253-b5b1-5642430ebcad",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532800537"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576000537"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "73"
    },
    "tokenHash": "54b8a964d0ba24208e16d4e052228093b6d5892c08bfec52e6602ecf525735ca",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "6197c502-829a-4138-b46f-fc29569ed18e",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532800859"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576000859"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "74"
    },
    "tokenHash": "8bca146e15b169dcae093dc199a6b3540a69ce065af0a17185a7e2cd2fccbe67",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "dd0e30fa-6135-45bc-b7ca-edce9a43af60",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532801213"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576001213"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "75"
    },
    "tokenHash": "23f99a789333e363aaad9de094d9182599b110a5cf6611ab6838af13fe85c598",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "37abf706-1b0d-4cc4-b13b-0ff33fee3ed8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532801529"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576001529"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "76"
    },
    "tokenHash": "fc0c69feb2f4438530a10faf6a583dc1fd937630e988e1c1df5ac087299bab4d",
    "accountId": {
      "$numberLong": "7"
    },
    "familyId": "7fd9956d-b569-4202-b435-7ac50fb94b8a",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532801855"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576001855"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "77"
    },
    "tokenHash": "457692866b0f33d3ecfa21ce1468d62e147c78ec9f4588b123d33a947e9aa190",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "1422810d-252c-4907-8deb-f03c0058a833",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532802158"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576002158"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "78"
    },
    "tokenHash": "cd55f1573ade9d6a4129425ecde739ba0c03999c8f2e41f8160f57224492a069",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "3117719c-cddf-43ee-bf5a-68793d934cbd",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532802512"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576002512"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "79"
    },
    "tokenHash": "e11e909cd3434071903344f3de74df00e873c9636fcfc06c7f04d5b07be2fd14",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "6028a447-5fd4-438b-8fe4-c844fae6b5f2",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532802826"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576002826"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "80"
    },
    "tokenHash": "2021ec8aeca375a166d74fd1b5fcb720e0c886dd21260e2239f991ac9b21ed8e",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "374408e9-c2a8-4488-9f1a-5ad348938694",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532880813"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576080813"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "81"
    },
    "tokenHash": "8d0d43e36d87bdac00c7cfc03c68ab7612d6fecf9beb126411824968fba431ff",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "8bfe7217-4e07-40b3-8b6d-78dd80162f6a",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532881142"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576081142"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "82"
    },
    "tokenHash": "022bd36c1e5dd65456e7557f1e15e0cdaae1545c3616fa842c63572837769dc0",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "07a45555-6002-4b5e-ac77-0884494992b7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532881465"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576081465"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "83"
    },
    "tokenHash": "586fa4f27e302ed7816743075677233708350accc0ff54671f42f6ec78a09e8b",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "8cdf2d02-7c0b-4995-a15c-5f585d8d8943",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532881790"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576081790"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "84"
    },
    "tokenHash": "7a5195068e5fdd03696635e16cf8a49d503b821721d6fe13e8a0449f8c6eb5db",
    "accountId": {
      "$numberLong": "7"
    },
    "familyId": "d08c4360-6ad6-441d-b7d0-d77bbc588ce6",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532882158"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576082158"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "85"
    },
    "tokenHash": "67201493d62f380cd83521bbb4b9bb12ea74823b2323ea954b88ab0c8aa911b7",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "dc903109-0da8-48ae-95ea-65797acd027c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532882474"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576082474"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "86"
    },
    "tokenHash": "e73d371b0daf19718aaea8c0a3de35d919b63f67945905fce07d165717be1cb1",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "cd29dde9-0c35-4ef5-b919-0c144864a7ce",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532882815"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576082815"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "87"
    },
    "tokenHash": "88bbb77898e2a7ae9ea5fe9586ec9a3cdb031406f7fd1f3620b0c0a01f4db611",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "91600e17-d935-4d58-b99f-75931e736b95",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532883115"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576083115"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "88"
    },
    "tokenHash": "535ec36a94c8651c7553ea01e177528961f2e2f78985d4cc7e924e2acef202af",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "3667f6f8-81fa-4f67-a262-aa0d08d72a72",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532936129"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576136129"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "89"
    },
    "tokenHash": "a685bbeb6c76880edcd751158451a971c64126c44204e481e8e19e2f56d99a03",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "975027ac-499d-414a-9e2d-e9e2485c9ef7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532936423"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576136423"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "90"
    },
    "tokenHash": "4e3250547b9a317cb9dc6d215abeaae746bd9a354d84f1c70c805e5948f780fa",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "c137329e-02c8-49dc-8e2d-2d7542b5fe6b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532984164"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576184164"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "91"
    },
    "tokenHash": "5cee5914ad59e8221361687bc788a7a523fec4055160d3fa47a58cca95d50565",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "b35666ea-5b5c-4fe1-844c-53d6f167568c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532984491"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576184491"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "92"
    },
    "tokenHash": "5c51947547b3b86e44234cdadf15b99bc789fdf1b7709b62c80fa094fd355e16",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "f1bd4fa3-87d3-4f27-841d-4f9f6445e592",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532984856"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576184856"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "93"
    },
    "tokenHash": "c7897555b7673fd1149d42f9b291b0ddcbbf2ef7e2241fc7700ace011fe431f6",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "364e4c68-3bf8-430a-8029-d6763ed614e8",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532985219"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576185219"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "94"
    },
    "tokenHash": "faa69111122a126b3e856f3c7542631641032bbbfb63d2a38c8f5b1e50a743fa",
    "accountId": {
      "$numberLong": "7"
    },
    "familyId": "7183e758-480c-4b95-8d9e-e5685d0bbb4b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532985586"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576185586"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "95"
    },
    "tokenHash": "ba3eb006f5bc2dc38dc3c900629882c8c8ebe57819046b24f540876c117e2ef6",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "b41767cd-0e68-427c-b93d-af932665895c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532985921"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576185921"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "96"
    },
    "tokenHash": "4625501c3a5658bf785eb13e274848c430518cb67b22131a8e199e0463847a8b",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "ff79dde9-aa77-4c2d-9b02-905b3419a9e7",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532986228"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576186228"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "97"
    },
    "tokenHash": "a59f14ed97067c1cfc963742fa94740f30e47189dfe1f9c67a0a39ee67ceed10",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "0e9362c2-48c4-4c59-8ea8-4dd32aca5233",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791532986574"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576186574"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "node"
  },
  {
    "_id": {
      "$numberLong": "98"
    },
    "tokenHash": "57ebd1942b958711dc23b86eac02b667cea0e390b017345569723e5f31e3eb12",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "8fee295d-fa16-415f-bcc7-368855232764",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791533025361"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576225361"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791533133332"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "99"
    },
    "tokenHash": "c14f17a8835c1ec9664cf3c2611016a0ffd45fbb9006fe021a722d393ef9c5f9",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "4e957ba9-4536-43ea-ad8a-535b99fa9176",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791533141383"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576341383"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1791533194781"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "100"
    },
    "tokenHash": "66192a00d074be9823b0448a2f0bc2274c2319a064c25af3bf6c0c5c010b8d76",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "cc04a291-bc67-4549-82ba-c6c850dcc836",
    "issuedAt": {
      "$date": {
        "$numberLong": "1791533393337"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1791576593337"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
  }
], { relaxed: false }), { ordered: true });
  target.getCollection("refresh_tokens").insertMany(EJSON.deserialize([
  {
    "_id": {
      "$numberLong": "101"
    },
    "tokenHash": "ea1d7407cc5a4254abcae26a0462f01bec1f426ca5b7a3aece0be7248657181f",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "9d7e4c10-9883-4c0a-8ccc-aff80567b226",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792078756683"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792121956683"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1792080423196"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.37337.1 Chrome/152.0.7977.130 Safari/537.36 MSIX"
  },
  {
    "_id": {
      "$numberLong": "102"
    },
    "tokenHash": "a1b47ca822877d6b8f1f6cab9c88c5f93741fb42783ed6e405b6783ddd866c25",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "a6bec404-cb0d-4730-b738-b3731c62e53e",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079048434"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122248434"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "103"
    },
    "tokenHash": "6359428783acbba91634111f2577c8bd17efd681f7e4bf05195056ee9cf03b6b",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "e38502e4-bbe5-49c9-b312-4ac83859ed53",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079051754"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122251754"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "104"
    },
    "tokenHash": "26681cf1f77555578a79c94a210518c2cc10eb0f056340abf33371f690b626cb",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "832ffbca-4b34-4014-a4fb-f1084a56cd23",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079055136"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122255136"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "105"
    },
    "tokenHash": "aeb25563c9fbf576cdf7745240175a33084758b6644f1b311a6c16e1ded920d6",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "6d27d3e4-ebf6-4e85-8c40-a4f2f2e7f925",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079058575"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122258575"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "106"
    },
    "tokenHash": "4ebe3f15a6d971c3eb9fc222d30c32be32d287aaed10bf36a5735e80195c9dfd",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "34c43ebb-d5ac-4028-be37-85c3004f5627",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079061921"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122261921"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "107"
    },
    "tokenHash": "78e930375c145ab871c53916f2713ac719de3530591c8e88ca696f9aaefc21d1",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "dad99fd1-9632-4485-918c-2952bc484f15",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079065335"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122265335"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "108"
    },
    "tokenHash": "52ffd3edec850783904a5374f689a85d8ab8aafb40c9602a30099c98a81a9d3c",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "d8f0b016-d048-4c7a-aacd-649e4edf30db",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079088101"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122288101"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "109"
    },
    "tokenHash": "d0122bb8dd50ca07dd82ec56708163a036cdbab9a1781a23569e91180f76435b",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "bf4b5517-73ec-4a4c-9b4e-490ccacd0b21",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079096801"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122296801"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "110"
    },
    "tokenHash": "19e0011f16d89893297dbab3d7a94e8ccc155e4aa6c6f6c64d9379adeade6fb4",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "c45b46c1-8dd1-4a77-a970-e6d235577b75",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079102351"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122302351"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "111"
    },
    "tokenHash": "9ba10cda931c2c16c34828a545ca1b6610f20a77e4b1dc5106c40be1a1e9c034",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "e202aeda-db30-4fe9-b865-0c219fa0633c",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079114813"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122314813"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "112"
    },
    "tokenHash": "9d8491e31765a4a0813c4f8c0ddecf01b1d8c8a5dbc1cb5b16e179ef7435e7c6",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "6d626f20-b9f6-42a1-909d-96450fb6c392",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079120289"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122320289"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "113"
    },
    "tokenHash": "23f04d7fe0576edc8aefc3552fff60d7fb2a279f1db7c1143f3a7cc2b98b09b7",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "326379fe-21b3-4be7-848a-aaba5a9adc17",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079128796"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122328796"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "114"
    },
    "tokenHash": "b9bb864f300b8e1a3591d6e0708aefccf89cdce461b5d1c9a5f5b8ca6d8cb171",
    "accountId": {
      "$numberLong": "1"
    },
    "familyId": "3776b380-37b6-44fc-be07-6c955b902e53",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079207459"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122407459"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "115"
    },
    "tokenHash": "a70d01e984f0974077dd413ef649a920b6ccaaeb07333c3971e58a828126c3e3",
    "accountId": {
      "$numberLong": "2"
    },
    "familyId": "636780cc-46f7-4faf-94a1-16d174030423",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079251992"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122451992"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "116"
    },
    "tokenHash": "3d0fa24143901fe233fc61b0f5374d42af96ecc0084833a3c9f630415ebf6bc3",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "ac2f754b-4d3a-4424-8d20-0591e58104db",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079290669"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122490669"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "117"
    },
    "tokenHash": "177b86ef8e935ab521b8a97b1cf3dc7ec58ace0ae6026ef38950beec9c56e767",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "c76ebbf2-03f0-4078-a76c-189e47101b31",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079310221"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122510221"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "118"
    },
    "tokenHash": "c48c9c9ab4c1ecf871904cda9c6d6fb5be1782715d8903ac50928dff047b9d1e",
    "accountId": {
      "$numberLong": "5"
    },
    "familyId": "925af480-b891-4310-aec8-be3623a0dc31",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079319751"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122519751"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "119"
    },
    "tokenHash": "5d9a09a9b02400b12972b764dfbc224e79cc6a91f8cee76bf669a38df084539b",
    "accountId": {
      "$numberLong": "6"
    },
    "familyId": "6027b2af-ae21-4d00-816f-9063ee4bddc6",
    "issuedAt": {
      "$date": {
        "$numberLong": "1792079335515"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1792122535515"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
  },
  {
    "_id": {
      "$numberLong": "120"
    },
    "tokenHash": "1f07e5493eea4adf6323e914596139cb768a86afc7399cb6360d3b86307c453b",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "7a62985d-7096-404a-9c11-096f429a14c6",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793185855477"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793229055477"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1793185884934"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "121"
    },
    "tokenHash": "846ed7a3086ebe6b54d44fc0baf63865c26e56eb4cd48076d8b40450dd2bbe91",
    "accountId": {
      "$numberLong": "4"
    },
    "familyId": "b871548e-7936-48fc-b3c2-ef18bb96c140",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793185897515"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793229097515"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1793185921381"
      }
    },
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "122"
    },
    "tokenHash": "cbadebaf68913dd0e1923bc2a6b28c369f9fb61c202ccb10342b107e60daa7f2",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "3f64a2aa-8ea2-4299-9090-ff08cbb3b400",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793185923163"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793229123163"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "123"
    },
    "tokenHash": "ee42e4060913eda6a6af045291c5de718e773208d45e6116e9b271d4763fdc1a",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "cf235c03-eedc-400d-8aea-d55ee07c1c0b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793186543802"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793229743802"
      }
    },
    "revokedAt": {
      "$date": {
        "$numberLong": "1793186920618"
      }
    },
    "replacedByHash": "e24dc7ba42419e542eeeb1556cea55c5c73697732e7b264bcb468e6c076540c4",
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36"
  },
  {
    "_id": {
      "$numberLong": "124"
    },
    "tokenHash": "e24dc7ba42419e542eeeb1556cea55c5c73697732e7b264bcb468e6c076540c4",
    "accountId": {
      "$numberLong": "8"
    },
    "familyId": "cf235c03-eedc-400d-8aea-d55ee07c1c0b",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793186920688"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793230120688"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "::1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/4.29.0 Chrome/152.0.7977.167 Safari/537.36 MSIX"
  },
  {
    "_id": {
      "$numberLong": "125"
    },
    "tokenHash": "4f588bb553dca162696a252764a4c3d554f1f71dec95ebfaefa7a64b650e98e0",
    "accountId": {
      "$numberLong": "3"
    },
    "familyId": "b69ca544-4405-47f6-93ae-3afe37c59311",
    "issuedAt": {
      "$date": {
        "$numberLong": "1793186933041"
      }
    },
    "expiresAt": {
      "$date": {
        "$numberLong": "1793230133041"
      }
    },
    "revokedAt": null,
    "replacedByHash": null,
    "remember": false,
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/4.29.0 Chrome/152.0.7977.167 Safari/537.36 MSIX"
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("refresh_tokens").countDocuments({}) !== 125) throw new Error("Count mismatch: refresh_tokens");

  // Collection: service_prices (1 documents in source).
  target.createCollection("service_prices", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("service_prices").insertMany(EJSON.deserialize([
  {
    "_id": "DV-01",
    "name": "Kiểm tra và sửa chữa — demo",
    "categoryCode": "LAPTOP",
    "price": {
      "$numberDecimal": "150000"
    },
    "active": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("service_prices").countDocuments({}) !== 1) throw new Error("Count mismatch: service_prices");

  // Collection: service_stations (1 documents in source).
  target.createCollection("service_stations", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("service_stations").insertMany(EJSON.deserialize([
  {
    "_id": "TRAM-01",
    "name": "Soopi — trạm demo",
    "address": "Dữ liệu mẫu phát triển",
    "active": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("service_stations").countDocuments({}) !== 1) throw new Error("Count mismatch: service_stations");

  // Collection: stock_issues (6 documents in source).
  target.createCollection("stock_issues", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("stock_issues").createIndex(EJSON.deserialize({
  "ticketId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "issue_pending_ticket",
  "unique": true,
  "partialFilterExpression": {
    "status": "PENDING"
  }
}, { relaxed: false }));
  target.getCollection("stock_issues").insertMany(EJSON.deserialize([
  {
    "_id": "PX-2026-00001",
    "ticketId": "TN-2026-1009-00002",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00001",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791528835993"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791528836067"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "LK-PIN",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "300000"
        },
        "binCode": "A1",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "300000"
    },
    "Persisted": true
  },
  {
    "_id": "PX-2026-00002",
    "ticketId": "TN-2026-1009-00004",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00002",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791528933842"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791528933885"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "LK-PIN",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "300000"
        },
        "binCode": "A1",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "300000"
    },
    "Persisted": true
  },
  {
    "_id": "PX-2026-00003",
    "ticketId": "TN-2026-1009-00006",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00003",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791529452927"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529452996"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "LK-PIN",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "300000"
        },
        "binCode": "A1",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "300000"
    },
    "Persisted": true
  },
  {
    "_id": "PX-2026-00004",
    "ticketId": "TN-2026-1009-00008",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00004",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791529576258"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529576302"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "LK-PIN",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "300000"
        },
        "binCode": "A1",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "300000"
    },
    "Persisted": true
  },
  {
    "_id": "PX-2026-00005",
    "ticketId": "TN-2026-1009-00010",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00005",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791530261281"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791530261343"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "LK-PIN",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "300000"
        },
        "binCode": "A1",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "300000"
    },
    "Persisted": true
  },
  {
    "_id": "PX-2026-00006",
    "ticketId": "TN-2026-1009-00012",
    "source": "QUOTATION",
    "quotationId": "BG-2026-1009-00006",
    "reason": "Xuất thay thế sửa chữa",
    "technicianId": "NV-004",
    "requestedBy": "NV-004",
    "requestedAt": {
      "$date": {
        "$numberLong": "1791532986679"
      }
    },
    "status": "ISSUED",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791532986734"
      }
    },
    "rejectedReason": null,
    "lines": [
      {
        "sku": "P3-MV0ODFHB-2",
        "quantity": {
          "$numberInt": "1"
        },
        "unitCost": {
          "$numberDecimal": "850000"
        },
        "binCode": "P3-A2",
        "partWarrantyExpiresOn": "2027-04-09"
      }
    ],
    "totalCost": {
      "$numberDecimal": "850000"
    },
    "Persisted": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("stock_issues").countDocuments({}) !== 6) throw new Error("Count mismatch: stock_issues");

  // Collection: stock_receipts (4 documents in source).
  target.createCollection("stock_receipts", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("stock_receipts").insertMany(EJSON.deserialize([
  {
    "_id": "PN-2026-00001",
    "supplierId": "NCC-001",
    "batchNo": null,
    "receivedOn": "2026-10-09",
    "status": "APPROVED",
    "requestedBy": "NV-005",
    "note": "Kiểm thử nhập kho MongoDB",
    "lines": [
      {
        "sku": "LK-CABLE",
        "quantity": {
          "$numberInt": "3"
        },
        "unitCost": {
          "$numberDecimal": "50000"
        },
        "serialBatch": null,
        "binCode": "A3"
      }
    ],
    "totalCost": {
      "$numberDecimal": "150000"
    },
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529453614"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  },
  {
    "_id": "PN-2026-00002",
    "supplierId": "NCC-001",
    "batchNo": null,
    "receivedOn": "2026-10-09",
    "status": "APPROVED",
    "requestedBy": "NV-005",
    "note": "Kiểm thử nhập kho MongoDB",
    "lines": [
      {
        "sku": "LK-CABLE",
        "quantity": {
          "$numberInt": "3"
        },
        "unitCost": {
          "$numberDecimal": "50000"
        },
        "serialBatch": null,
        "binCode": "A3"
      }
    ],
    "totalCost": {
      "$numberDecimal": "150000"
    },
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529576654"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  },
  {
    "_id": "PN-2026-00003",
    "supplierId": "NCC-001",
    "batchNo": null,
    "receivedOn": "2026-10-09",
    "status": "APPROVED",
    "requestedBy": "NV-005",
    "note": "Kiểm thử nhập kho MongoDB",
    "lines": [
      {
        "sku": "LK-CABLE",
        "quantity": {
          "$numberInt": "3"
        },
        "unitCost": {
          "$numberDecimal": "50000"
        },
        "serialBatch": null,
        "binCode": "A3"
      }
    ],
    "totalCost": {
      "$numberDecimal": "150000"
    },
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791530261810"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  },
  {
    "_id": "PN-2026-00004",
    "supplierId": "NCC-001",
    "batchNo": null,
    "receivedOn": "2026-10-09",
    "status": "APPROVED",
    "requestedBy": "NV-005",
    "note": "P3-MV0ODFHB nhập linh kiện kiểm thử",
    "lines": [
      {
        "sku": "P3-MV0ODFHB-1",
        "quantity": {
          "$numberInt": "5"
        },
        "unitCost": {
          "$numberDecimal": "650000"
        },
        "serialBatch": null,
        "binCode": "P3-A1"
      },
      {
        "sku": "P3-MV0ODFHB-2",
        "quantity": {
          "$numberInt": "5"
        },
        "unitCost": {
          "$numberDecimal": "850000"
        },
        "serialBatch": null,
        "binCode": "P3-A2"
      }
    ],
    "totalCost": {
      "$numberDecimal": "7500000"
    },
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791532803154"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("stock_receipts").countDocuments({}) !== 4) throw new Error("Count mismatch: stock_receipts");

  // Collection: stock_transfers (3 documents in source).
  target.createCollection("stock_transfers", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("stock_transfers").insertMany(EJSON.deserialize([
  {
    "_id": "DC-2026-00001",
    "sku": "LK-CABLE",
    "quantity": {
      "$numberInt": "1"
    },
    "fromBin": "A3",
    "toBin": "DEMO-MV0MDO0D",
    "reason": "Kiểm thử điều chuyển MongoDB",
    "status": "COMPLETED",
    "requestedBy": "NV-005",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529453698"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  },
  {
    "_id": "DC-2026-00002",
    "sku": "LK-CABLE",
    "quantity": {
      "$numberInt": "1"
    },
    "fromBin": "A3",
    "toBin": "DEMO-MV0MGBP2",
    "reason": "Kiểm thử điều chuyển MongoDB",
    "status": "COMPLETED",
    "requestedBy": "NV-005",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791529576686"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  },
  {
    "_id": "DC-2026-00003",
    "sku": "LK-CABLE",
    "quantity": {
      "$numberInt": "1"
    },
    "fromBin": "A3",
    "toBin": "DEMO-MV0MUZRC",
    "reason": "Kiểm thử điều chuyển MongoDB",
    "status": "COMPLETED",
    "requestedBy": "NV-005",
    "processedBy": "NV-005",
    "processedAt": {
      "$date": {
        "$numberLong": "1791530261875"
      }
    },
    "rejectedReason": null,
    "Persisted": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("stock_transfers").countDocuments({}) !== 3) throw new Error("Count mismatch: stock_transfers");

  // Collection: suppliers (1 documents in source).
  target.createCollection("suppliers", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("suppliers").insertMany(EJSON.deserialize([
  {
    "_id": "NCC-001",
    "name": "Nhà cung cấp demo",
    "phone": "0900000099",
    "email": "demo@example.invalid",
    "address": "Dữ liệu mẫu",
    "active": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("suppliers").countDocuments({}) !== 1) throw new Error("Count mismatch: suppliers");

  // Collection: tickets (13 documents in source).
  target.createCollection("tickets", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("tickets").createIndex(EJSON.deserialize({
  "customerId": {
    "$numberInt": "1"
  },
  "receivedAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "ticket_customer"
}, { relaxed: false }));
  target.getCollection("tickets").createIndex(EJSON.deserialize({
  "deviceId": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "ticket_open_device",
  "unique": true,
  "partialFilterExpression": {
    "open": true
  }
}, { relaxed: false }));
  target.getCollection("tickets").createIndex(EJSON.deserialize({
  "status": {
    "$numberInt": "1"
  },
  "receivedAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "ticket_status_date"
}, { relaxed: false }));
  target.getCollection("tickets").createIndex(EJSON.deserialize({
  "assignment.technicianId": {
    "$numberInt": "1"
  },
  "open": {
    "$numberInt": "1"
  },
  "sla.dueAt": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "ticket_technician"
}, { relaxed: false }));
  target.getCollection("tickets").insertMany(EJSON.deserialize([
  {
    "_id": "TN-2026-1009-00001",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791528835005"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000003",
    "deviceSnapshot": {
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "serialOrImei": "MONGO-MV0M0G24-FREE"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-10-09",
      "expiresOn": "2030-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791701635005"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00001",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791528835179"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00001",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791528835227"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00001",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791528835179"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791528835318"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00001",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791528835353"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00001",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791528835500"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "1",
        "signedAt": {
          "$date": {
            "$numberLong": "1791528835500"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528835280"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528835297"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791528835005"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791528835179"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791528835227"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791528835318"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791528835353"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791528835500"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "7"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00002",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791528835636"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000004",
    "deviceSnapshot": {
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "serialOrImei": "MONGO-MV0M0G24-CHARGED"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2020-01-01",
      "expiresOn": "2021-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791701635636"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00002",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791528835694"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00002",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791528835706"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành",
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00002",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791528835694"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791528836067"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00002",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791528836106"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00001",
    "handover": {
      "code": "PBG-2026-00002",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791528836169"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "2",
        "signedAt": {
          "$date": {
            "$numberLong": "1791528836169"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528835722"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528835729"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791528835636"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791528835694"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791528835706"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791528835770"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791528835883"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791528835923"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ khách xác nhận\" sang \"Chờ linh kiện\"",
        "actor": "KH:KH-000001",
        "actorName": "Khách hàng demo",
        "actorRole": "CUSTOMER"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791528836067"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791528836106"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791528836169"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "10"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00003",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791528933419"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000005",
    "deviceSnapshot": {
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "serialOrImei": "MONGO-MV0M2K2A-FREE"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-10-09",
      "expiresOn": "2030-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791701733419"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00003",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791528933467"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00003",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791528933481"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00003",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791528933467"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791528933525"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00003",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791528933540"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00003",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791528933582"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "3",
        "signedAt": {
          "$date": {
            "$numberLong": "1791528933582"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528933494"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528933510"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791528933419"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791528933467"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791528933481"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791528933525"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791528933540"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791528933582"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "7"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00004",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791528933645"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000006",
    "deviceSnapshot": {
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "serialOrImei": "MONGO-MV0M2K2A-CHARGED"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2020-01-01",
      "expiresOn": "2021-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791701733645"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00004",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791528933695"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00004",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791528933710"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành",
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00004",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791528933695"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791528933885"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00004",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791528933911"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00002",
    "handover": {
      "code": "PBG-2026-00004",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791528933951"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "4",
        "signedAt": {
          "$date": {
            "$numberLong": "1791528933951"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528933724"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791528933741"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791528933645"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791528933695"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791528933710"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791528933756"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791528933788"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791528933802"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ khách xác nhận\" sang \"Chờ linh kiện\"",
        "actor": "KH:KH-000001",
        "actorName": "Khách hàng demo",
        "actorRole": "CUSTOMER"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791528933885"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791528933911"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791528933951"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "10"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00005",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791529451840"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000007",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MDO0D-FREE"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-10-09",
      "expiresOn": "2030-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791702251840"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00005",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791529452003"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00005",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791529452052"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00005",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791529452003"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791529452151"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00005",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791529452188"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00005",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791529452350"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "5",
        "signedAt": {
          "$date": {
            "$numberLong": "1791529452350"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529452090"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529452118"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791529451840"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791529452003"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791529452052"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791529452151"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791529452188"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791529452350"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "7"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00006",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791529452494"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000008",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MDO0D-CHARGED"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2020-01-01",
      "expiresOn": "2021-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791702252494"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00006",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791529452560"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00006",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791529452592"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành",
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00006",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791529452560"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791529452996"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00006",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791529453062"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00003",
    "handover": {
      "code": "PBG-2026-00006",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791529453158"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "6",
        "signedAt": {
          "$date": {
            "$numberLong": "1791529453158"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529452604"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529452623"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791529452494"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791529452560"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791529452592"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791529452683"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791529452778"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791529452842"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ khách xác nhận\" sang \"Chờ linh kiện\"",
        "actor": "KH:KH-000001",
        "actorName": "Khách hàng demo",
        "actorRole": "CUSTOMER"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791529452996"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791529453062"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791529453158"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "10"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00007",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791529575753"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000009",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MGBP2-FREE"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-10-09",
      "expiresOn": "2030-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791702375753"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00007",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791529575788"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00007",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791529575804"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00007",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791529575788"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791529575849"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00007",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791529575865"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00007",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791529575927"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "8",
        "signedAt": {
          "$date": {
            "$numberLong": "1791529575927"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529575817"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529575833"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791529575753"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791529575788"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791529575804"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791529575849"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791529575865"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791529575927"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "7"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00008",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791529576012"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000010",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MGBP2-CHARGED"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2020-01-01",
      "expiresOn": "2021-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791702376012"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00008",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791529576060"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00008",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791529576083"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành",
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00008",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791529576060"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791529576302"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00008",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791529576346"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00004",
    "handover": {
      "code": "PBG-2026-00008",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791529576406"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "9",
        "signedAt": {
          "$date": {
            "$numberLong": "1791529576406"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529576098"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791529576113"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791529576012"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791529576060"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791529576083"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791529576128"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791529576176"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791529576213"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ khách xác nhận\" sang \"Chờ linh kiện\"",
        "actor": "KH:KH-000001",
        "actorName": "Khách hàng demo",
        "actorRole": "CUSTOMER"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791529576302"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791529576346"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791529576406"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "10"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00009",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791530260251"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000011",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MUZRC-FREE"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-10-09",
      "expiresOn": "2030-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791703060251"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00009",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791530260408"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00009",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791530260455"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00009",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791530260408"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791530260546"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00009",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791530260584"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00009",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791530260737"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "11",
        "signedAt": {
          "$date": {
            "$numberLong": "1791530260737"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791530260488"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791530260514"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791530260251"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791530260408"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791530260455"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791530260546"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791530260584"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791530260737"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "7"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00010",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791530260922"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000001",
    "customerSnapshot": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": "customer@example.invalid",
      "address": "Dữ liệu mẫu phát triển"
    },
    "deviceId": "TB-000012",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0003",
      "productName": "Laptop Dell — demo",
      "serialOrImei": "MONGO-MV0MUZRC-CHARGED"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2020-01-01",
      "expiresOn": "2021-01-01",
      "distributor": "Soopi demo",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Kiểm thử MongoDB — thiết bị không lên nguồn",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791703060922"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00010",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791530260976"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00010",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791530260999"
        }
      },
      "findings": "Đã kiểm tra nguồn — dữ liệu kiểm thử",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành",
      "proposedFix": "Thay linh kiện và kiểm tra lại",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00010",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791530260976"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791530261343"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00010",
          "technicianId": "NV-004",
          "workDone": "Sửa chữa hoàn tất — kiểm thử MongoDB",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": null,
          "recordedAt": {
            "$date": {
              "$numberLong": "1791530261385"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00005",
    "handover": {
      "code": "PBG-2026-00010",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791530261464"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Khách hàng demo",
      "conditionOnReturn": "Đã kiểm tra — dữ liệu demo",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "12",
        "signedAt": {
          "$date": {
            "$numberLong": "1791530261464"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791530261012"
          }
        },
        "text": "Đã kiểm tra thiết bị — dữ liệu demo",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "internalNotes": [
      {
        "at": {
          "$date": {
            "$numberLong": "1791530261029"
          }
        },
        "text": "Ghi chú nội bộ kiểm thử MongoDB",
        "by": "NV-004",
        "role": "TECHNICIAN"
      }
    ],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791530260922"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791530260976"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791530260999"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791530261060"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791530261146"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791530261195"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ khách xác nhận\" sang \"Chờ linh kiện\"",
        "actor": "KH:KH-000001",
        "actorName": "Khách hàng demo",
        "actorRole": "CUSTOMER"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791530261343"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791530261385"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791530261464"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "10"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00011",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791532803304"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000002",
    "customerSnapshot": {
      "fullName": "Nguyễn Minh Anh",
      "phone": "0909028431",
      "email": "phase3.mv0odfhb.1@example.invalid",
      "address": "12 đường Nguyễn Văn Cừ, Quận 5, TP.HCM (kiểm thử)"
    },
    "deviceId": "TB-000013",
    "deviceSnapshot": {
      "brandId": "DELL",
      "brandName": "Dell",
      "categoryCode": "LAPTOP",
      "deviceTypeCode": "LAPTOP_SERIAL",
      "deviceTypeName": "Laptop",
      "identifierType": "SERIAL",
      "productId": "SP-0004",
      "productName": "Dell Latitude 5420",
      "serialOrImei": "DL5420-P3-MV0ODFHB"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-05-20",
      "expiresOn": "2027-05-20",
      "distributor": "Soopi kiểm thử",
      "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
      "policyId": "CS-0001"
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Không khởi động khi dùng pin, đèn nguồn nhấp nháy (P3-MV0ODFHB)",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791705603304"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00011",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791532803415"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00011",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791532803471"
        }
      },
      "findings": "Đầu nối pin lỏng; không có dấu hiệu vào nước.",
      "checklist": [
        {
          "item": "Nguồn",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "FREE_WARRANTY",
      "outOfWarrantyReason": null,
      "proposedFix": "Vệ sinh và cố định lại đầu nối pin.",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00011",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791532803415"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791532803507"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00011",
          "technicianId": "NV-004",
          "workDone": "Vệ sinh và cố định đầu nối pin, cập nhật BIOS.",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "FAIL"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "FAIL",
          "qcDetails": "Chức năng chính chưa đạt, cần kiểm tra lại.",
          "recordedAt": {
            "$date": {
              "$numberLong": "1791532803542"
            }
          }
        },
        {
          "code": "KQ-2026-00012",
          "technicianId": "NV-004",
          "workDone": "Vệ sinh và cố định đầu nối pin, cập nhật BIOS.",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": "6 bước kiểm tra đạt.",
          "recordedAt": {
            "$date": {
              "$numberLong": "1791532803563"
            }
          }
        }
      ]
    },
    "activeQuotationId": null,
    "handover": {
      "code": "PBG-2026-00011",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791532803683"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Nguyễn Minh Anh",
      "conditionOnReturn": "Thiết bị hoạt động ổn định; ngoại quan và phụ kiện như khi tiếp nhận.",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "14",
        "signedAt": {
          "$date": {
            "$numberLong": "1791532803683"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [],
    "internalNotes": [],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791532803304"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791532803415"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791532803471"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791532803507"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Đang sửa chữa\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791532803563"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791532803683"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "6"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00012",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791532883153"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000003",
    "customerSnapshot": {
      "fullName": "Trần Hoàng Nam",
      "phone": "0909028432",
      "email": "phase3.mv0odfhb.2@example.invalid",
      "address": "45 đường Lê Văn Sỹ, Quận 3, TP.HCM (kiểm thử)"
    },
    "deviceId": "TB-000014",
    "deviceSnapshot": {
      "brandId": "APPLE",
      "brandName": "Apple",
      "categoryCode": "PHONE",
      "deviceTypeCode": "PHONE_IMEI",
      "deviceTypeName": "Điện thoại",
      "identifierType": "IMEI",
      "productId": "SP-0005",
      "productName": "Apple iPhone 13 128GB",
      "serialOrImei": "359915328831249"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "OUT_OF_WARRANTY",
      "activatedOn": "2024-06-15",
      "expiresOn": "2025-06-15",
      "distributor": "Soopi kiểm thử",
      "conditions": null,
      "policyId": null
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Màn hình bị sọc xanh và mất cảm ứng góc phải (P3-MV0ODFHB)",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "1595000"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791705683153"
        }
      }
    },
    "status": "DELIVERED",
    "assignment": {
      "code": "PC-2026-00012",
      "managerId": "NV-003",
      "technicianId": "NV-004",
      "assignedAt": {
        "$date": {
          "$numberLong": "1791532883192"
        }
      },
      "priority": "NORMAL",
      "note": null,
      "history": []
    },
    "inspection": {
      "code": "PKT-2026-00012",
      "technicianId": "NV-004",
      "inspectedAt": {
        "$date": {
          "$numberLong": "1791532883235"
        }
      },
      "findings": "Cáp màn hình ổn định; tấm OLED lỗi, thiết bị đã hết bảo hành.",
      "checklist": [
        {
          "item": "Màn hình",
          "result": "FAIL",
          "note": null
        }
      ],
      "waterDamage": false,
      "classification": "OUT_OF_WARRANTY",
      "outOfWarrantyReason": "Hết hạn bảo hành ngày 15/06/2025",
      "proposedFix": "Thay màn hình OLED và kiểm tra cảm ứng.",
      "reclassNote": null
    },
    "repairOrder": {
      "code": "PSC-2026-00012",
      "technicianId": "NV-004",
      "createdAt": {
        "$date": {
          "$numberLong": "1791532883192"
        }
      },
      "startedAt": {
        "$date": {
          "$numberLong": "1791532986734"
        }
      },
      "status": "DONE",
      "results": [
        {
          "code": "KQ-2026-00013",
          "technicianId": "NV-004",
          "workDone": "Thay màn hình OLED, kiểm tra hiển thị và cảm ứng.",
          "qcSteps": [
            {
              "step": "VISUAL",
              "result": "PASS"
            },
            {
              "step": "MAIN_FUNCTION",
              "result": "PASS"
            },
            {
              "step": "SECONDARY",
              "result": "PASS"
            },
            {
              "step": "POWER_CHARGING",
              "result": "PASS"
            },
            {
              "step": "DATA",
              "result": "PASS"
            },
            {
              "step": "FINAL",
              "result": "PASS"
            }
          ],
          "qcResult": "PASS",
          "qcDetails": "6 bước kiểm tra đạt.",
          "recordedAt": {
            "$date": {
              "$numberLong": "1791532986757"
            }
          }
        }
      ]
    },
    "activeQuotationId": "BG-2026-1009-00006",
    "handover": {
      "code": "PBG-2026-00012",
      "handedOverAt": {
        "$date": {
          "$numberLong": "1791532986820"
        }
      },
      "handedOverBy": "NV-006",
      "receiverName": "Trần Hoàng Nam",
      "conditionOnReturn": "Thiết bị hoạt động ổn định; ngoại quan và phụ kiện như khi tiếp nhận.",
      "returnedOldParts": false,
      "newWarrantyNote": null,
      "rating": {
        "$numberInt": "5"
      },
      "recheck": {
        "cosmeticMatches": true,
        "bootsNormally": true,
        "mainFunctionsOk": true,
        "accessoriesComplete": true,
        "noNewIssues": true
      },
      "signature": {
        "fileId": "15",
        "signedAt": {
          "$date": {
            "$numberLong": "1791532986820"
          }
        }
      },
      "customerConfirmed": true
    },
    "customerNotes": [],
    "internalNotes": [],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791532883153"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "INSPECTING",
        "at": {
          "$date": {
            "$numberLong": "1791532883192"
          }
        },
        "description": "Trạng thái đổi từ \"Đã tiếp nhận\" sang \"Đang kiểm tra\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "DIAGNOSED",
        "at": {
          "$date": {
            "$numberLong": "1791532883235"
          }
        },
        "description": "Trạng thái đổi từ \"Đang kiểm tra\" sang \"Đã chẩn đoán\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_QUOTE_APPROVAL",
        "at": {
          "$date": {
            "$numberLong": "1791532883281"
          }
        },
        "description": "Trạng thái đổi từ \"Đã chẩn đoán\" sang \"Chờ duyệt giá\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "AWAITING_CUSTOMER_CONFIRMATION",
        "at": {
          "$date": {
            "$numberLong": "1791532883335"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ duyệt giá\" sang \"Chờ khách xác nhận\"",
        "actor": "NV-003",
        "actorName": "Điều phối demo",
        "actorRole": "DISPATCHER"
      },
      {
        "status": "AWAITING_PARTS",
        "at": {
          "$date": {
            "$numberLong": "1791532986636"
          }
        },
        "description": "Khách hàng đồng ý báo giá (xác nhận thay khách tại quầy).",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      },
      {
        "status": "REPAIRING",
        "at": {
          "$date": {
            "$numberLong": "1791532986734"
          }
        },
        "description": "Trạng thái đổi từ \"Chờ linh kiện\" sang \"Đang sửa chữa\"",
        "actor": "NV-005",
        "actorName": "Thủ kho demo",
        "actorRole": "WAREHOUSE_KEEPER"
      },
      {
        "status": "COMPLETED",
        "at": {
          "$date": {
            "$numberLong": "1791532986757"
          }
        },
        "description": "Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"",
        "actor": "NV-004",
        "actorName": "Kỹ thuật viên demo",
        "actorRole": "TECHNICIAN"
      },
      {
        "status": "DELIVERED",
        "at": {
          "$date": {
            "$numberLong": "1791532986820"
          }
        },
        "description": "Trạng thái đổi từ \"Hoàn thành\" sang \"Đã bàn giao\"",
        "actor": "NV-006",
        "actorName": "Thu ngân demo",
        "actorRole": "CASHIER"
      }
    ],
    "version": {
      "$numberInt": "8"
    },
    "open": false
  },
  {
    "_id": "TN-2026-1009-00013",
    "stationCode": "TRAM-01",
    "receivedAt": {
      "$date": {
        "$numberLong": "1791532986907"
      }
    },
    "channel": "COUNTER",
    "requestType": "WARRANTY",
    "warrantyRequestId": null,
    "customerId": "KH-000004",
    "customerSnapshot": {
      "fullName": "Lê Ngọc Linh",
      "phone": "0909028433",
      "email": "phase3.mv0odfhb.3@example.invalid",
      "address": "28 đường Võ Văn Ngân, TP. Thủ Đức, TP.HCM (kiểm thử)"
    },
    "deviceId": "TB-000015",
    "deviceSnapshot": {
      "productId": "SP-0006",
      "productName": "Samsung Galaxy S23 256GB",
      "brandId": "SAMSUNG",
      "brandName": "Samsung",
      "categoryCode": "PHONE",
      "deviceTypeCode": "PHONE_IMEI",
      "deviceTypeName": "Điện thoại",
      "identifierType": "IMEI",
      "serialOrImei": "358915329868829"
    },
    "receivedBy": "NV-002",
    "warrantyAtIntake": {
      "status": "IN_WARRANTY",
      "activatedOn": "2026-03-10",
      "expiresOn": "2027-03-10",
      "distributor": null,
      "conditions": null,
      "policyId": null
    },
    "sealCondition": null,
    "cosmetic": {
      "scratches": "NONE",
      "dents": false,
      "cracks": false,
      "moisture": "NONE",
      "accessories": "COMPLETE",
      "accessoriesNote": null,
      "notes": null,
      "customerAcknowledged": true
    },
    "reportedIssue": "Sạc chập chờn khi cắm cáp USB-C (P3-MV0ODFHB)",
    "promisedReturnAt": null,
    "estimatedCost": {
      "$numberDecimal": "0"
    },
    "sla": {
      "level": "STANDARD_48H",
      "dueAt": {
        "$date": {
          "$numberLong": "1791705786907"
        }
      }
    },
    "status": "RECEIVED",
    "assignment": null,
    "inspection": null,
    "repairOrder": null,
    "activeQuotationId": null,
    "handover": null,
    "customerNotes": [],
    "internalNotes": [],
    "statusHistory": [
      {
        "status": "RECEIVED",
        "at": {
          "$date": {
            "$numberLong": "1791532986907"
          }
        },
        "description": "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.",
        "actor": "NV-002",
        "actorName": "Lễ tân demo",
        "actorRole": "RECEPTIONIST"
      }
    ],
    "version": {
      "$numberInt": "0"
    },
    "open": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("tickets").countDocuments({}) !== 13) throw new Error("Count mismatch: tickets");

  // Collection: warranty_policies (1 documents in source).
  target.createCollection("warranty_policies", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("warranty_policies").insertMany(EJSON.deserialize([
  {
    "_id": "CS-0001",
    "scope": "BRAND",
    "brandId": "DELL",
    "productId": null,
    "name": "Chính sách demo 12 tháng",
    "warrantyMonths": {
      "$numberInt": "12"
    },
    "conditions": "Dữ liệu mẫu; dùng kiểm thử bảo hành.",
    "rejectionCases": "Vào nước, hư hỏng do tác động bên ngoài.",
    "distributor": "Soopi demo",
    "active": true
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("warranty_policies").countDocuments({}) !== 1) throw new Error("Count mismatch: warranty_policies");

  // Collection: warranty_requests (3 documents in source).
  target.createCollection("warranty_requests", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("warranty_requests").createIndex(EJSON.deserialize({
  "status": {
    "$numberInt": "1"
  },
  "createdAt": {
    "$numberInt": "-1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "request_status_date"
}, { relaxed: false }));
  target.getCollection("warranty_requests").insertMany(EJSON.deserialize([
  {
    "_id": "YC-2026-1009-00001",
    "customerId": null,
    "customer": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": null,
      "address": null
    },
    "categoryCode": "LAPTOP",
    "deviceTypeCode": "LAPTOP_SERIAL",
    "brandModel": "Laptop demo",
    "identifierType": "SERIAL",
    "serialOrImei": "PUBLIC-MV0MDO0D",
    "symptom": "Kiểm thử yêu cầu online MongoDB",
    "preferredStation": "TRAM-01",
    "preferredFrom": null,
    "preferredTo": null,
    "status": "CANCELLED",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529453769"
      }
    },
    "convertedTicketId": null,
    "handledBy": "NV-002",
    "handledAt": {
      "$date": {
        "$numberLong": "1791529453942"
      }
    },
    "cancelReason": "Hoàn tất kiểm thử demo"
  },
  {
    "_id": "YC-2026-1009-00002",
    "customerId": null,
    "customer": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": null,
      "address": null
    },
    "categoryCode": "LAPTOP",
    "deviceTypeCode": "LAPTOP_SERIAL",
    "brandModel": "Laptop demo",
    "identifierType": "SERIAL",
    "serialOrImei": "PUBLIC-MV0MGBP2",
    "symptom": "Kiểm thử yêu cầu online MongoDB",
    "preferredStation": "TRAM-01",
    "preferredFrom": null,
    "preferredTo": null,
    "status": "CANCELLED",
    "createdAt": {
      "$date": {
        "$numberLong": "1791529576731"
      }
    },
    "convertedTicketId": null,
    "handledBy": "NV-002",
    "handledAt": {
      "$date": {
        "$numberLong": "1791529576811"
      }
    },
    "cancelReason": "Hoàn tất kiểm thử demo"
  },
  {
    "_id": "YC-2026-1009-00003",
    "customerId": null,
    "customer": {
      "fullName": "Khách hàng demo",
      "phone": "0900000001",
      "email": null,
      "address": null
    },
    "categoryCode": "LAPTOP",
    "deviceTypeCode": "LAPTOP_SERIAL",
    "brandModel": "Laptop demo",
    "identifierType": "SERIAL",
    "serialOrImei": "PUBLIC-MV0MUZRC",
    "symptom": "Kiểm thử yêu cầu online MongoDB",
    "preferredStation": "TRAM-01",
    "preferredFrom": null,
    "preferredTo": null,
    "status": "CANCELLED",
    "createdAt": {
      "$date": {
        "$numberLong": "1791530261937"
      }
    },
    "convertedTicketId": null,
    "handledBy": "NV-002",
    "handledAt": {
      "$date": {
        "$numberLong": "1791530262120"
      }
    },
    "cancelReason": "Hoàn tất kiểm thử demo"
  }
], { relaxed: false }), { ordered: true });
  if (target.getCollection("warranty_requests").countDocuments({}) !== 3) throw new Error("Count mismatch: warranty_requests");

  print("Restored 700 documents in 26 collections to " + targetName);
})();
