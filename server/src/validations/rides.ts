import Joi from 'joi';

const rideValidation = {
  findRide: {
    body: Joi.object({
      start_location: Joi.string().required().messages({
        'any.required': 'Start location is required',
        'string.base': 'Start location must be a string',
      }),
      destination: Joi.string().required().messages({
        'any.required': 'Destination is required',
        'string.base': 'Destination must be a string',
      }),
    }),
  },
  placeBid:{
    body: Joi.object({
      rideId: Joi.string().required().messages({
        'any.required': 'Ride ID is required',
        'string.base': 'Ride ID must be a string',
      }),
      amount: Joi.number().required().messages({
        'any.required': 'Amount is required',
        'number.base': 'Amount must be a number',
      }),
    }),
  }
};

export default rideValidation;
