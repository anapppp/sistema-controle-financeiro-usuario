# API para Controle Financeiro

<img src="https://media.tenor.com/r4xnbvrrXBwAAAAC/no-more-needless-spending-randy-marsh.gif" width="300"/>

Esta é uma API de controle financeiro desenvolvida durante o Desafio Módulo 3 do curso de desenvolvimento de software com foco em backend da [Cubos Academy](https://cubos.academy/cursos/desenvolvimento-de-software). Aqui, exercitamos a conexão com banco de dados SQL e o login de usuários usando criptografia. 

O desafio foi feito em dupla, com contribuições da maravilhosa [Elany Peixoto](https://github.com/develany) 🫰.


## Descrição
Este projeto é uma API simples para controle financeiro, desenvolvida em Node.js e Express. Permite o cadastro de usuários, gerenciamento de transações e categorias.

## Como Usar
1. Clone o repositório: `git clone git@github.com:anapppp/sistema-controle-financeiro-usuario.git`
2. Instale as dependências: `npm install`
3. Configure o banco de dados no arquivo `./src/conexao.js`
4. Inicie o servidor: `npm run dev`
5. Acesse a API em `http://localhost:3000`

## Scripts SQL:
Você precisa criar um Banco de Dados PostgreSQL chamado `dindin` contendo as seguintes tabelas:
- Arquivo para criar as tabelas: [cria_tabelas.sql](./cria_tabelas.sql)
- Arquivo para inserir categorias: [categorias.sql](./categorias.sql)

## Endpoints do usuário

- `POST /usuario`: Cadastrar usuário
- `POST /login`: Login do usuário
- `GET /usuario`: Detalhar o perfil do usuario
- `PUT /usuario`: Editar dados do usuário

### Exemplo de Cadastro de Usuário ou Edição de dados do usuário
```json
{
    "nome": "Paula",
    "email": "paula@email.com",
    "senha": "123"
}
```

### Exemplo de Login
```json
{
    "email": "paula@email.com",
    "senha": "123"
}
```

## Endpoints de transação

- `GET /categoria`: Listar Categorias
- `GET /transacao`: Listar Transações do Usuário Logado, filtrando por categoria
- `GET /transacao/:id`: Detalhar Transação do Usuário Logado
- `POST /transacao`: Cadastrar Transação para o Usuário Logado
- `PUT /transacao/:id`: Editar Transação do Usuário Logado
- `DELETE /transacao/:id`: Excluir Transação do Usuário Logado
- `GET /transacao/extrato`: Obter o extrato das transações do Usuário Logado

### Listando Transações do Usuário Logado

O usuário pode opcionalmente filtrar as transações por categoria usando um parâmetro do tipo query na URL. Exemplo:

`http://localhost:3000/transacao?filtro[]=Educação&filtro[]=Mercado&filtro[]=Roupas`

### Exemplo de Cadastro ou Edição de Transação

```json
{
    "tipo": "saida",
    "descricao": "curso de ingles",
    "valor": 3100,
    "data": "2022-03-24T15:30:00.000Z",
    "categoria_id": 11
}
```

## Notas
- Contribuições são bem-vindas
