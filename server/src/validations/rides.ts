import Joi from 'joi';

const rideValidation = {
  createRide: {
    body: Joi.object({
      customer_id: Joi.string().required().messages({
        'any.required': 'Customer ID is required',
        'string.base': 'Customer ID must be a valid string',
      }),
      start_location: Joi.string().required().messages({
        'any.required': 'Start location is required',
        'string.base': 'Start location must be a string',
      }),
      destination: Joi.string().required().messages({
        'any.required': 'Destination is required',
        'string.base': 'Destination must be a string',
      }),
      otp_start: Joi.string().required().messages({
        'any.required': 'OTP Start is required',
        'string.base': 'OTP Start must be a string',
      }),
      status: Joi.string()
        .valid('requested', 'matched', 'in-progress', 'completed', 'cancelled')
        .default('requested')
        .messages({
          'any.only': 'Status must be one of requested, matched, in-progress, completed, cancelled',
        }),
    }),
  },

  updateRideStatus: {
    body: Joi.object({
      status: Joi.string()
        .valid('requested', 'matched', 'in-progress', 'completed', 'cancelled')
        .required()
        .messages({
          'any.required': 'Status is required',
          'any.only': 'Status must be one of requested, matched, in-progress, completed, cancelled',
        }),
    }),
  },
};

export default rideValidation;
