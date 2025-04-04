# Docker Setup for DevBoard Application

This project includes Docker configuration to easily set up and run the application.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git repository cloned to your local machine

## Running with Docker Compose

1. Build and start the containers:

```bash
docker compose up -d
```

This command will:
- Build the Node.js application using Node v23
- Start a MySQL 8.0 database
- Connect the application to the database
- Make the application available at http://localhost:3000
- MySQL will be exposed on port 3307 on your host machine

Note that after it starts the container, it may take up to 30 seconds to a minute to initialize the first run as it it needs to optimize indeces and create the admin account, etc.

1. To stop the containers:

```bash
docker compose down
```

3. To stop the containers and remove the volumes (this will delete all data in the database):

```bash
docker compose down -v
```

## Configuration

The docker-compose.yml file includes default environment variables:

- Database credentials:
  - User: dbuser
  - Password: dbpassword
  - Database name: programming_channel_db
  - Host port: 3307 (mapped to internal port 3306)

- Admin account:
  - Username: admin
  - Password: admin_password

You can modify these values in the docker-compose.yml file for security purposes before building the containers.

## Persistent Data

- MySQL data is stored in a Docker volume named `mysql_data`
- Uploads are stored in a bind mount to the local `./server/uploads` directory

## Accessing the MySQL Database

To connect to the MySQL database from your host machine:
- Host: localhost
- Port: 3307
- User: dbuser
- Password: dbpassword
- Database: programming_channel_db

## Logs

To view logs for the running containers:

```bash
# View all logs
docker compose logs

# Follow logs
docker compose logs -f

# View specific service logs
docker compose logs app
docker compose logs db
```

## Rebuilding

If you make changes to the application code, rebuild the container with:

```bash
docker compose up -d --build
```