const request = require('supertest');
const app = require('../../../rest/app');
const checkoutService = require('../../../src/services/checkoutService');
const sinon = require('sinon');
const { expect } = require('chai');

describe('Checkout usando Mocks para testar a API', () => {
   
    before(async () => {
        const respostaLogin = await request(app)
            .post('/api/users/login')
            .send({
                email: 'alice@email.com',
                password: '123456'
            });

        token = respostaLogin.body.token;
    });
    
    it('Usando Mocks: Deve fazer checkout com sucesso retorno esperado 200', async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.returns({
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
            freight: 10,
            paymentMethod: 'boleto',
            total: 100
        });
        const resposta = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 1, quantity: 2 }],
                freight: 10,
                paymentMethod: 'boleto',
                cardData: {
                    number: '1234.4567.8901.1121',
                    name: 'Singrid Palmeira',
                    expiry: '12/27',
                    cvv: '123'
                }
            });
        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.deep.equal({
            userId: 1,
            items: [{ productId: 1, quantity: 2 }],
            freight: 10,
            paymentMethod: 'boleto',
            total: 100,
            valorFinal: 100
        });
    });

    it('Usando Mocks: Não deve conseguir realizar checkout por causa do token invalido, deve informar 401', async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Token inválido'));
        const resposta = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer token + '123'`)
            .send({
                items: [{ productId: 1, quantity: 2 }], 
                freight: 30,
                paymentMethod: 'boleto',
                cardData: {
                    number: '1234.4567.8901.1121',
                    name: 'Singrid Palmeira',
                    expiry: '12/27',
                    cvv: '123'
                }
            });
        expect(resposta.status).to.equal(401);
        expect(resposta.body).to.deep.equal({error: 'Token inválido'});
    });

    it('Usando Mocks: Passando id de produto invalido, não deve conseguir realizar checkout, deve informar 400', async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'calculateTotal');
        checkoutServiceMock.throws(new Error('Produto não encontrado'));
        const resposta = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 3, quantity: 2 }], 
                freight: 30,
                paymentMethod: 'boleto',
                cardData: {
                    number: '1234.4567.8901.1121',
                    name: 'Singrid Palmeira',
                    expiry: '12/27',
                    cvv: '123'
                }
            });
        expect(resposta.status).to.equal(400);
        expect(resposta.body).to.deep.equal({error: 'Produto não encontrado'});
    });

    it('Usando Mocks: Passando dados de cartão invalido ao fazer checkout com cartão, deve informar 400', async () => {
        const checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
        checkoutServiceMock.throws(new Error('Dados do cartão obrigatórios para pagamento com cartão'));
        const resposta = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 1, quantity: 2 }], 
                freight: 10,
                paymentMethod: 'credit_card'
            });
        expect(resposta.status).to.equal(400);
        expect(resposta.body).to.have.property('error', 'Dados do cartão obrigatórios para pagamento com cartão');
    });

    afterEach(() => {
		sinon.restore();
	});
})