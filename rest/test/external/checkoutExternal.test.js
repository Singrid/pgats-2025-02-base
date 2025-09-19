const request = require('supertest');
const { expect } = require('chai');

const url = 'http://localhost:3000';
const caminhocheckout = '/api/checkout';

describe('Testando a API externa de checkout', () => {
    beforeEach(async () => {
        const respostaLogin = await request(url)
            .post('/api/users/login')
            .send({
                email: 'bob@email.com',
                password: '123456'
            });

        token = respostaLogin.body.token;
    });
    it('Deve fazer checkout com sucesso retorno esperado 200', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 1, quantity: 2 }],
                freight: 10,
                paymentMethod: 'boleto',
            });
        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.deep.equal({
            userId: 2,
            items: [{ productId: 1, quantity: 2 }],
            freight: 10,
            paymentMethod: 'boleto',
            total: 210,
            valorFinal: 210
        });
    });

    it('Não deve conseguir realizar checkout por causa do toekn invalido, deve informar 401', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer token + '123'`)
            .send({
                items: [{ productId: 1, quantity: 2 }], 
                freight: 30,
                paymentMethod: 'boleto',
            });
        expect(resposta.status).to.equal(401);
        expect(resposta.body).to.have.property('error', 'Token inválido');
    });

    it('Não deve conseguir realizar checkout passando produtos invalidos, deve informar 400', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 999, quantity: 2 }], 
                freight: 30,
                paymentMethod: 'boleto',
            });
        expect(resposta.status).to.equal(400);
        expect(resposta.body).to.have.property('error', 'Produto não encontrado');
    });

    it('Validar o processo de finalização de uma compra no Boleto, deve informar 200', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 2, quantity: 3 }], 
                freight: 30,
                paymentMethod: 'boleto',
            });
        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('total', 630);
        expect(resposta.body).to.have.property('valorFinal', 630);
    });

    it('Validar o processo de finalização de uma compra no Cartão de Crédito. Lembrar que deve ser aplicado desconto de 5%, deve informar 200', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 1, quantity: 3 }], 
                freight: 60,
                paymentMethod: 'credit_card',
                cardData: {
                    number: '1234567890123456',
                    name: 'Bob',
                    expiration: '12/30',
                    cvv: '123'
                }
            });
        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('total', 342);
        expect(resposta.body).to.have.property('valorFinal', 342);
    });

    it('Validar que ao passar dados do cartão invalidos não é possivel concluir checkout, deve informar 400', async () => {
        const resposta = await request(url)
            .post(caminhocheckout)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: [{ productId: 1, quantity: 3 }], 
                freight: 60,
                paymentMethod: 'credit_card'
            });
        expect(resposta.status).to.equal(400);
        expect(resposta.body).to.have.property('error', 'Dados do cartão obrigatórios para pagamento com cartão');
    });
});