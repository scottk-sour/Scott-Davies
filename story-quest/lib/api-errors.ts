import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Custom error class for application errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Predefined error types for common scenarios
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'You must be logged in to access this resource') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to access this resource') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input data', details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

// Error response formatter
interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: Record<string, any>
  }
}

export function formatErrorResponse(
  message: string,
  code?: string,
  details?: Record<string, any>
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  }
}

// Main error handler for API routes
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Log error for debugging (in production, send to monitoring service)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      formatErrorResponse(error.message, error.code, error.details),
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const path = err.path.join('.')
      acc[path] = err.message
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(
      formatErrorResponse('Invalid input data. Please check your fields.', 'VALIDATION_ERROR', details),
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'field'
      return NextResponse.json(
        formatErrorResponse(`A record with this ${field} already exists`, 'CONFLICT'),
        { status: 409 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        formatErrorResponse('The requested resource was not found', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      return NextResponse.json(
        formatErrorResponse('Invalid reference. The related resource does not exist.', 'INVALID_REFERENCE'),
        { status: 400 }
      )
    }

    // Generic Prisma error
    return NextResponse.json(
      formatErrorResponse('A database error occurred. Please try again.', 'DATABASE_ERROR'),
      { status: 500 }
    )
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      formatErrorResponse('Invalid data format. Please check your input.', 'VALIDATION_ERROR'),
      { status: 400 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    // In production, don't expose internal error messages
    const message = process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred. Please try again.'

    return NextResponse.json(
      formatErrorResponse(message, 'INTERNAL_ERROR'),
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    formatErrorResponse('An unexpected error occurred. Please try again.', 'UNKNOWN_ERROR'),
    { status: 500 }
  )
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

// User-friendly error messages for common scenarios
export const ErrorMessages = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Please log in to continue',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',

  // Children
  CHILD_NOT_FOUND: 'Child profile not found. Please check and try again.',
  CANNOT_DELETE_CHILD: 'Cannot delete this child profile as it has active reading sessions.',
  MAX_CHILDREN_REACHED: 'You have reached the maximum number of children for your plan.',

  // Stories
  STORY_NOT_FOUND: 'Story not found. It may have been removed or is no longer available.',
  STORY_NOT_PUBLISHED: 'This story is not yet published. Please check back later.',
  STORY_ACCESS_DENIED: 'You do not have access to this story. Please upgrade your plan.',

  // Reading Sessions
  SESSION_NOT_FOUND: 'Reading session not found. It may have been deleted.',
  SESSION_ALREADY_COMPLETED: 'This reading session has already been completed.',
  CANNOT_RESUME_SESSION: 'Cannot resume this session. Please start a new one.',

  // Subscriptions
  SUBSCRIPTION_REQUIRED: 'This feature requires a subscription. Please upgrade to continue.',
  SUBSCRIPTION_CANCELLED: 'Your subscription has been cancelled.',
  PAYMENT_FAILED: 'Payment failed. Please update your payment method.',

  // Professional Features
  DBS_VERIFICATION_REQUIRED: 'DBS verification is required to access professional features.',
  NOT_A_PROFESSIONAL: 'This feature is only available to verified professionals.',

  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts. Please try again in 15 minutes.',

  // Validation
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match. Please try again.',
  INVALID_AGE: 'Age must be between 1 and 18 years.',
  REQUIRED_FIELD: 'This field is required.',

  // Network
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  INTERNAL_ERROR: 'An internal error occurred. We have been notified and are working on it.',
  MAINTENANCE: 'The service is temporarily unavailable for maintenance. Please try again later.',
} as const

// Helper function to create user-friendly error messages
export function createErrorMessage(
  key: keyof typeof ErrorMessages,
  customMessage?: string
): string {
  return customMessage || ErrorMessages[key]
}
