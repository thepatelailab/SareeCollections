
'use client';

/**
 * @fileOverview Pure TypeScript error class for Firestore permissions.
 * CRITICAL: This file contains NO imports from any Firebase SDK to prevent 
 * Vercel prototype crashes during server-side evaluation.
 */

export type SecurityRuleContext = {
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
    
    // Ensure correct prototype chain
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
