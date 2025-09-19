const request = require('supertest');
const { expect } = require('chai');
const url = 'http://localhost:3000';
const caminhoLogin = '/api/users/login';
const caminhoRegistro = '/api/users/register';

describe('Testando a API externa de Usuario, Login e Registro', () => {
    it('Registrar um usuario com sucesso, deve retornar 201', async () => {
        const resposta = await request(url)
            .post(caminhoRegistro)
            .send({
                name: 'Singrid',
                email: 'singrid@email.com',
                password: '123456'
            });
        expect(resposta.status).to.equal(201);
        expect(resposta.body.user).to.deep.equal({name: 'Singrid', email: 'singrid@email.com'});
    });

    it('Registrar um usuario com e-mail ja existente, deve retornar 400', async () => {
        const resposta = await request(url)
            .post(caminhoRegistro)
            .send({
                name: 'Alice',
                email: 'alice@email.com',
                password: '123456'
            });
        expect(resposta.status).to.equal(400);
        expect(resposta.body).to.have.property('error', 'Email já cadastrado');
    });

    it('Realizar login com usuario valido, deve retornar 200', async () => {
        const resposta = await request(url)
            .post(caminhoLogin)
            .send({
                email: 'bob@email.com',
                password: '123456'
            });
        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('token');
    });

    it('Realizar login com usuario invalido, deve retornar 401', async () => {
        const resposta = await request(url)
            .post(caminhoLogin)
            .send({
                email: 'bob@email.com',
                password: 'erro234'
            });
        expect(resposta.status).to.equal(401);
        expect(resposta.body).to.have.property('error', 'Credenciais inválidas');
    });

});