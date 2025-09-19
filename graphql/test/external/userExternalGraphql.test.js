const request = require('supertest');
const { expect } = require('chai');

const loginUser = require('../fixture/requisicoesCheckout/loginUser.json');
const registroDeUser = require('../fixture/requisicoesUser/registroDeUsuario.json');
const registroDeUserCadastrado = require('../fixture/requisicoesUser/registroDeUsuarioJaCadastrado.json');
const loginUsuarioInvalido = require('../fixture/requisicoesUser/loginUsuarioInvalido.json');

describe('Testando a API externa de Usuario com o GraphQL', () => {
        
    it('Registrar um Usuario com Sucesso, deve retornar 200', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(registroDeUser);            
        expect(resposta.status).to.equal(200);
        const { name, email } = resposta.body.data.register;
        expect(name).to.equal(registroDeUser.variables.name);
        expect(email).to.equal(registroDeUser.variables.email);
    });

    it('Registrar um Usuario com email ja cadastrado, esta retornando 200, mais deve exibir um erro', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(registroDeUserCadastrado);            
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Email já cadastrado');
    });
    
    it('Realizar login com um Usuario cadastrado, deve retornar 200', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(loginUser);            
        expect(resposta.status).to.equal(200);
        expect(resposta.body.data.login).to.have.property('token');
    });

    it('Realizar login com um Usuario invalido, está retornando 200, mas deve vir mensagem de erro', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(loginUsuarioInvalido);            
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Credenciais inválidas');
    });
});
