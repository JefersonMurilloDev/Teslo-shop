<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Teslo Shop

## Tecnologías

- NestJS 11
- PostgreSQL 16
- TypeScript
- Docker

## Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd teslo-shop
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Clonar el archivo `.env.template` y renombrarlo a `.env`

```bash
cp .env.template .env
```

Configurar las variables de entorno en el archivo `.env`

### 4. Levantar la base de datos

```bash
docker-compose up -d
```
### 5. Ejecutar SEED

```postman GET
http://localhost:3000/api/seed
```

### 6. Ejecutar la aplicación

```bash
# desarrollo
npm run start:dev

# producción
npm run start:prod
```

## Documentación

La documentación de la API estará disponible en: `http://localhost:3000/api`

