import Joi from 'joi';

const coordinatesSchema = Joi.object({
  latitude: Joi.number().required().messages({
    'any.required': 'Latitude is required',
    'number.base': 'Latitude must be a number',
  }),
  longitude: Joi.number().required().messages({
    'any.required': 'Longitude is required',
    'number.base': 'Longitude must be a number',
  }),
});

const locationSchema = Joi.object({
  address: Joi.string().required().messages({
    'any.required': 'Address is required',
    'string.base': 'Address must be a string',
  }),
  coordinates: coordinatesSchema.required(),
});

const rideValidation = {
  findRide: {
    body: Joi.object({
      start_location: locationSchema.required(),
      destination: locationSchema.required(),
    }),
  },
  placeBid: {
    body: Joi.object({
      rideId: Joi.string().required().messages({
        'any.required': 'Ride ID is required',
        'string.base': 'Ride ID must be a string',
      }),
      amount: Joi.number().min(100).max(10000).required().messages({
        'any.required': 'Amount is required',
        'number.base': 'Amount must be a number',
        'number.min': 'Amount must be at least Rs. 100',
        'number.max': 'Amount must not exceed Rs. 10,000',
      }),
    }),
  },
};

export default rideValidation;
