import { NextResponse } from 'next/server';

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { message, code, details },
    },
    { status }
  );
}
