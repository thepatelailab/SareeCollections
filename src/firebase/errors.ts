'use client';

/**
 * @fileOverview Safe error handling for Firestore permissions.
 * Refactored to be a pure utility class with no Firebase SDK dependencies
 * to prevent "prototype" crashes during Server-Side Rendering (SSR).
 */

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface SecurityRuleRequest {
  auth: any | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  return {
    auth: null,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
    
    // Ensure the prototype is set correctly for custom errors without relying on SDK prototypes
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
