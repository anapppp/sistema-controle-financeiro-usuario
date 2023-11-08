CREATE DATABASE dindin;

CREATE TABLE usuarios (
  id serial primary key,
  nome text not null,
  email text unique not null,
  senha text not null
);

CREATE TABLE categorias (
  id serial primary key,
  descricao text
);

CREATE TABLE transacoes (
  id serial primary key,
  descricao text,
  valor integer not null, 
  data timestamp default now(),
  categoria_id integer references categorias(id),
  usuario_id integer references usuarios(id),
  tipo text not null
);