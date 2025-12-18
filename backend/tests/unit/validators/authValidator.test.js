// tests/unit/validators/authValidators.test.js
const { validationResult } = require('express-validator');
const { loginValidator } = require('../../../validators/authValidator.js');

describe('Auth Validators - loginValidator', () => {
  let req;

  beforeEach(() => {
    req = {
      body: {}
    };
  });

  const runValidation = async (bodyData) => {
    req.body = bodyData;
    
    // Ejecutar todas las validaciones
    for (const validation of loginValidator) {
      await validation.run(req);
    }
    
    return validationResult(req);
  };

  describe('Validación de email', () => {
    test('debe aceptar email válido', async () => {
      const result = await runValidation({
        email: 'usuario@empresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(true);
      expect(result.array()).toHaveLength(0);
    });

    test('debe rechazar email sin @', async () => {
      const result = await runValidation({
        email: 'usuarioempresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()).toHaveLength(1);
      expect(result.array()[0].msg).toBe('Email inválido');
      expect(result.array()[0].path).toBe('email');
    });

    test('debe rechazar email sin dominio', async () => {
      const result = await runValidation({
        email: 'usuario@',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Email inválido');
    });

    test('debe rechazar email con formato inválido', async () => {
      const result = await runValidation({
        email: '@empresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Email inválido');
    });

    test('debe aceptar emails con subdominios', async () => {
      const result = await runValidation({
        email: 'usuario@subdominio.empresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar emails con puntos en la parte local', async () => {
      const result = await runValidation({
        email: 'usuario.nombre@empresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar emails con guiones', async () => {
      const result = await runValidation({
        email: 'usuario-nombre@empresa.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe rechazar email vacío', async () => {
      const result = await runValidation({
        email: '',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Email inválido');
    });

    test('debe rechazar si falta campo email', async () => {
      const result = await runValidation({
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Email inválido');
    });
  });

  describe('Validación de password', () => {
    test('debe aceptar contraseña válida con 8 caracteres', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Pass1234' // 8 caracteres exactos
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña válida con 16 caracteres', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Password1234567' // 16 caracteres exactos
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con caracteres especiales', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'P@ssw0rd123' // Con caracteres especiales
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe rechazar contraseña sin mayúscula', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'password123' // Sin mayúscula
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
      expect(result.array()[0].path).toBe('password');
    });

    test('debe rechazar contraseña sin minúscula', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'PASSWORD123' // Sin minúscula
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe rechazar contraseña sin número', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Password' // Sin número
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe rechazar contraseña muy corta (7 caracteres)', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Pass123' // 7 caracteres
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe rechazar contraseña muy larga (17 caracteres)', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Password123456789' // 17 caracteres
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe rechazar contraseña vacía', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: ''
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe rechazar si falta campo password', async () => {
      const result = await runValidation({
        email: 'test@test.com'
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe aceptar contraseña con mayúscula al inicio', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Password123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con mayúscula en medio', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'passWord123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con mayúscula al final', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'password123X'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con número al inicio', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: '1Password'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con número en medio', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Pass1word'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con número al final', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Password1'
      });
      
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('Validaciones combinadas', () => {
    test('debe acumular errores de email y password', async () => {
      const result = await runValidation({
        email: 'email-invalido',
        password: 'pass' // Muy corta y sin mayúscula/número
      });
      
      expect(result.isEmpty()).toBe(false);
      expect(result.array()).toHaveLength(2);
      
      const errors = result.array();
      expect(errors[0].path).toBe('email');
      expect(errors[0].msg).toBe('Email inválido');
      
      expect(errors[1].path).toBe('password');
      expect(errors[1].msg).toBe('La contraseña debe tener 8-16 caracteres, incluir mayúscula, minúscula y un número');
    });

    test('debe pasar validación con datos completamente válidos', async () => {
      const result = await runValidation({
        email: 'admin@empresa.com',
        password: 'AdminSecure789'
      });
      
      expect(result.isEmpty()).toBe(true);
      expect(result.array()).toHaveLength(0);
    });

    test('debe validar email antes que password (orden de ejecución)', async () => {
      const result = await runValidation({
        email: 'invalido',
        password: 'invalida'
      });
      
      expect(result.array()).toHaveLength(2);
    });
  });

  describe('Casos edge para regex de password', () => {
    test('debe rechazar contraseña con solo espacios', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: '        '
      });
      
      expect(result.isEmpty()).toBe(false);
    });

    test('debe aceptar contraseña con tabs si cumple regex (los tabs son caracteres válidos)', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: '\t\tPass123\t\t'
      });
      
      // Tu regex actual PERMITE tabs porque .{8,16} acepta cualquier carácter
      // 'Pass123' tiene mayúscula, minúscula, número
      // Los tabs cuentan para la longitud total (12 caracteres)
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con acentos (si los permite la regex)', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Pásswórd123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar contraseña con caracteres Unicode', async () => {
      const result = await runValidation({
        email: 'test@test.com',
        password: 'Påsswørd123'
      });
      
      expect(result.isEmpty()).toBe(true);
    });

    test('debe aceptar que tabs son caracteres válidos en la regex actual', () => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,16}$/;
      
      // Verifica que la regex actual SÍ acepta tabs
      expect(passwordRegex.test('\t\tPass123\t\t')).toBe(true);
      
      // Verificación manual de los requisitos
      const passwordWithTabs = '\t\tPass123\t\t';
      const hasUpperCase = /[A-Z]/.test(passwordWithTabs); // true (P)
      const hasLowerCase = /[a-z]/.test(passwordWithTabs); // true (a,s,s)
      const hasNumber = /\d/.test(passwordWithTabs);       // true (1,2,3)
      const correctLength = passwordWithTabs.length >= 8 && passwordWithTabs.length <= 16; // true (12)
      
      expect(hasUpperCase && hasLowerCase && hasNumber && correctLength).toBe(true);
    });
  });
});