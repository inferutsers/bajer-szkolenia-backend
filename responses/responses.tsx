export function serviceUnavailable(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 503}) }
export function noContent(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 204}) }
export function badRequest(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 400}) }
export function notFound(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 404}) }
export function notAllowed(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 405}) }
export function notAcceptable(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 406}) }
export function unprocessableContent(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 422}) }
export function unauthorized(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 401}) }
export function gone(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 410}) }
export function conflict(error: String | null = null): Response { return Response.json({errorMessage: error}, {status: 409}) }