'use client';

/**
 * @fileOverview Safe error handling for Firestore permissions.
 * This file is now a pure utility to prevent SSR prototype crashes.
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

/**
 * Builds the simulated request object for the error message.
 */
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
  }
}
