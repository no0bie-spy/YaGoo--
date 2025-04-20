import Joi from 'joi';

const rideValidation = {
  findRide: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
      }),
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
