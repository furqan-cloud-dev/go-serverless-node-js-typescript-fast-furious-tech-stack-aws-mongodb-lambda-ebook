import { APIGatewayProxyResult } from "aws-lambda";

export function sendErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message,
        }),
    };
}

// Unix timestamp (in seconds):
function getUnixTimeStamp() {
    return Math.round(+new Date() / 1000);
}

// ISO format (ISO 8601)
function getCurrentISODate() {
    const today = new Date().toISOString();
    return today;
}

export function appendDateForNewDoc(jsonParameters: any) {
    const doc = {
        ...jsonParameters,
        createdAt: getUnixTimeStamp(),
        createdAtISODate: getCurrentISODate(),
    };
    return doc;
}