export type ValidationStatus = 'empty' | 'valid' | 'invalid';

export interface JsonValidation {
  status: ValidationStatus;
  message: string;
}

export function validateJson(value: string): JsonValidation {
  if (!value.trim()) {
    return {
      status: 'empty',
      message: 'empty',
    };
  }

  try {
    JSON.parse(value);
    return {
      status: 'valid',
      message: 'valid',
    };
  } catch (err) {
    return {
      status: 'invalid',
      message: (err as Error).message,
    };
  }
}
