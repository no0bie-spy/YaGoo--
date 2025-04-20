import Joi from 'joi';

const rideValidation = {
  // Validation for setting user location
  setLocation: {
    body: Joi.object({
      user_id: Joi.string().required().messages({
        'any.required': 'User ID is required',
        'string.base': 'User ID must be a valid string',
      }),
      location: Joi.string().required().messages({
        'any.required': 'Location is required',
        'string.base': 'Location must be a string',
      }),
    }),
  },

  // Validation for creating a ride request (customer)
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

  // Validation for placing a bid on a ride (rider)
  bidRide: {
    body: Joi.object({
      rider_id: Joi.string().required().messages({
        'any.required': 'Rider ID is required',
        'string.base': 'Rider ID must be a valid string',
      }),
      ride_id: Joi.string().required().messages({
        'any.required': 'Ride ID is required',
        'string.base': 'Ride ID must be a valid string',
      }),
      bid_amount: Joi.number().required().messages({
        'any.required': 'Bid amount is required',
        'number.base': 'Bid amount must be a number',
      }),
    }),
  },

  // Validation for accepting a bid (customer)
  acceptBid: {
    body: Joi.object({
      ride_id: Joi.string().required().messages({
        'any.required': 'Ride ID is required',
        'string.base': 'Ride ID must be a valid string',
      }),
      bid_id: Joi.string().required().messages({
        'any.required': 'Bid ID is required',
        'string.base': 'Bid ID must be a valid string',
      }),
    }),
  },

  // Validation for updating the ride status (e.g., matched, in-progress, etc.)
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
