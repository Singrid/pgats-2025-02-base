const request = require('supertest');
const { expect } = require('chai');

const loginUser = require('../fixture/requisicoesCheckout/loginUser.json');
const checkoutBoleto = require('../fixture/requisicoesCheckout/checkoutBoleto.json');
const checkoutCartao = require('../fixture/requisicoesCheckout/checkoutCartao.json');
const checkoutCartaoInvalido = require('../fixture/requisicoesCheckout/checkoutCartaoInvalido.json');
const produtoInvalido = require('../fixture/requisicoesCheckout/produtoInvalido.json');

describe('Testando a API externa de checkout com o GraphQL', () => {
    before(async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(loginUser);
        token = resposta.body.data.login.token;
    });
        
    it('Deve fazer checkout com sucesso usando boleto, deve retornar 200', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send(checkoutBoleto);            
        expect(resposta.status).to.equal(200);
        expect(resposta.body.data.checkout).to.have.property('valorFinal', 310);
    });

    it('Deve fazer checkout com sucesso usando cartão, deve retornar 200', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(checkoutCartao)
            .set('Authorization', `Bearer ${token}`);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.data.checkout).to.have.property('valorFinal', 389.5);
    });

    it('Não deve fazer checkout sem token. Está retornando 200, mas com mensagem de erro', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(checkoutBoleto)
            .set('Authorization', 'Bearer +invalidtoken');
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Token inválido');

    });

    it('Não deve fazer checkout sem passar os dados do cartão. Está retornando 200, mas com mensagem de erro', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(checkoutCartaoInvalido)
            .set('Authorization', `Bearer ${token}`);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Dados do cartão obrigatórios para pagamento com cartão');
    });

    it('Não deve fazer checkout sem passar os dados de um produto valido. Está retornando 200, mas com mensagem de erro', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send(produtoInvalido)
            .set('Authorization', `Bearer ${token}`);
        expect(resposta.status).to.equal(200);
        expect(resposta.body.errors[0].message).to.equal('Produto não encontrado');
    });
});
