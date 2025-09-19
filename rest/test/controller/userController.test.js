const request = require('supertest');
const app = require('../../../rest/app');
const sinon = require('sinon');
const { expect } = require('chai');
const userService = require('../../../src/services/userService');

describe('Testando registro e Login de usuario usando Mocks', () => {  
    
    it('Usando Mocks: Deve realizar um registro de usuario com sucesso, deve retornar 201', async () => {
        const userServiceMock = sinon.stub(userService, 'registerUser');
        userServiceMock.returns({ name: 'Singrid Palmeira', email: 'singrid@email.com', password: '123456' });
        const respostaRegister = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Singrid Palmeira',
                email: 'singrid@email.com',
                password: '123456'
            });
        expect(respostaRegister.status).to.equal(201);
        expect(respostaRegister.body).to.deep.equal({   user: { name: 'Singrid Palmeira', email: 'singrid@email.com', password: '123456' } });
    });

    it('Usando Mocks: Deve exibir erro ao tentar cadastrar um email ja existente, deve retornar 400', async () => {
        const userServiceMock = sinon.stub(userService, 'registerUser');
        userServiceMock.returns(null);
        const respostaRegister = await request(app)
            .post('/api/users/register')
            .send({
                name: 'Alice Maria',
                email: 'alice@email.com',
                password: '1234'
            });
    
        expect(respostaRegister.status).to.equal(400);
        expect(respostaRegister.body).to.have.property('error', 'Email já cadastrado');
    });

    it('Usando Mocks: Realizar login com credenciais invalidas, deve retornar 401', async () => {
        const userServiceMock = sinon.stub(userService, 'authenticate');
        userServiceMock.returns(null); 
        const respostaLogin = await request(app)
            .post('/api/users/login')
            .send({
                email: 'alice@email.com',
                password: 'error123'
            });
        expect(respostaLogin.status).to.equal(401);
        expect(respostaLogin.body).to.have.property('error', 'Credenciais inválidas');
    });

    it('Usando Mocks: Realizar login com credenciais validas, deve retornar 200', async () => {
        const userServiceMock = sinon.stub(userService, 'authenticate');
        userServiceMock.returns({ token: 'valid.token.here' }); 
        const respostaLogin = await request(app)
            .post('/api/users/login')
            .send({
                email: 'alice@email.com',
                password: '123456'
            });
        expect(respostaLogin.status).to.equal(200);
        expect(respostaLogin.body).to.deep.equal({ token: 'valid.token.here' });
    });

    afterEach(() => {
		sinon.restore();
	});
})