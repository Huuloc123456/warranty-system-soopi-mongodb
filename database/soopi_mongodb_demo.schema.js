// Soopi MongoDB: collections and indexes only
// Source: soopi_mongodb_demo; captured at: 2026-10-30T04:52:26.668Z
// 26 collections; 54 indexes (including _id_).
// Set SOOPI_RESTORE_DB to choose an EMPTY target database.
// No collections or documents are dropped or overwritten.
// Attachment contents live on disk and must be copied separately.
(() => {
  const targetName = process.env.SOOPI_RESTORE_DB || "soopi_mongodb_demo_schema";
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(targetName) || ["admin", "local", "config", "service_center"].includes(targetName.toLowerCase())) {
    throw new Error("Invalid target database: " + targetName);
  }
  const target = db.getSiblingDB(targetName);
  if (target.getCollectionInfos().length !== 0) {
    throw new Error("Target database already has collections: " + targetName + ". Choose an empty database with SOOPI_RESTORE_DB.");
  }

  // Collection: accounts (10 documents in source).
  target.createCollection("accounts", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("accounts").createIndex(EJSON.deserialize({
  "username": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "account_username",
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
  if (target.getCollection("accounts").countDocuments({}) !== 0) throw new Error("Count mismatch: accounts");

  // Collection: attachments (171 documents in source).
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
  if (target.getCollection("attachments").countDocuments({}) !== 0) throw new Error("Count mismatch: attachments");

  // Collection: audit_logs (2153 documents in source).
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
  if (target.getCollection("audit_logs").countDocuments({}) !== 0) throw new Error("Count mismatch: audit_logs");

  // Collection: brands (11 documents in source).
  target.createCollection("brands", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("brands").countDocuments({}) !== 0) throw new Error("Count mismatch: brands");

  // Collection: counters (214 documents in source).
  target.createCollection("counters", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("counters").countDocuments({}) !== 0) throw new Error("Count mismatch: counters");

  // Collection: customers (95 documents in source).
  target.createCollection("customers", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Khách hàng",
      "required": [
        "_id",
        "fullName",
        "phone",
        "status",
        "createdAt"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^KH-"
        },
        "fullName": {
          "bsonType": "string",
          "minLength": {
            "$numberInt": "1"
          }
        },
        "phone": {
          "bsonType": "string",
          "pattern": "^0\\d{9,10}$"
        },
        "email": {
          "bsonType": [
            "string",
            "null"
          ]
        },
        "status": {
          "enum": [
            "ACTIVE",
            "ARCHIVED",
            "MERGED"
          ]
        },
        "createdAt": {
          "bsonType": "date"
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  if (target.getCollection("customers").countDocuments({}) !== 0) throw new Error("Count mismatch: customers");

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
  if (target.getCollection("device_categories").countDocuments({}) !== 0) throw new Error("Count mismatch: device_categories");

  // Collection: devices (196 documents in source).
  target.createCollection("devices", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Thiết bị",
      "required": [
        "_id",
        "productId",
        "identifierType",
        "serialNormalized",
        "customerId"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^TB-"
        },
        "identifierType": {
          "enum": [
            "IMEI",
            "SERIAL"
          ]
        },
        "serialNormalized": {
          "bsonType": "string",
          "minLength": {
            "$numberInt": "1"
          }
        },
        "warrantyActivatedOn": {
          "bsonType": [
            "string",
            "null"
          ],
          "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
        },
        "warrantyExpiresOn": {
          "bsonType": [
            "string",
            "null"
          ],
          "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  if (target.getCollection("devices").countDocuments({}) !== 0) throw new Error("Count mismatch: devices");

  // Collection: employees (9 documents in source).
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
  if (target.getCollection("employees").countDocuments({}) !== 0) throw new Error("Count mismatch: employees");

  // Collection: notifications (1261 documents in source).
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
  if (target.getCollection("notifications").countDocuments({}) !== 0) throw new Error("Count mismatch: notifications");

  // Collection: otp_codes (0 documents in source).
  target.createCollection("otp_codes", EJSON.deserialize({}, { relaxed: false }));
  target.getCollection("otp_codes").createIndex(EJSON.deserialize({
  "expiresAt": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "otp_expiry",
  "expireAfterSeconds": {
    "$numberInt": "86400"
  }
}, { relaxed: false }));
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

  // Collection: parts (14 documents in source).
  target.createCollection("parts", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Linh kiện",
      "required": [
        "_id",
        "name",
        "onHand",
        "reserved",
        "servicePrice",
        "active"
      ],
      "properties": {
        "name": {
          "bsonType": "string",
          "minLength": {
            "$numberInt": "1"
          }
        },
        "onHand": {
          "bsonType": [
            "int",
            "long"
          ],
          "minimum": {
            "$numberInt": "0"
          }
        },
        "reserved": {
          "bsonType": [
            "int",
            "long"
          ],
          "minimum": {
            "$numberInt": "0"
          }
        },
        "minLevel": {
          "bsonType": [
            "int",
            "long"
          ],
          "minimum": {
            "$numberInt": "0"
          }
        },
        "costPrice": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "servicePrice": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "bins": {
          "bsonType": "array",
          "items": {
            "bsonType": "object",
            "required": [
              "binCode",
              "qty"
            ],
            "properties": {
              "qty": {
                "bsonType": [
                  "int",
                  "long"
                ],
                "minimum": {
                  "$numberInt": "0"
                }
              }
            }
          }
        },
        "active": {
          "bsonType": "bool"
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
  if (target.getCollection("parts").countDocuments({}) !== 0) throw new Error("Count mismatch: parts");

  // Collection: payments (172 documents in source).
  target.createCollection("payments", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Phiếu thu",
      "required": [
        "_id",
        "ticketId",
        "type",
        "paidAt",
        "amount",
        "method",
        "cashierId"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^PT-"
        },
        "ticketId": {
          "bsonType": "string"
        },
        "type": {
          "enum": [
            "CHARGED",
            "FREE_WARRANTY"
          ]
        },
        "paidAt": {
          "bsonType": "date"
        },
        "amount": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "method": {
          "enum": [
            "CASH",
            "BANK_TRANSFER",
            "E_WALLET",
            "CARD",
            "NONE"
          ]
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  if (target.getCollection("payments").countDocuments({}) !== 0) throw new Error("Count mismatch: payments");

  // Collection: products (19 documents in source).
  target.createCollection("products", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("products").countDocuments({}) !== 0) throw new Error("Count mismatch: products");

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

  // Collection: quotations (86 documents in source).
  target.createCollection("quotations", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Báo giá",
      "required": [
        "_id",
        "ticketId",
        "lines",
        "partsTotal",
        "laborTotal",
        "grandTotal",
        "vatRate",
        "approval",
        "customerDecision"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^BG-"
        },
        "ticketId": {
          "bsonType": "string"
        },
        "lines": {
          "bsonType": "array",
          "minItems": {
            "$numberInt": "1"
          },
          "items": {
            "bsonType": "object",
            "required": [
              "quantity"
            ],
            "properties": {
              "quantity": {
                "bsonType": [
                  "int",
                  "long"
                ],
                "minimum": {
                  "$numberInt": "1"
                }
              }
            }
          }
        },
        "partsTotal": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "laborTotal": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "grandTotal": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "vatRate": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          },
          "maximum": {
            "$numberInt": "100"
          }
        },
        "approval": {
          "bsonType": "object",
          "required": [
            "status"
          ],
          "properties": {
            "status": {
              "enum": [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "SUPERSEDED",
                "EXPIRED",
                "CANCELLED"
              ]
            }
          }
        },
        "customerDecision": {
          "bsonType": "object",
          "required": [
            "status"
          ],
          "properties": {
            "status": {
              "enum": [
                "PENDING",
                "ACCEPTED",
                "DECLINED"
              ]
            }
          }
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  if (target.getCollection("quotations").countDocuments({}) !== 0) throw new Error("Count mismatch: quotations");

  // Collection: refresh_tokens (45 documents in source).
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
  "name": "refresh_expiry",
  "expireAfterSeconds": {
    "$numberInt": "604800"
  }
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
  if (target.getCollection("refresh_tokens").countDocuments({}) !== 0) throw new Error("Count mismatch: refresh_tokens");

  // Collection: service_prices (4 documents in source).
  target.createCollection("service_prices", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("service_prices").countDocuments({}) !== 0) throw new Error("Count mismatch: service_prices");

  // Collection: service_stations (1 documents in source).
  target.createCollection("service_stations", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("service_stations").countDocuments({}) !== 0) throw new Error("Count mismatch: service_stations");

  // Collection: stock_issues (92 documents in source).
  target.createCollection("stock_issues", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Phiếu xuất kho",
      "required": [
        "_id",
        "ticketId",
        "source",
        "status",
        "lines"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^PX-"
        },
        "source": {
          "enum": [
            "QUOTATION",
            "FREE_WARRANTY"
          ]
        },
        "status": {
          "enum": [
            "PENDING",
            "ISSUED",
            "REJECTED",
            "CANCELLED",
            "RETURNED"
          ]
        },
        "lines": {
          "bsonType": "array",
          "minItems": {
            "$numberInt": "1"
          },
          "items": {
            "bsonType": "object",
            "required": [
              "sku",
              "quantity"
            ],
            "properties": {
              "quantity": {
                "bsonType": [
                  "int",
                  "long"
                ],
                "minimum": {
                  "$numberInt": "1"
                }
              }
            }
          }
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  if (target.getCollection("stock_issues").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_issues");

  // Collection: stock_receipts (8 documents in source).
  target.createCollection("stock_receipts", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("stock_receipts").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_receipts");

  // Collection: stock_transfers (0 documents in source).
  target.createCollection("stock_transfers", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("stock_transfers").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_transfers");

  // Collection: suppliers (1 documents in source).
  target.createCollection("suppliers", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("suppliers").countDocuments({}) !== 0) throw new Error("Count mismatch: suppliers");

  // Collection: tickets (210 documents in source).
  target.createCollection("tickets", EJSON.deserialize({
  "validator": {
    "$jsonSchema": {
      "bsonType": "object",
      "title": "Phiếu tiếp nhận",
      "required": [
        "_id",
        "stationCode",
        "receivedAt",
        "customerId",
        "deviceId",
        "status",
        "sla",
        "statusHistory",
        "open"
      ],
      "properties": {
        "_id": {
          "bsonType": "string",
          "pattern": "^TN-"
        },
        "receivedAt": {
          "bsonType": "date"
        },
        "customerId": {
          "bsonType": "string"
        },
        "deviceId": {
          "bsonType": "string"
        },
        "channel": {
          "enum": [
            "COUNTER",
            "MOBILE_APP",
            "ONLINE_REQUEST",
            "PHONE"
          ]
        },
        "requestType": {
          "enum": [
            "WARRANTY",
            "PAID_REPAIR"
          ]
        },
        "status": {
          "enum": [
            "RECEIVED",
            "INSPECTING",
            "DIAGNOSED",
            "AWAITING_QUOTE_APPROVAL",
            "AWAITING_CUSTOMER_CONFIRMATION",
            "AWAITING_PARTS",
            "AWAITING_RETURN",
            "REPAIRING",
            "COMPLETED",
            "DELIVERED",
            "RETURNED_UNREPAIRED"
          ]
        },
        "estimatedCost": {
          "bsonType": "decimal",
          "minimum": {
            "$numberInt": "0"
          }
        },
        "sla": {
          "bsonType": "object",
          "required": [
            "level",
            "dueAt"
          ],
          "properties": {
            "level": {
              "enum": [
                "EXPRESS_12H",
                "PRIORITY_24H",
                "STANDARD_48H"
              ]
            },
            "dueAt": {
              "bsonType": "date"
            }
          }
        },
        "statusHistory": {
          "bsonType": "array",
          "minItems": {
            "$numberInt": "1"
          },
          "items": {
            "bsonType": "object",
            "required": [
              "status",
              "at"
            ]
          }
        },
        "open": {
          "bsonType": "bool"
        },
        "version": {
          "bsonType": [
            "int",
            "long"
          ],
          "minimum": {
            "$numberInt": "0"
          }
        }
      }
    }
  },
  "validationLevel": "moderate",
  "validationAction": "error"
}, { relaxed: false }));
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
  target.getCollection("tickets").createIndex(EJSON.deserialize({
  "_fts": "text",
  "_ftsx": {
    "$numberInt": "1"
  }
}, { relaxed: false }), EJSON.deserialize({
  "name": "ticket_text",
  "weights": {
    "inspection.findings": {
      "$numberInt": "1"
    },
    "reportedIssue": {
      "$numberInt": "3"
    }
  },
  "default_language": "none",
  "language_override": "language",
  "textIndexVersion": {
    "$numberInt": "3"
  }
}, { relaxed: false }));
  if (target.getCollection("tickets").countDocuments({}) !== 0) throw new Error("Count mismatch: tickets");

  // Collection: warranty_policies (1 documents in source).
  target.createCollection("warranty_policies", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("warranty_policies").countDocuments({}) !== 0) throw new Error("Count mismatch: warranty_policies");

  // Collection: warranty_requests (28 documents in source).
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
  if (target.getCollection("warranty_requests").countDocuments({}) !== 0) throw new Error("Count mismatch: warranty_requests");

  print("Restored 0 documents in 26 collections to " + targetName);
})();
