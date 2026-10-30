// Soopi MongoDB: collections and indexes only
// Source: soopi_mongodb; captured at: 2026-10-30T04:52:25.462Z
// 26 collections; 52 indexes (including _id_).
// Set SOOPI_RESTORE_DB to choose an EMPTY target database.
// No collections or documents are dropped or overwritten.
// Attachment contents live on disk and must be copied separately.
(() => {
  const targetName = process.env.SOOPI_RESTORE_DB || "soopi_mongodb_schema";
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
  if (target.getCollection("accounts").countDocuments({}) !== 0) throw new Error("Count mismatch: accounts");

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
  if (target.getCollection("attachments").countDocuments({}) !== 0) throw new Error("Count mismatch: attachments");

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
  if (target.getCollection("audit_logs").countDocuments({}) !== 0) throw new Error("Count mismatch: audit_logs");

  // Collection: brands (3 documents in source).
  target.createCollection("brands", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("brands").countDocuments({}) !== 0) throw new Error("Count mismatch: brands");

  // Collection: counters (23 documents in source).
  target.createCollection("counters", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("counters").countDocuments({}) !== 0) throw new Error("Count mismatch: counters");

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
  if (target.getCollection("devices").countDocuments({}) !== 0) throw new Error("Count mismatch: devices");

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
  if (target.getCollection("employees").countDocuments({}) !== 0) throw new Error("Count mismatch: employees");

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
  if (target.getCollection("notifications").countDocuments({}) !== 0) throw new Error("Count mismatch: notifications");

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
  if (target.getCollection("parts").countDocuments({}) !== 0) throw new Error("Count mismatch: parts");

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
  if (target.getCollection("payments").countDocuments({}) !== 0) throw new Error("Count mismatch: payments");

  // Collection: products (6 documents in source).
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
  if (target.getCollection("quotations").countDocuments({}) !== 0) throw new Error("Count mismatch: quotations");

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
  if (target.getCollection("refresh_tokens").countDocuments({}) !== 0) throw new Error("Count mismatch: refresh_tokens");

  // Collection: service_prices (1 documents in source).
  target.createCollection("service_prices", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("service_prices").countDocuments({}) !== 0) throw new Error("Count mismatch: service_prices");

  // Collection: service_stations (1 documents in source).
  target.createCollection("service_stations", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("service_stations").countDocuments({}) !== 0) throw new Error("Count mismatch: service_stations");

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
  if (target.getCollection("stock_issues").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_issues");

  // Collection: stock_receipts (4 documents in source).
  target.createCollection("stock_receipts", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("stock_receipts").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_receipts");

  // Collection: stock_transfers (3 documents in source).
  target.createCollection("stock_transfers", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("stock_transfers").countDocuments({}) !== 0) throw new Error("Count mismatch: stock_transfers");

  // Collection: suppliers (1 documents in source).
  target.createCollection("suppliers", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("suppliers").countDocuments({}) !== 0) throw new Error("Count mismatch: suppliers");

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
  if (target.getCollection("tickets").countDocuments({}) !== 0) throw new Error("Count mismatch: tickets");

  // Collection: warranty_policies (1 documents in source).
  target.createCollection("warranty_policies", EJSON.deserialize({}, { relaxed: false }));
  if (target.getCollection("warranty_policies").countDocuments({}) !== 0) throw new Error("Count mismatch: warranty_policies");

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
  if (target.getCollection("warranty_requests").countDocuments({}) !== 0) throw new Error("Count mismatch: warranty_requests");

  print("Restored 0 documents in 26 collections to " + targetName);
})();
