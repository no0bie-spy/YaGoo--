import Joi from 'joi';

const userValidation = {
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
      }),

      fullname: Joi.string().min(3).required().messages({
        'any.required': 'Fullname is required',
      }),

      password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
      }),

      phone: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          'string.length': 'Phone number must be exactly 10 digits',
          'string.pattern.base': 'Phone number must contain only digits',
          'any.required': 'Phone number is required',
        }),

      role: Joi.string()
        .valid('customer', 'rider', 'admin')
        .required()
        .messages({
          'any.required': 'Role is required',
          'any.only': 'Role must be customer, rider or admin',
        }),

      // Rider-specific fields (conditionally required)
      licenseNumber: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'License number is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      licensePhoto: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'License photo is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      citizenshipNumber: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Citizenship number is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      citizenshipPhoto: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Citizenship photo is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      vehicleType: Joi.when('role', {
        is: 'rider',
        then: Joi.string()
          .valid('bike', 'car', 'scooter', 'others')
          .required()
          .messages({
            'any.required': 'Vehicle type is required for riders',
            'any.only':
              'Vehicle type must be one of bike, car, scooter, others',
          }),
        otherwise: Joi.optional(),
      }),

      vehicleName: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Vehicle name is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      vehicleModel: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Vehicle model is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      vehiclePhoto: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Vehicle photo is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      vehicleNumberPlate: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Vehicle number plate is required for riders',
        }),
        otherwise: Joi.optional(),
      }),

      vehicleNumberPlatePhoto: Joi.when('role', {
        is: 'rider',
        then: Joi.string().required().messages({
          'any.required': 'Vehicle number plate photo is required for riders',
        }),
        otherwise: Joi.optional(),
      }),
    }),
  },
  login:{
    body: Joi.object({
        email: Joi.string().email().required().messages({
          'any.required': 'Email is required',
          'string.email': 'Invalid email format',
        }),
         password: Joi.string().min(6).required().messages({
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
          }), 
    })
}};

export default userValidation;
