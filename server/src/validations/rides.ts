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
  }
};

export default rideValidation;
